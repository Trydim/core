<?php use cms\Main;

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

if (defined('MAIN_ACCESS') || defined('ABS_SITE_PATH')) die('access denied!');
define('MAIN_ACCESS', true);
define('ABS_SITE_PATH', __DIR__ . '/');

require_once 'core/config.php';
require_once 'core/model/func.php';
//setUserLocale('ru_RU');
//echo _('hello');
//echo _('paramConfig');

$html = '';

$target = getTargetPage($_GET);
$pathTarget = checkTemplate($target);
if (strstr($pathTarget, '404')) require CONTROLLER . '404.php';
else {
  require_once 'core/model/Main.php';
  $main = new Main();
	require CONTROLLER . "base.php";
	require CONTROLLER . "$target.php";
}

echo $html;
