<?php

declare(strict_types=1);

class CsvHistory
{
  const EXTERNAL_USER_ID = 0;
  private string $basePath;
  private string $historyPath;
  private int $maxDays;
  private int $minKeepVersions;

  /**
   * @param string $basePath путь до общей директории с исходными файлами
   * @param string $historyPath путь до общей директории бэкапами
   * @param int $maxDays максимальное количество дней хранения истории
   * @param int $minKeepVersions
   */
  public function __construct(string $basePath, string $historyPath, int $maxDays = 30, int $minKeepVersions = 1)
  {
    $this->basePath = rtrim($basePath, '/\\') . '/';
    $this->historyPath = rtrim($historyPath, '/\\') . '/';
    $this->maxDays = $maxDays;
    $this->minKeepVersions = max($minKeepVersions, 1);
  }

  /**
   * Сохраняет новую версию файла с созданием бэкапа
   * @param string $relativeFilePath Относительный путь к файлу
   * @param string $fileContent Содержимое файла
   * @param array $metaFields Дополнительные  бэкапа
   * @return string backupId
   */
  public function saveBackup(string $relativeFilePath, string $fileContent, array $metaFields = []): string
  {
    $history = $this->getHistoryList($relativeFilePath);

    $lastMetaFields = empty($history)
      ? $this->createInitialBackup($relativeFilePath)
      : $history[0];

    $metaFields['prevBackupId'] = $lastMetaFields['backupId'] ?? null;
    $newMetaFields = $this->createBackup($relativeFilePath, $fileContent, $metaFields);

    return $newMetaFields['backupId'];
  }

  /**
   * Создает начальный бэкап существующего файла, если нет истории
   * @param string $relativeFilePath
   * @return array
   * @throws RuntimeException
   */
  private function createInitialBackup(string $relativeFilePath): array
  {
    $historyDir = $this->getHistoryDir($relativeFilePath);

    if (!is_dir($historyDir) && !mkdir($historyDir, 0777, true)) {
      throw new \RuntimeException("Failed to create the history directory: {$historyDir}");
    }

    $filePath = $this->basePath . $relativeFilePath;

    if (!is_readable($filePath)) {
      throw new \RuntimeException("File not found or not readable: {$relativeFilePath}");
    }

    $oldContent = file_get_contents($filePath);

    if ($oldContent === false) {
      throw new \RuntimeException("Failed to read the source file: {$relativeFilePath}");
    }

    return $this->createBackup($relativeFilePath, $oldContent, [
      'note' => 'Initial backup from disk before first save',
      'prevBackupId' => null
    ]);
  }

  /**
   * Возвращает историю, и если текущий файл отличается — делает фейковый бэкап.
   * @param string $relativeFilePath относительный путь к файлу /price/00_price.csv
   * @return array массив метаданных бэкапов
   * @throws RuntimeException исходный файл не существует
   */
  public function getHistoryList(string $relativeFilePath): array
  {
    $historyDir = $this->getHistoryDir($relativeFilePath);
    $history = [];

    if (!is_readable($historyDir)) {
      return $history;
    }

    $files = glob($historyDir . '*.json');

    foreach ($files as $file) {
      if (substr($file, -5) === '.json') {
        $meta = json_decode(file_get_contents($historyDir . $file), true);

        if ($meta) {
          $history[] = $meta;
        }
      }
    }

    usort($history, function ($a, $b) {
      return $b['timestamp'] <=> $a['timestamp']; // Новые → старые
    });

    $history = $this->cleanupHistory($relativeFilePath, $history);
    $filePath = $this->basePath . $relativeFilePath;

    // Сравним md5 текущего файла с последним в истории
    if (is_readable($filePath) && !empty($history)) {
      $currentMd5 = md5_file($filePath);
      $lastMd5 = $history[0]['fileMd5'] ?? null;
      $lastBackupId = $history[0]['backupId'] ?? null;

      if ($lastMd5 !== null && $currentMd5 !== $lastMd5) {
        $lastMetaFields = $this->createBackup($relativeFilePath, file_get_contents($filePath), [
          'note' => 'Auto backup: file modified outside history system',
          'userId' => self::EXTERNAL_USER_ID,
          'prevBackupId' => $lastBackupId
        ]);
        array_unshift($history, $lastMetaFields);
      }
    }

    // Убрать initial backup (самый старый, последний в списке)
    if (count($history) > 1) {
      array_pop($history);
    }

    return $history;
  }

