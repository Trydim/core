<?php

use PHPUnit\Framework\TestCase;

class Test extends TestCase {

  public function testCheckError() {
    require_once __DIR__ . '/../func.php';

    // Empty array must do return array with index "status" value "true"
    $arr = [];
    checkError($arr);
    $this->assertSame($arr['status'], true);

    // Any fields with values must be not changed, except 'error'
    $arr['msg'] = 'test';
    $arr['json'] = '{}';
    checkError($arr);
    $this->assertSame($arr['json'], '{}');
    $this->assertSame($arr['msg'], 'test');

    // Any empty, any deep values in 'error' should be removed
    $arr['error'] = [
      'level1-1' => ['level2' => [
        'level2-1' => '',
        'level2-2' => '',
      ]],
      'level1-2' => ['level2' => ''],
    ];
    checkError($arr);
    $this->assertSame(isset($arr['error']), false);

    // Any values in 'error' flatter to one level array
    // Empty values should be removed
    $arr['error'] = [
      'level1-1' => ['level2' => 'error1'],
      'level1-2' => 'error2',
      'level1-3' => '',
      'level1-4' => ['level2' => ['level3' => '']],
    ];
    checkError($arr);
    $this->assertSame(count($arr['error']), 2);

    // Any errors set status to "false"
    $this->assertSame($arr['status'], false);
  }

  public function testGTxt() {
    define('ABS_SITE_PATH', __DIR__ . '/../../../');
    require_once __DIR__ . '/../func.php';

    gTxt('calculator');
  }

  public function gTxtDB() {
    define('ABS_SITE_PATH', __DIR__ . '/../../../');
    require_once __DIR__ . '/../func.php';

    gTxtDB('codes', 'codes');
  }

  public function testPushAndPop() {
    echo 1;
    $stack = [];
    $this->assertSame(0, count($stack));

    array_push($stack, 'foo');
    $this->assertSame('foo', $stack[count($stack)-1]);
    $this->assertSame(1, count($stack));

    $this->assertSame('foo', array_pop($stack));
    $this->assertSame(0, count($stack));
  }
}
