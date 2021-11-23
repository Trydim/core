<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global
 */

require_once basename( __DIR__ ) . '/cmsSetting.php';

if(isset($_REQUEST['mode'])) require 'model/main.php';
else {
  $html = '';

  $target = getTargetPage($_GET);

  !PUBLIC_PAGE && !$target && $target = ACCESS_MENU[0];
  ($target === PUBLIC_PAGE) && reDirect(null, 'public');
  $target && $pathTarget = checkTemplate($target);
  if ($target && strstr($pathTarget, '404')) require CORE . 'controller/c_404.php';
  else {
    if (!OUTSIDE) {
      $main->checkAuth($target)
           ->applyAuth($target)
           ->setAccount();
    }

    $target = checkAccess($target);
    $target !== 'public' && $pathTarget = checkTemplate($target);
    require CORE . "controller/c_$target.php";
  }
  echo $html;
}

unset($target, $pathTarget, $html, $authStatus, $dbContent, $field, $orderId, $main);
