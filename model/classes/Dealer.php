<?php

class Dealer {
  const FOLDER    = ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR;
  const RESOURCES = Dealer::FOLDER . 'resource' . DIRECTORY_SEPARATOR;

  private Main $main;

  private string $dealerDir;
  private string $dealerPath;

  private MigrateDb $migrateDb;

  public function __construct($main) {
    $this->main = $main;
  }

  private function setParam(string $id): void
  {
    $this->dealerDir  = $this::FOLDER . $id;
    $this->dealerPath = $this->dealerDir . DIRECTORY_SEPARATOR;
  }
  private function createFolderDealers(): void
  {
    if (!is_dir($this::FOLDER)) {
      try {
        mkdir($this::FOLDER);
      } catch (\ErrorException $e) {
        die('Dealer folder not created!');
      }
    }
  }
  private function createFolder(): void
  {
    if (is_dir($this->dealerDir)) die('Dealer folder exist!');

    try {
      mkdir($this->dealerDir);
    } catch (\Exception $e) {
      die("$this->dealerDir folder not created");
    }
  }
  private function checkFolder(): bool {
    if (!is_dir($this->dealerDir)) die("$this->dealerDir folder does not exist!");

    return true;
  }
  private function copy(string $src, string $dst): void
  {
    $sep = DIRECTORY_SEPARATOR;
    $dir = opendir($src);

    if (!is_dir($dst)) mkdir($dst);
    while ($file = readdir($dir)) {
      if (in_array($file, ['.', '..'])) continue;

      if (is_dir($src . $sep . $file)) {
        $this->copy($src . $sep . $file, $dst . $sep . $file);
      } else {
        copy($src . $sep . $file, $dst . $sep . $file);
      }
    }
    closedir($dir);
  }
  private function copyFiles(array $folders = ['lang', 'public', 'shared']): void
  {
    try {
      foreach ($folders as $dir) {
        $this->copy($this::RESOURCES . $dir, $this->dealerPath . $dir);
      }
    } catch (\Exception $e) {
      die('Error copying resources');
    }
  }
  private function createConfig(array $params): void
  {
    $config = file_get_contents($this::RESOURCES . 'config.php');
    if (!$config) die('Dealer configuration file does not exist!');

    $setParam = function ($paramName, $params) use (&$config) {
      $value = is_array($params) ? $params[$paramName] : $params;
      $config = str_replace('$' . $paramName, $value, $config);
    };

    $setParam('dealerName', $params);

    foreach (['dbHost', 'dbName', 'dbUsername', 'dbPass'] as $key) {
      $setParam($key, $params[VC::DB_CONFIG]);
    }

    file_put_contents($this->dealerPath . 'config.php', $config);
  }

  private function updateDb(array $param): void
  {
    $this->migrateDb = new MigrateDb($this->main);

    if ($this->migrateDb->checkResourceDump()) {
      $this->migrateDb->seedingResourceDump();
      $this->migrateDb->updateAdmin($param['login'], $param['pass']);
    } else {
      $this->migrateDb->addAdmin($param['login'], $param['pass']);
    }
  }

  public function create(int|string $id, array $configParam, array $dbParam): void
  {
    $this->main->fireHook(VC::HOOKS_DEALERS_BEFORE_CREATE, $this, $configParam, $dbParam);

    $this->setParam($id);
    $this->createFolderDealers();
    $this->createFolder();
    $this->copyFiles();
    $this->createConfig($configParam);

    $this->updateDb($dbParam);

    $this->main->fireHook(VC::HOOKS_DEALERS_AFTER_CREATE, $this);
  }

  public function update($id) {
    $this->setParam($id, '');
    if (!is_dir($this->dealerDir)) $this->createFolder();
    $this->copyFiles(['public']);

    return $id;
  }

  public function drop(string $id): int {
    if (is_dir($path = $this::FOLDER . $id)) {
      removeFolder($path);
    }

    // Remove dealer
    return $this->main->db->deleteItem('dealers', [$id]);
  }
}
