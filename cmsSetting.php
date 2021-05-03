<?php //if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */
$absPath = strtolower(str_replace('\\', '/', ABS_SITE_PATH));
$siteDir = str_replace(strtolower($_SERVER['DOCUMENT_ROOT']), '/', $absPath);
define('SITE_PATH', str_replace('//', '/', $siteDir));

require ABS_SITE_PATH . 'config.php'; // Public config

!isset($dbConfig) && $dbConfig = [];

define('CORE', basename( __DIR__ ) . '/');
define('VIEW', CORE . 'views/');

define('CORE_CSS', SITE_PATH . CORE . 'assets/css/');
define('CORE_SCRIPT', SITE_PATH . CORE . 'assets/js/');

define('SETTINGS_PATH', ABS_SITE_PATH . 'shared/settingSave.json');
define('SYSTEM_PATH', ABS_SITE_PATH . 'shared/system.php');

!$publicConfig['PUBLIC_PAGE'] && define('ONLY_LOGIN', true);

foreach ($publicConfig as $k => $v) {
  if (!defined($k)) define($k, $v);
}

// Не использую цикл т.к. куча предупреждений
if (!defined('DEBUG')) define('DEBUG', false);
if (!defined('PUBLIC_PAGE')) define('PUBLIC_PAGE', false);
if (!defined('ONLY_LOGIN')) define('ONLY_LOGIN', false);
if (!defined('USERS_ORDERS')) define('USERS_ORDERS', false);
if (!defined('USE_DATABASE')) define('USE_DATABASE', true);
if (!defined('HOME_PAGE')) define('HOME_PAGE', PUBLIC_PAGE ? PUBLIC_PAGE : ACCESS_MENU[0]);
if (!defined('ACCESS_MENU')) define('ACCESS_MENU', []);
if (!defined('PRINT_BTN')) define('PRINT_BTN', 1);
if (!defined('SHARE_DIR')) define('SHARE_DIR', '/');
if (!defined('OUTSIDE')) define('OUTSIDE', isset($_GET['outside']));

require_once CORE . 'model/func.php';
require_once CORE . 'model/classes/Main.php';
require_once CORE . 'model/classes/Course.php';
require_once CORE . 'model/classes/Xml.php';
require_once CORE . 'model/hooks.php';

// Public php.
if(file_exists(ABS_SITE_PATH . 'public/hooks.php')) require_once ABS_SITE_PATH . 'public/hooks.php';

unset($absPath, $siteDir, $publicConfig, $k, $v);
