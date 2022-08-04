<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */
extract($_REQUEST);
$result = [];
$mode = $mode ?? 'noMode';
$dbAction = $dbAction ?? 'noAction';

if (in_array($mode, ['auth', 'docs']) || $main->checkAction($dbAction)) {
  try {
    switch ($mode) {
      case 'auth':
        require __DIR__ . '/auth.php';
        break;
      case 'load':
      case 'DB':
        require __DIR__ . '/db.php';
        break;
      case 'docs':
        require __DIR__ . '/docs.php';
        break;
      case 'FM':
        require __DIR__ . '/fileManager.php';
        break;
      case 'setting':
        require __DIR__ . '/setting.php';
        break;
    }

    checkError($result);

  } catch (\mysql_xdevapi\Exception $e) {
    echo $e->getMessage();
  }
} else $result['error'] = ['Auth no passing!'];

echo json_encode($result);
