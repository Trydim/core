<?php

class Dealer {
  const FOLDER = ABS_SITE_PATH . DEALERS_PATH . '/';

  /**
   * @var string
   */
  private $dealerDir;

  /**
   * @var string
   */
  private $dbType;

  /**
   * @var MigrateDb;
   */
  private $migrateDb;

  public function __construct() { }

  private function createFolderDealers() {
    if (!is_dir($this::FOLDER)) {
      try {
        mkdir($this::FOLDER);
      } catch (\ErrorException $e) {
        die('Folder for dealers not created.');
      }
    }
  }
  private function createFolder(string $id) {
    $this->dealerDir = $this::FOLDER . $id;

    /*if (is_dir($this->dealerDir)) {
      die('Folder for dealer exist!');
    }*/

    try {
      mkdir($this->dealerDir);
    } catch (\Exception $e) {
      die("Folder for $this->dealerDir dealer not created");
    }
  }

  private function copyFiles() {
    try {
      // Copy Lang
      copy(ABS_SITE_PATH . '/lang', $this->dealerDir);

      //

    } catch (\Exception $e) {
      die("Folder for dealer not created");
    }
  }

  private function updateDb(string $prefix, $login, $pass) {
    $this->migrateDb = new MigrateDb($prefix);

    $this->migrateDb->createMoney();
    $this->migrateDb->createFiles();

    $this->migrateDb->createCustomers();
    $this->migrateDb->createOrderStatus();
    $this->migrateDb->createPermission();
    $this->migrateDb->createUsers();
    $this->migrateDb->createOrders();

    $this->migrateDb->createAdmin($login, $pass);
  }

  /**
   * @param string $id
   * @param string $prefix
   */
  public function create(string $id, string $prefix, $login, $pass) {
    $this->createFolderDealers();
    $this->createFolder($id);
    $this->copyFiles();

    $this->updateDb($prefix, $login, $pass);

  }

  public function drop(string $id, string $prefix) {
    unlink($this::FOLDER . '/' . $id);

    $this->migrateDb = new MigrateDb($prefix);
    // удалить все таблица с префиксом
    $this->migrateDb->drop($prefix);
  }

}
