<?php //if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */
$absPath = strtolower(str_replace('\\', '/', ABS_SITE_PATH));
$siteDir = str_replace($_SERVER['DOCUMENT_ROOT'], '/', strtolower($absPath));
define('SITE_PATH', str_replace('//', '/', $siteDir));

require 'config.php'; // Public config

if (!defined('CORE')) define('CORE',  basename( __DIR__ ) . '/');

if (!defined('VIEW')) define('VIEW', CORE . 'views/');

if (!defined('CORE_CSS')) define('CORE_CSS', SITE_PATH . CORE . 'assets/css/');
if (!defined('CORE_SCRIPT')) define('CORE_SCRIPT', SITE_PATH . CORE . 'assets/js/');

foreach ($publicConfig as $k => $v) {
  if (!defined($k)) define($k, $v);
}

if(!defined('HOME_PAGE')) define('HOME_PAGE', 'home');
if(!defined('PUBLIC_PAGE')) define('PUBLIC_PAGE', false);
if(!defined('ACCESS_MENU')) define('ACCESS_MENU', []);

require_once CORE . 'model/func.php';
require_once CORE . 'model/Main.php';

unset($absPath, $siteDir, $publicConfig, $k, $v);