  /**
   * Очищает старые версии файлов на основе переданной отсортированной истории и возвращает новую историю
   * @param string $relativeFilePath Относительный путь к файлу
   * @param array $history Массив истории (отсортированный от новых к старым)
   * @return array Возвращает обновленную историю
   */
  private function cleanupHistory(string $relativeFilePath, array $history): array
  {
    $countHistory = count($history);

    if ($countHistory <= $this->minKeepVersions) {
      return $history;
    }

    $historyDir = $this->getHistoryDir($relativeFilePath);
    $now = time();
    $threshold = $now - ($this->maxDays * 86400);
    $cleanedHistory = [];

    foreach ($history as $index => $entry) {
      $timestampSec = (int)($entry['timestamp'] / 1000);
      $backupId = $entry['backupId'];

      // Удаляем, если:
      // 1) индекс < count - minKeepVersions (т.е. не входит в обязательные к хранению),
      // 2) и запись старее максимального количества дней хранения истории
      if ($index < $countHistory - $this->minKeepVersions && $timestampSec < $threshold) {
        @unlink($historyDir . $backupId . '.json');
        @unlink($historyDir . $backupId . '.csv.gz');
      } else {
        $cleanedHistory[] = $entry;
      }
    }

    return $cleanedHistory;
  }

  /**
   * Создаёт один бэкап (из сырой строки CSV).
   * @param string $relativeFilePath относительный путь до файла /price/00_price.csv
   * @param string $fileContent содержимое файла
   * @param array $metaFields поля для бэкапа
   * @return array возвращает массив добавленного файла с метаданными
   */
  private function createBackup(string $relativeFilePath, string $fileContent, array $metaFields = []): array
  {
    $historyDir = $this->getHistoryDir($relativeFilePath);

    $fileMd5 = md5($fileContent);
    $date = new DateTimeImmutable();
    $backupId = $date->format('Ymd_His_u');

    $metaData = array_merge([
      'backupId' => $backupId,
      'file' => $relativeFilePath,
      'fileMd5' => $fileMd5,
      'createdAt' => $date->format('d.m.Y H:i:s'),
      'timestamp' => (int)$date->format('Uv') //миллисекунды
    ], $metaFields);

    file_put_contents($historyDir . $backupId . '.json', json_encode($metaData, JSON_PRETTY_PRINT));
    file_put_contents("compress.zlib://" . $historyDir . $backupId . '.csv.gz', $fileContent);

    return $metaData;
  }


  /**
   * Возвращает содержимое текущего и предыдущего бэкапа по идентификатору.
   *
   * @param string $relativeFilePath Относительный путь к файлу, например /price/00_price.csv
   * @param string $backupId Идентификатор текущего бэкапа
   * @return array{current: string, previous: string} Ассоциативный массив с содержимым текущего и предыдущего CSV-бэкапа
   * @throws RuntimeException Если метаинформация или один из бэкапов не найден или не читается
   */
  public function getBackupsForDiffById(string $relativeFilePath, string $backupId): array
  {
    $meta = $this->getBackupMeta($relativeFilePath, $backupId);

    if ($meta === null) {
      throw new \RuntimeException("Metadata not found for backupId: {$backupId}");
    }

    $currentContent = $this->getBackupContent($relativeFilePath, $backupId);

    if ($currentContent === null) {
      throw new \RuntimeException("Failed to read current backup: {$backupId}");
    }

    $prevBackupId = $meta['prevBackupId'] ?? null;

    $prevContent = $this->getBackupContent($relativeFilePath, $prevBackupId);

    if ($prevContent === null) {
      throw new \RuntimeException("Failed to read previous backup: {$prevBackupId}");
    }

    return [
      'current' => $currentContent,
      'previous' => $prevContent
    ];
  }

