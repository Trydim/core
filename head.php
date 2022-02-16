<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

use cms\Main;
/**
 * @var $main - global
 * @var $dbConfig - from root config
 */

require_once __DIR__ . '/cmsSetting.php';

$main = new Main(USE_DATABASE ? $dbConfig : []);
$main->setHooks();

if (isset($_REQUEST['mode'])) require __DIR__ . '/model/main.php';
else {
  $html = '';

  $target = getTargetPage($_GET);
  $pathTarget = checkTemplate($target);

  if (OUTSIDE) $main->setLoginStatus('no');
  else {
    $main->checkAuth()
         ->setAccount()
         ->applyAuth($target);
  }

  $target === '' && $target = 'public';
  require CORE . "controller/c_$target.php";
  echo $html;
}

unset($target, $pathTarget, $html, $authStatus, $dbContent, $field, $orderId, $main);
