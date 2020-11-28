<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once basename( __DIR__ ) . '/config.php';
//setUserLocale('ru_RU');
//echo _('hello');
//echo _('paramConfig');

if(isset($_REQUEST['mode'])) require 'php/main.php';
else {
  $html = '';

  $target = getTargetPage($_GET);
  $target === PUBLIC_PAGE && reDirect(null, 'public');
  $target && $pathTarget = checkTemplate($target);
  if ($target && strstr($pathTarget, '404')) require CORE . 'controller/c_404.php';
  else {
    $main = new cms\Main();
    require CORE . "controller/c_base.php";

    $target && $target = checkAccess($target);
    $target !== 'public' && $pathTarget = checkTemplate($target);
    require CORE . "controller/c_$target.php";
  }

  echo $html;
}
