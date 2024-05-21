<?php

use PHPUnit\Framework\TestCase;

require __DIR__ . '/constTest.php';

class TestResponse extends TestCase {
  public function testCheckError() {
    $main = new Main([], []);


    // Empty array must do return array with index "status" value "true"
    $arr = [];
    /*$result = $main->response->setContent($arr)->getContent();
    $this->assertSame($result['status'], true);*/


    // Any fields with values must be not changed, except 'error'
    $arr = [
      'msg' => 'test',
      'json' => '{}',
    ];
    $result = $main->response->setContent($arr)->getContent();
    $this->assertSame($result['msg'], 'test');
    $this->assertSame($result['json'], '{}');
    $this->assertSame($result['status'], true);

    // Any empty, any deep values in 'error' should be removed
    $arr['error'] = [
      'level1-1' => [
        'level2' => [
          'level2-1' => '',
          'level2-2' => '',
        ]
      ],
      'level1-2' => ['level2' => ''],
    ];
    $result = $main->response->setContent($arr)->getContent();
    $this->assertSame(isset($result['error']), false);

    // Any values in 'error' flatter to one level array
    // Empty values should be removed
    $arr['error'] = [
      'level1-1' => ['level2' => 'error1'],
      'level1-2' => 'error2',
      'level1-3' => '',
      'level1-4' => ['level2' => ['level3' => '']],
    ];
    $result = $main->response->setContent($arr)->getContent();
    $this->assertSame(count($result['error']), 2);

    // Any errors set status to "false"
    $this->assertSame($result['status'], false);
  }
}
