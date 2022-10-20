<?php

const CORE = __DIR__ . '/../../../';
const ABS_SITE_PATH = CORE . '/../';
const USE_DATABASE = true;

use PHPUnit\Framework\TestCase;

class Test extends TestCase {

  /**
   * @var RedBeanPHP\Db
   */
  private $db;

  private function connectToDb(): \RedBeanPHP\Db {
    require ABS_SITE_PATH . 'config.php';
    require CORE . 'model/classes/Db.php';
    $this->db = new RedBeanPHP\Db($dbConfig ?? []);
    return $this->db;
  }

  public function testCheckError() {
    $db = $this->connectToDb();

    $res = $db->checkHaveRows('order_status', 'name', 'Заказ оформлен');
    $this->assertSame($res, 1);
  }
}