  /**
   * Получает распакованное содержимое CSV-бэкапа по идентификатору.
   *
   * @param string $relativeFilePath Относительный путь к файлу, например /price/00_price.csv
   * @param string $backupId Идентификатор бэкапа, например 20250703_163045_123456
   * @return string|null Содержимое CSV-файла или null, если файл не найден или не читается
   */
  public function getBackupContent(string $relativeFilePath, string $backupId): ?string
  {
    $historyDir = $this->getHistoryDir($relativeFilePath);
    $backupFilePath = "{$historyDir}{$backupId}.csv.gz";

    if (!is_readable($backupFilePath)) {
      return null;
    }

    $content = file_get_contents("compress.zlib://{$backupFilePath}");
    return $content !== false ? $content : null;
  }

   /**
   * Получает метаинформацию о бэкапе по идентификатору.
   *
   * @param string $relativeFilePath Относительный путь к файлу, например /price/00_price.csv
   * @param string $backupId Идентификатор бэкапа
   * @return array|null Массив метаданных или null, если файл не найден или не читается
   */
  public function getBackupMeta(string $relativeFilePath, string $backupId): ?array
  {
    $metaFilePath = $this->getHistoryDir($relativeFilePath) . $backupId . '.json';

    if (!is_readable($metaFilePath)) {
      return null;
    }

    $content = file_get_contents($metaFilePath);

    if ($content === false) {
      return null;
    }

    $meta = json_decode($content, true);

    return is_array($meta) ? $meta : null;
  }

  /**
   * Возвращает структурированное дерево всей истории.
   *
   * @return array{
   *   name: string,
   *   path: string,
   *   isFile: bool,
   *   children: array
   * }
   */
  public function getHistoryTree(): array
  {
    $tree = [];

    $basePathLength = strlen($this->historyPath);

    // Создаем рекурсивный итератор для обхода файловой системы:
    // - Пропускаем специальные директории "." и ".." (SKIP_DOTS)
    // - Обходим директории с глубиной (SELF_FIRST - сначала текущий элемент, затем дети)
    $iterator = new RecursiveIteratorIterator(
      new ParentIterator(
        new RecursiveDirectoryIterator($this->historyPath, FilesystemIterator::SKIP_DOTS)
      ),
      RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $fileInfo) {
      $fullPath = str_replace('\\', '/', $fileInfo->getPathname());
      $relativePath = trim(substr($fullPath, $basePathLength), '/');
      $pathParts = explode('/', $relativePath);

      $node = &$tree;
      $currentPath = '';

      foreach ($pathParts as $i => $part) {

        $currentPath .= ($currentPath ? '/' : '') . $part;

        // Проверяем, является ли текущий компонент последним в пути
        $isLast = ($i === count($pathParts) - 1);
        $found = false;

        // Обработка CSV директорий (истории изменений)
        if ($isLast && substr($part, -4) === '.csv') {
          $node[] = [
            'name' => substr($part, 0, -4), // Удаляем .csv из имени
            'path' => $currentPath,         // Полный относительный путь
            'isFile' => true,         // Это директория истории
            'children' => []                // Пустые дочерние элементы
          ];
          break;
        }

        foreach ($node as &$child) {
          if ($child['name'] === $part) {
            $node = &$child['children'];
            $found = true;
            break;
          }
        }

        // Если узел не найден - создаем новый
        if (!$found) {
          $newNode = [
            'name' => $part,
            'path' => $currentPath,
            'isFile' => $isLast && $fileInfo->isFile(),
            'children' => []
          ];

          $node[] = $newNode;
          // Переходим на уровень глубже (в только что созданный узел)
          $node = &$node[array_key_last($node)]['children'];
        }
      }
    }

    return $tree;
  }

  /**
   * @param string $relativeFilePath относительный путь до файла
   * @return string Путь к папке истории для файла.
   */
  private function getHistoryDir(string $relativeFilePath): string
  {
    $relativeKey = ltrim($relativeFilePath, '/\\');
    return $this->historyPath . $relativeKey . '/';
  }

}
