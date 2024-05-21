<?php

use PHPUnit\Framework\TestCase;

const CORE = __DIR__ . '/../../../';

class Test extends TestCase {
  const FUNC_PATH = CORE . 'model/func.php';

  public function testGTxt() {
    define('ABS_SITE_PATH', __DIR__ . '/../../visCms/');
    require_once self::FUNC_PATH;

    gTxt('calculator');
  }

  public function gTxtDB() {
    define('ABS_SITE_PATH', __DIR__ . '/../../visCms/');
    require_once self::FUNC_PATH;

    gTxtDB('codes', 'codes');
  }

  public function testPushAndPop() {
    $stack = [];
    $this->assertSame(0, count($stack));

    array_push($stack, 'foo');
    $this->assertSame('foo', $stack[count($stack)-1]);
    $this->assertSame(1, count($stack));

    $this->assertSame('foo', array_pop($stack));
    $this->assertSame(0, count($stack));
  }

  public function testBoolValue() {
    require_once self::FUNC_PATH;

    // Boolean
    $this->assertSame(boolValue(true), true);

    // String
    $this->assertSame(boolValue('true'), true);
    $this->assertSame(boolValue('false'), false);
    $this->assertSame(boolValue('asd'), true);
    $this->assertSame(boolValue(''), false);

    // Number
    $this->assertSame(boolValue(1), true);
    $this->assertSame(boolValue(0), false);
    $this->assertSame(boolValue(-1), true);

    // Array
    $this->assertSame(boolValue(['array']), true);
    $this->assertSame(boolValue(['']), true);
    $this->assertSame(boolValue([]), false);

    // Object
    $this->assertSame(boolValue(new class {}), true);
  }

  public function testIncludes() {
    require_once self::FUNC_PATH;


  }
}
