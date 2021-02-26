<?php //if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */
$absPath = strtolower(str_replace('\\', '/', ABS_SITE_PATH));
$siteDir = str_replace(strtolower($_SERVER['DOCUMENT_ROOT']), '/', $absPath);
define('SITE_PATH', str_replace('//', '/', $siteDir));

require 'config.php'; // Public config

if (!defined('CORE')) define('CORE',  basename( __DIR__ ) . '/');

if (!defined('VIEW')) define('VIEW', CORE . 'views/');

if (!defined('CORE_CSS')) define('CORE_CSS', SITE_PATH . CORE . 'assets/css/');
if (!defined('CORE_SCRIPT')) define('CORE_SCRIPT', SITE_PATH . CORE . 'assets/js/');

foreach ($publicConfig as $k => $v) {
  if (!defined($k)) define($k, $v);
}

// Неиспользую цикл т.к. куча предупреждений
if (!defined('DEBUG')) define('DEBUG', false);
if (!defined('PUBLIC_PAGE')) define('PUBLIC_PAGE', false);
if (!defined('SHARE_DIR')) define('SHARE_DIR', false);
if (!defined('ONLY_LOGIN')) define('ONLY_LOGIN', false);
if (!defined('HOME_PAGE')) define('HOME_PAGE', PUBLIC_PAGE ? PUBLIC_PAGE : 'calendar');
if (!defined('ACCESS_MENU')) define('ACCESS_MENU', []);
if (!defined('PRINT_BTN')) define('PRINT_BTN', 1);
if (!defined('OUTSIDE')) define('OUTSIDE', isset($_GET['outside']));

require_once CORE . 'model/func.php';
require_once CORE . 'model/Main.php';
require_once CORE . 'model/Course.php';
require_once CORE . 'model/hooks.php';

// Public php.
if(file_exists(ABS_SITE_PATH . 'public/hooks.php')) require_once ABS_SITE_PATH . 'public/hooks.php';

unset($absPath, $siteDir, $publicConfig, $k, $v);
