<?php

use PHPUnit\Framework\TestCase;

const CORE = __DIR__ . '/../../../';

require CORE . '/model/classes/UrlGenerator.php';

class TestUri extends TestCase {

  public function testUri() {
    define('ABS_SITE_PATH', '');
    $_SERVER['HTTP_HOST'] = 'site';
    $_SERVER['DOCUMENT_ROOT'] = '';
    $core = '';
    $uri = new UrlGenerator($core);

    $res = $db->checkHaveRows('order_status', 'name', 'Заказ оформлен');
    $this->assertSame($res, 1);
  }
}
