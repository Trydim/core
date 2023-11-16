<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

// todo пропускать запросы к файлам. (почему не все файлы?)
$uri = str_replace('?' . $_SERVER['QUERY_STRING'], '', $_SERVER['REQUEST_URI']);
preg_match("/\..+$/i", $uri, $match);
if (!empty($match) && !in_array($match[0], ['.php', '.csv'])) die();
unset($uri, $match);

require __DIR__ . '/cmsSetting.php';

if ($mode = $main->getCmsParam('mode')) {
  $componentPath = __DIR__ . '/model/';
  extract($_REQUEST);
  $cmsAction = $dbAction ?? $cmsAction ?? 'noAction';

  if (DEBUG || in_array($mode, ['auth', 'tBot', 'docs']) || $main->checkAction($cmsAction)) {
    try {
      switch ($mode) {
        case 'auth': require $componentPath . 'auth.php'; break;
        case 'load':
        case 'DB':      require $componentPath . 'db.php'; break;
        case 'docs':    require $componentPath . 'docs.php'; break;
        case 'FM':      require $componentPath . 'fileManager.php'; break;
        case 'setting': require $componentPath . 'setting.php'; break;
        case 'socket':  require $componentPath . 'socket.php'; break;
        case 'tBot': require  __DIR__ . '/modelBot.php';
      }
    } catch (Exception $e) {
      $main->response->setContent($e->getMessage());
    }
  } else $main->response->setContent(['error' => 'Auth no passing!']);
} else {
  $main->beforeController();

  $pathController = 'controller/c_' . $main->url->getRoute() . '.php';
  if (file_exists(ABS_SITE_PATH . "public/" . $pathController)) require ABS_SITE_PATH . "public/" . $pathController;
  else if (file_exists(CORE . $pathController)) require CORE . $pathController;
  else $main->initDefaultController();

  unset($pathController, $field);
}

$main->response->send();
unset($authStatus, $dbContent, $main);
