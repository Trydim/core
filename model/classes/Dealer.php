<?php

class Dealer {
  const FOLDER = ABS_SITE_PATH . DEALERS_PATH;

  /**
   * @var string
   */
  private $dealerDir;

  public function __construct() {}

  private function createFolderDealers() {
    if (!is_dir($this::FOLDER)) {
      try {
        mkdir($this::FOLDER, 0777);
      } catch (\ErrorException $e) {
        die('Folder for dealers not created');
      }
    }
  }

  private function createFolder(string $id) {
    $this->dealerDir = $this::FOLDER . '/' . $id;

    /*if (is_dir($this->dealerDir)) {
      die('Folder for dealer exist!');
    }*/

    try {
      mkdir($this->dealerDir, 0777);
    } catch (\ErrorException $e) {
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

  /**
   * @param string $id
   */
  public function create(string $id) {
    $this->createFolderDealers();
    $this->createFolder($id);
    $this->copyFiles();
    //
  }

}
