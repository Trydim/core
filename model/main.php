<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global
 */

$result = [];
$mode = $_REQUEST['mode'] ?? 'noMode';
$main->checkAuth('check');
if ($mode !== 'auth' && $main->checkStatus('no')) $result['error'] = ['Auth no passing!'];
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

  $result['status'] = !isset($result['error']) || checkError($result['error']);

} catch (\mysql_xdevapi\Exception $e) {
  echo $e->getMessage();
}

echo json_encode($result);
