<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $publicConfig - config from public
 */

require ABS_SITE_PATH . 'config.php';
require __DIR__ . '/model/func.php';

spl_autoload_register('cmsAutoloader');

const CORE          = __DIR__ . '/',
      SHARE_PATH    = 'shared/',
      DEALERS_PATH  = 'dealer/',
      SETTINGS_PATH = ABS_SITE_PATH . SHARE_PATH . 'settingSave.json',
      CSV_CACHE     = ABS_SITE_PATH . SHARE_PATH . 'csvCache.bin',
      SYSTEM_PATH   = ABS_SITE_PATH . SHARE_PATH . 'system.php'; // TODO перенести в DB

$main = new Main($publicConfig, $dbConfig ?? []);
$url = $main->url;

define('DEBUG', array_key_exists('DEBUG', $publicConfig));
define('URI', $url->getHost());
define('SITE_PATH', $url->getSitePath());
define('CORE_CSS', $url->getCoreUri() . 'assets/css/');
define('CORE_JS', $url->getCoreUri() . 'assets/js/');

define('PUBLIC_PAGE', $publicConfig['PUBLIC_PAGE'] ?? false);
define('USE_DATABASE', $publicConfig['USE_DATABASE'] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($publicConfig['CHANGE_DATABASE'] ?? false) : false);

define('CSV_DELIMITER', $publicConfig['CSV_DELIMITER'] ?? ';');
define('CSV_STRING_LENGTH', $publicConfig['CSV_STRING_LENGTH'] ?? 1000);

$main->setCmsParam('imgPath', ABS_SITE_PATH . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam('uriImg', $url->getFullUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam('uriCss', $url->getFullUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
     ->setCmsParam('uriJs', $url->getFullUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));

if ($main->isDealer()) {
  $main->setCmsParam('MAIN_CSV', $main->getCmsParam('PATH_CSV')); // TODO не удобно

  require $main->getCmsParam('dealerPath') . 'config.php';
  $dealPath = $main->getCmsParam('dealerPath');

  $main->setCmsParam('PATH_CSV', ABS_SITE_PATH . $dealPath . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'));
  unset($publicConfig['PATH_CSV']);

  $main->setCmsParam($publicConfig);
  $main->setSettings('dbConfig', $dbConfig ?? []);
  if (isset($publicConfig['PATH_IMG'])) {
    $main->setCmsParam('imgPath', ABS_SITE_PATH . $dealPath . $publicConfig['PATH_IMG'])
         ->setCmsParam('uriImg', $url->getDealerUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'));
  }

  $main->setCmsParam('dealUriCss', $url->getDealerUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
       ->setCmsParam('dealUriJs', $url->getDealerUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));

  unset($dealPath);
}

define('URI_IMG', $main->getCmsParam('uriImg'));
define('ONLY_LOGIN', $publicConfig['ONLY_LOGIN'] ?? !boolval(PUBLIC_PAGE)); // Можно перенести в main
define('USE_CONTENT_EDITOR', $publicConfig['USE_CONTENT_EDITOR'] ?? false);

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main->setHooks();

unset($url, $publicConfig, $dealConfig, $dbConfig);
