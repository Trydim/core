<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */

require ABS_SITE_PATH . 'config.php';
require __DIR__ . '/model/func.php';

spl_autoload_register('cmsAutoloader');

const CORE          = __DIR__ . '/',
      SHARE_PATH    = 'shared/',
      DEALERS_PATH  = 'dealer',
      SYSTEM_PATH   = ABS_SITE_PATH . SHARE_PATH . 'system.php'; // TODO перенести в DB

define('DEBUG', array_key_exists('DEBUG', $publicConfig));
define('PUBLIC_PAGE', $publicConfig[VC::PUBLIC_PAGE] ?? false);
define('USE_DATABASE', $publicConfig[VC::USE_DATABASE] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($publicConfig[VC::CHANGE_DATABASE] ?? false) : false);

define('CSV_DELIMITER', $publicConfig['CSV_DELIMITER'] ?? ';');
define('CSV_STRING_LENGTH', $publicConfig['CSV_STRING_LENGTH'] ?? 1000);

$main = new Main($publicConfig, $dbConfig ?? []);
$url = $main->url;

define('CORE_CSS', $url->getCoreUri() . 'assets/css/');
define('CORE_JS', $url->getCoreUri() . 'assets/js/');

// Переместить в head, т.к. если есть $mode это все не надо
$main->setCmsParam(VC::CSV_PATH, $url->getPath(true) . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'))
     ->setCmsParam(VC::LEGEND_PATH, $url->getPath(true) . ($publicConfig['PATH_LEGEND'] ?? 'public/views/legend.php'))
     ->setCmsParam(VC::IMG_PATH, $url->getBasePath(true) . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam(VC::URI_IMG, $url->getBaseUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam(VC::URI_CSS, $url->getBaseUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
     ->setCmsParam(VC::URI_JS, $url->getBaseUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));

if ($main->isDealer()) {
  require $url->getPath(true) . 'config.php';

  // Переместить в head, т.к. если есть $mode это все не надо
  $main->setCmsParam('csvMain', $main->getCmsParam(VC::CSV_PATH))
       ->setCmsParam(VC::CSV_PATH, $url->getPath(true) . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'));
  unset($publicConfig['PATH_CSV']);

  $main->setCmsParam($publicConfig);
  $main->setSettings(VC::DB_CONFIG, $dbConfig ?? []);
  if (isset($publicConfig['PATH_IMG'])) {
    $main->setCmsParam(VC::IMG_PATH, $url->getPath(true) . $publicConfig['PATH_IMG'])
         ->setCmsParam(VC::URI_IMG, $url->getUri() . $publicConfig['PATH_IMG']);
  }

  $main->setCmsParam(VC::DEAL_URI_CSS, $url->getUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
       ->setCmsParam(VC::DEAL_URI_JS, $url->getUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));
}

define('URI_IMG', $main->getCmsParam(VC::URI_IMG));
define('ONLY_LOGIN', $publicConfig['ONLY_LOGIN'] ?? !boolval(PUBLIC_PAGE)); // Можно перенести в main
define('USE_CONTENT_EDITOR', $publicConfig['USE_CONTENT_EDITOR'] ?? false);

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main->afterConstDefine();

unset($url, $publicConfig, $dealConfig, $dbConfig);
