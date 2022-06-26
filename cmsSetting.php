<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */

require ABS_SITE_PATH . 'config.php';
require __DIR__ . '/model/func.php';

spl_autoload_register('cmsAutoloader');

const CORE          = __DIR__ . '/',
      SHARE_PATH    = ABS_SITE_PATH . 'shared/',
      SETTINGS_PATH = SHARE_PATH . 'settingSave.json',
      CSV_CACHE     = SHARE_PATH . 'csvCache.bin',
      SYSTEM_PATH   = SHARE_PATH . 'system.php'; // TODO перенести в DB

$mainConfig = $publicConfig;
$main = new Main($mainConfig, $dbConfig ?? []);
$url = new UrlGenerator('core/');

define('DEBUG', array_key_exists('DEBUG', $mainConfig));
define('URI', $url->getUri());
define('SITE_PATH', $url->getSitePath());
define('CORE_CSS', $url->getCoreUri() . 'assets/css/');
define('CORE_JS', $url->getCoreUri() . 'assets/js/');

if ($main->getCmsParam('isDealer')) {
  require $main->getCmsParam('dealerPath') . 'config.php';
}

define('PUBLIC_PAGE', $mainConfig['PUBLIC_PAGE'] ?? false);
define('ONLY_LOGIN', $publicConfig['ONLY_LOGIN'] ?? !boolval(PUBLIC_PAGE)); // Можно перенести в main
define('PATH_IMG', ABS_SITE_PATH . ($publicConfig['PATH_IMG'] ?? 'public/images/'));
define('URI_IMG', $url->getUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'));
define('URI_CSS', $url->getUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'));
define('URI_JS', $url->getUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));
define('USE_DATABASE', $mainConfig['USE_DATABASE'] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($mainConfig['CHANGE_DATABASE'] ?? false) : false);
define('USE_CONTENT_EDITOR', $publicConfig['USE_CONTENT_EDITOR'] ?? false);

define('CSV_DELIMITER', $mainConfig['CSV_DELIMITER'] ?? ';');
define('CSV_STRING_LENGTH', $mainConfig['CSV_STRING_LENGTH'] ?? 1000);

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main->setHooks();

unset($publicConfig, $dealConfig, $dbConfig);
