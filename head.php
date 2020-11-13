<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once basename( __DIR__ ) . '/config.php';
//setUserLocale('ru_RU');
//echo _('hello');
//echo _('paramConfig');

if(isset($_REQUEST['mode'])) {
  require 'php/main.php';
  die();
}

$html = '';

$target = getTargetPage($_GET);

if ($target === PUBLIC_PAGE) {
  $target = 'public';
  $pathTarget = '';
} else $pathTarget = checkTemplate($target);

if (strstr($pathTarget, '404')) require CONTROLLER . '404.php';
else {
  $main = new cms\Main();
  require CONTROLLER . "base.php";
  require CONTROLLER . "$target.php";
}

echo $html;
