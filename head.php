<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global
 */

require_once basename( __DIR__ ) . '/cmsSetting.php';

if(isset($_REQUEST['mode'])) require 'model/main.php';
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
