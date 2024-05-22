<?php

class CsvConfig {
  const CSV_CONFIG = 'csvConfig/';

  static function getXMLTemplate(): string {
    return '{}';
  }

  /**
   * @param string $configPath
   * @param string $csvPath
   */
  static function createStartConfig(string $configPath, string $csvPath) {
    $link = ABS_SITE_PATH . SHARE_PATH;
    foreach (explode('/', dirname(self::CSV_CONFIG . $csvPath)) as $dir) {
      $link .= $dir . '/';
      if (!file_exists($link)) mkdir($link);
    }

    if (!file_exists($configPath)) file_put_contents($configPath, self::getXMLTemplate());
  }

  /**
   * @param string $configPath
   * @param string $csvPath
   * @return array
   */
  static function updateConfig(string $configPath, string $csvPath): array {
    $csv = loadCSV([], $csvPath);
    if (count($csv) === 0) return ['error' => gTxt('Csv table is empty!')];

    $currentCfg = json_decode(file_get_contents($configPath), true);
    $cfg = [];

    $currentIdColumnIndex = null;
    foreach ($currentCfg[0] ?? [] as $i => $cell) {
      if (includes(['id', 'key'], $cell['key'])) {
        $currentIdColumnIndex = $i; break;
      }
    }

    // Check rows, columns count
    //$rowsCount    = count($csv);
    //$columnsCount = count($csv[0]);
    /*if ((int) $cfg->attributes()->rows === $rowsCount
      && (int) $cfg->attributes()->columns === $columnsCount) {
      return $cfg;
    }

    $cfg->addAttribute('rows', $rowsCount);
    $cfg->addAttribute('columns', $columnsCount);
    */

    $param = [];
    $idColumnIndex = null;
    foreach ($csv[0] as $c => $cell) {
      if ($idColumnIndex !== null && includes(['id', 'key'], strtolower($cell))) $idColumnIndex = $cell;
      $param[$c] = $cell;
    }

    // If table have only one row
    if (count($csv) === 1) $csv[] = array_fill(0, count($param), '');

    foreach ($csv as $r => $row) {
      // В нулевой строке общие параметры
      //if ($r === 0 && !isset())

      $cfg[$r] = [];
      $xRow = &$cfg[$r];
      $cXRow = &$currentCfg[$r];

      // Если ид не совпадает значит новая строка
      // Искать такой ид в других строках (кроме первой)
      // переместить все параметры
      // Если новая строка, по умолчанию наследование.
      //if ((string) $xRow->attributes()->id !== $row[0/*$index*/]) {
      //  $xRow->attributes()->id = $row[0/*$index*/];
      //}

      foreach ($row as $c => $cell) {
        $xRow[$c] = [];
        $xParam = &$xRow[$c];
        $cXParam = &$cXRow[$c];

        if ($cXParam['key'] === $param[$c]) { $xParam = $cXParam; continue; }
        if (!isset($xParam['key']) || $xParam['key'] !== $param[$c]) $xParam['key'] = $param[$c];
        // Для всех строк "по умолчанию" наследование от шапки
        if (!isset($xParam['type'])) $xParam['type'] = $r === 0 ? 'string' : 'inherit';
      }
    }

    // Save if there are changes
    if (json_encode($currentCfg) !== json_encode($cfg)) file_put_contents($configPath, json_encode($cfg));

    return $cfg;
  }

  /**
   * @param string $csvPath
   * @return array
   */
  static function syncFile(string $csvPath): array {
    $csvPath = substr($csvPath, 1);
    $configPath = ABS_SITE_PATH . SHARE_PATH . self::CSV_CONFIG . str_replace('.csv', '.json', $csvPath);

    // Check file
    if (!file_exists($configPath)) self::createStartConfig($configPath, $csvPath);

    return self::updateConfig($configPath, $csvPath);
  }

  /**
   * @param string $csvPath
   * @param string $data
   * @return false|string
   */
  static function saveConfig(string $csvPath, string $data) {
    $xmlPath = ABS_SITE_PATH . SHARE_PATH . self::CSV_CONFIG . str_replace('.csv', '.json', $csvPath);

    try {
      file_put_contents($xmlPath, $data);
    } catch (Exception $e) {
      return $e->getMessage();
    }
    return false;
  }
}
