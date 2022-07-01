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
define('PUBLIC_PAGE', $publicConfig['PUBLIC_PAGE'] ?? false);
define('USE_DATABASE', $publicConfig['USE_DATABASE'] ?? true);
define('CHANGE_DATABASE', USE_DATABASE ? ($publicConfig['CHANGE_DATABASE'] ?? false) : false);

define('CSV_DELIMITER', $publicConfig['CSV_DELIMITER'] ?? ';');
define('CSV_STRING_LENGTH', $publicConfig['CSV_STRING_LENGTH'] ?? 1000);

$main = new Main($publicConfig, $dbConfig ?? []);
$url = $main->url;

define('CORE_CSS', $url->getCoreUri(true) . 'assets/css/');
define('CORE_JS', $url->getCoreUri(true) . 'assets/js/');

// переместить в head, т.к. если есть $mode это все не надо
$main->setCmsParam('imgPath', $url->getPath(true) . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam('uriImg', $url->getBaseUri() . ($publicConfig['PATH_IMG'] ?? 'public/images/'))
     ->setCmsParam('uriCss', $url->getBaseUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
     ->setCmsParam('uriJs', $url->getBaseUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));

if ($main->isDealer()) {
  require $url->getPath(true) . 'config.php';

  // переместить в head, т.к. если есть $mode это все не надо
  $main->setCmsParam('PATH_CSV', $url->getPath(true) . SHARE_PATH . ($publicConfig['PATH_CSV'] ?? 'csv/'));
  unset($publicConfig['PATH_CSV']);

  $main->setCmsParam($publicConfig);
  $main->setSettings('dbConfig', $dbConfig ?? []);
  if (isset($publicConfig['PATH_IMG'])) {
    $main->setCmsParam('imgPath', $url->getPath(true) . $publicConfig['PATH_IMG'])
         ->setCmsParam('uriImg', $url->getUri() . $publicConfig['PATH_IMG']);
  }

  $main->setCmsParam('dealUriCss', $url->getUri() . ($publicConfig['URI_CSS'] ?? 'public/css/'))
       ->setCmsParam('dealUriJs', $url->getUri() . ($publicConfig['PATH_JS'] ?? 'public/js/'));
}

define('SETTINGS_PATH', $url->getPath(true) . SHARE_PATH . 'settingSave.json');

define('URI_IMG', $main->getCmsParam('uriImg'));
define('ONLY_LOGIN', $publicConfig['ONLY_LOGIN'] ?? !boolval(PUBLIC_PAGE)); // Можно перенести в main
define('USE_CONTENT_EDITOR', $publicConfig['USE_CONTENT_EDITOR'] ?? false);

!defined('OUTSIDE') && define('OUTSIDE', array_key_exists('outside', $_GET));

$main->afterConstDefine();

unset($url, $publicConfig, $dealConfig, $dbConfig);
