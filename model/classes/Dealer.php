<?php

class Dealer {
  const FOLDER = ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR;
  const RESOURCES = Dealer::FOLDER . 'resource' . DIRECTORY_SEPARATOR;

  /**
   * @var Main
   */
  private $main;

  /**
   * @var string
   */
  private $dealerDir;

  /**
   * @var string
   */
  private $dealerPath;

  /**
   * @var string
   */
  private $prefix;

  /**
   * @var string
   */
  //private $dbType;

  /**
   * @var MigrateDb;
   */
  private $migrateDb;

  public function __construct($main) {
    $this->main = $main;
  }

  private function setParam(string $id, string $prefix) {
    $this->dealerDir  = $this::FOLDER . $id;
    $this->dealerPath = $this->dealerDir . DIRECTORY_SEPARATOR;

    $this->prefix     = $prefix;
  }
  private function createFolderDealers() {
    if (!is_dir($this::FOLDER)) {
      try {
        mkdir($this::FOLDER);
      } catch (\ErrorException $e) {
        die('Folder for dealers not created.');
      }
    }
  }
  private function createFolder() {
    if (is_dir($this->dealerDir)) {
      die('Folder for dealer exist!');
    }

    try {
      mkdir($this->dealerDir);
    } catch (\Exception $e) {
      die("Folder for $this->dealerDir dealer not created");
    }
  }
  private function copy(string $src, string $dst) {
    $sep = DIRECTORY_SEPARATOR;
    $dir = opendir($src);

    mkdir($dst);
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
  private function copyFiles() {
    try {

      foreach (['lang', 'public', 'shared'] as $dir) {
        $this->copy($this::RESOURCES . $dir, $this->dealerPath . $dir);
      }

    } catch (\Exception $e) {
      die("Copy resources error");
    }
  }
  private function createConfig(array $params) {
    $config = file_get_contents($this::RESOURCES . 'config.php');
    $setParam = function ($paramName, $params) use (&$config) {
      $value = is_array($params) ? $params[$paramName] : $params;
      $config = str_replace('$' . $paramName, $value, $config);
    };

    $setParam('dealerName', $params);

    $setParam('prefix', $this->prefix);
    foreach (['dbHost', 'dbName', 'dbUsername', 'dbPass'] as $key) {
      $setParam($key, $params[VC::DB_CONFIG]);
    }

    file_put_contents($this->dealerPath . 'config.php', $config);
  }

  private function updateDb(array $param) {
    $this->migrateDb = new MigrateDb($this->main, $param['prefix']);

    $this->migrateDb->createMoney();
    $this->migrateDb->createFiles();

    $this->migrateDb->createCustomers();
    $this->migrateDb->createPermission();
    $this->migrateDb->createUsers();
    $this->migrateDb->createOrderStatus();
    $this->migrateDb->createOrders();

    $this->migrateDb->createAdmin($param['login'], $param['pass']);
    $this->migrateDb->createStatus();
    $this->migrateDb->createMoneyRate();
  }

  /**
   * @param number $id
   * @param array $configParam
   * @param array $dbParam
   */
  public function create($id, array $configParam, array $dbParam) {
    $this->setParam($id, $dbParam['prefix']);
    $this->createFolderDealers();
    $this->createFolder();
    $this->copyFiles();
    $this->createConfig($configParam);

    $this->updateDb($dbParam);
  }

  public function drop(string $id, string $prefix) {
    unlink($this::FOLDER . '/' . $id);

    $this->migrateDb = new MigrateDb($this->main, $prefix);
    // удалить все таблица с префиксом
    $this->migrateDb->drop($prefix);
  }
}
