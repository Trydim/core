<?php //if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 * @var array $siteDir - site_path from index.php
 */
if (stripos(ABS_SITE_PATH, $siteDir) !== false) $siteDir = '';
define('SITE_PATH', $siteDir . '/');

require 'config.php'; // Public config

if (!defined('CORE')) define('CORE',  basename( __DIR__ ) . '/');

if (!defined('VIEW')) define('VIEW', CORE . 'views/');

if (!defined('CORE_CSS')) define('CORE_CSS', SITE_PATH . CORE . 'assets/css/');
if (!defined('CORE_SCRIPT')) define('CORE_SCRIPT', SITE_PATH . CORE . 'assets/js/');

foreach ($publicConfig as $k => $v) {
  if (!defined($k)) define($k, $v);
}

require_once CORE . 'model/func.php';
require_once CORE . 'model/Main.php';

unset($publicConfig, $k, $v, $siteDir);
