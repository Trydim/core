<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */

require ABS_SITE_PATH . 'config.php';
require __DIR__ . '/model/func.php';

spl_autoload_register('cmsAutoloader');

$url = new UrlGenerator($publicConfig['PATH_CORE'] ?? 'core/');

define('URI', $url->getUri());
define('CORE', __DIR__ . '/');
define('SITE_PATH', $url->getSitePath());
define('SHARE_PATH', $publicConfig['SHARE_PATH'] ?? ABS_SITE_PATH . 'shared/');

const VIEW = CORE . 'views/';

const HOOKS_PATH = ABS_SITE_PATH . 'public/hooks.php';

const SETTINGS_PATH = SHARE_PATH . 'settingSave.json';
const PAGE_CACHE_FILE = SHARE_PATH . 'pageCache.bin'; // перенести в Main
const CSV_CACHE = SHARE_PATH . 'csvCache.bin';
const COURSE_CACHE = SHARE_PATH . 'courseCache.bin';
const SYSTEM_PATH = SHARE_PATH . 'system.php';

define('CORE_CSS', $url->getCoreUri() . 'assets/css/');
define('CORE_JS', $url->getCoreUri() . 'assets/js/');

$mainConfig = $publicConfig['PATH_MAIN_CONFIG'] ?? false;
if ($mainConfig) {
  $subConfig = $publicConfig;
  $subDbConfig = $dbConfig ?? [];
  require ABS_SITE_PATH . $mainConfig;
  $publicConfig = array_merge($publicConfig, $subConfig);
  $dbConfig = $subDbConfig;
}

define('DEBUG', array_key_exists('DEBUG', $publicConfig));
define('PUBLIC_PAGE', $publicConfig['PUBLIC_PAGE'] ?? false);
define('ONLY_LOGIN', $publicConfig['ONLY_LOGIN'] ?? !boolval(PUBLIC_PAGE)); // Можно перенести в main

define('PATH_CSS', $url->getUri() . ($publicConfig['PATH_CSS'] ?? 'public/css/'));
define('PATH_IMG', ABS_SITE_PATH . ($publicConfig['PATH_IMG'] ?? 'public/images/'));
define('URI_IMG', $url->getUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'));
define('PATH_JS', $url->getUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));
define('USE_DATABASE', $publicConfig['USE_DATABASE'] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($publicConfig['CHANGE_DATABASE'] ?? false) : false);

define('CSV_STRING_LENGTH', $publicConfig['CSV_STRING_LENGTH'] ?? 1000);
define('CSV_DELIMITER', $publicConfig['CSV_DELIMITER'] ?? ';');

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main = new Main($publicConfig, $dbConfig ?? []);
$main->setHooks();

unset($mainConfig, $publicConfig, $subConfig, $dbConfig, $subDbConfig);
