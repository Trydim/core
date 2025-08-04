<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */

date_default_timezone_set('Europe/Moscow');

require ABS_SITE_PATH . 'config.php';
require __DIR__ . '/model/func.php';

spl_autoload_register('cmsAutoloader');

const CORE          = __DIR__ . '/',
      SHARE_PATH    = 'shared/',
      STORAGE_PATH  = 'storage/',
      DEALERS_PATH  = 'dealer',
      SYSTEM_PATH   = ABS_SITE_PATH . SHARE_PATH . 'system.php'; // TODO перенести в DB

define('DEBUG', boolval($publicConfig['DEBUG'] ?? false));
define('USE_DATABASE', $publicConfig[VC::USE_DATABASE] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($publicConfig[VC::CHANGE_DATABASE] ?? false) : false);

define('CSV_DELIMITER', $publicConfig['CSV_DELIMITER'] ?? ';');
define('CSV_STRING_LENGTH', $publicConfig['CSV_STRING_LENGTH'] ?? 1000);

$GLOBALS['main'] = $main = new Main($publicConfig, $dbConfig ?? []);
$url = $main->url;

//define('IS_LOCAL', $main->isDealer() && $url->isLocalDealer('1')); // Only for first
define('CORE_CSS', $url->getCoreUri() . 'assets/css/');
define('CORE_JS', $url->getCoreUri() . 'assets/js/');

$main->setCmsParam(VC::CSV_PATH, $url->getBasePath(true) . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'))
     ->setCmsParam(VC::CSV_HISTORY_PATH, $url->getBasePath(true) . STORAGE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'))
     ->setCmsParam(VC::IMG_PATH, $url->getBasePath(true) . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam(VC::URI_IMG, $url->getBaseUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam(VC::URI_CSS, $url->getBaseUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
     ->setCmsParam(VC::URI_JS, $url->getBaseUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));

if ($main->db->setDealerLink()) {
  require $url->getPath(true) . 'config.php';

  $main->setCmsParam(VC::CSV_MAIN_PATH, $main->getCmsParam(VC::CSV_PATH))
       ->setCmsParam(VC::CSV_PATH, $url->getPath(true) . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'))
       ->setCmsParam(VC::CSV_HISTORY_PATH, $url->getBasePath(true) . STORAGE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/') . DEALERS_PATH . '/' . $main->getCmsParam(VC::DEALER_ID) . '/');

  unset($publicConfig['PATH_CSV']);
  $main->setCmsParam($publicConfig)->setSettings(VC::DB_CONFIG, $dbConfig ?? []);

  $main->setCmsParam(VC::DEAL_IMG_PATH, $url->getPath(true) . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
       ->setCmsParam(VC::DEAL_URI_IMG, $url->getUri(true) . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
       ->setCmsParam(VC::DEAL_URI_CSS, $url->getUri(true) . ($publicConfig['URI_CSS'] ?? 'public/css/'))
       ->setCmsParam(VC::DEAL_URI_JS, $url->getUri(true) . ($publicConfig['PATH_JS'] ?? 'public/js/'));
}

$publicPage = $publicConfig[VC::PUBLIC_PAGE] ?? null;
$main->setCmsParam(VC::ONLY_LOGIN, !boolValue($publicPage) || boolValue($publicConfig['ONLY_LOGIN'] ?? false))
     ->setCmsParam(VC::LEGEND_PATH, $url->getPath(true) . ($publicConfig['PATH_LEGEND'] ?? 'public/views/legend.php'));

define('URI_IMG', $main->getCmsParam(VC::URI_IMG));
define('PUBLIC_PAGE', $publicPage);
define('USE_CONTENT_EDITOR', $publicConfig['USE_CONTENT_EDITOR'] ?? false);

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main->afterConstDefine();
unset($url, $publicConfig, $publicPage, $dealConfig, $dbConfig);
