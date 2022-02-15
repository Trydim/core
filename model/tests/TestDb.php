<?php

const ABS_SITE_PATH = __DIR__ . '/../../../';
const SITE_PATH = '/';
const USE_DATABASE = true;

use PHPUnit\Framework\TestCase;

class Test extends TestCase {

  /**
   * @var RedBeanPHP\Db
   */
  private $db;

  private function connectToDb(): \RedBeanPHP\Db {
    require ABS_SITE_PATH . 'config.php';
    require __DIR__ . '/../classes/Db.php';
    $this->db = new RedBeanPHP\Db($dbConfig ?? []);
    return $this->db;
  }

  public function testCheckError() {
    $db = $this->connectToDb();

    $res = $db->checkHaveRows('order_status', 'name', 'Заказ оформлен');
    $this->assertSame($res, 1);
  }
}
