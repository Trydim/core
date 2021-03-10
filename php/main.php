<?php

$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : 'noMode';
$result = [];
extract($_REQUEST);

try {
  switch ($mode) {
    case 'auth':
      require_once 'auth.php';
      break;
    case 'load':
    case 'DB':
      require_once 'db.php';
      break;
    case 'docs':
      require_once 'docs.php';
      break;
    case 'FM':
      require_once 'fileManager.php';
      break;
    case 'setting':
      require_once 'setting.php';
      break;
  }

  // $result['error'] должен содержать сообщение
  $result['status'] = isset($result['error']) ? checkError($result['error']) : true;

} catch (\mysql_xdevapi\Exception $e) {
  echo $e->getMessage();
}

echo json_encode($result);
