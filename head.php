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

  if (DEBUG || in_array($mode, ['auth', 'docs']) || $main->checkAction($cmsAction)) {
    try {
      switch ($mode) {
        case 'auth': require $componentPath . 'auth.php'; break;
        case 'load':
        case 'DB':      require $componentPath . 'db.php'; break;
        case 'docs':    require $componentPath . 'docs.php'; break;
        case 'FM':      require $componentPath . 'fileManager.php'; break;
        case 'setting': require $componentPath . 'setting.php'; break;
      }
    } catch (Exception $e) {
      $main->response->setContent($e->getMessage());
    }
  } else $main->response->setContent(['error' => 'Auth no passing!']);
} else {
  $main->beforeController();

  $pathController = CORE . 'controller/c_' . $main->url->getRoute() . '.php';
  if (file_exists($pathController)) require $pathController;
  else $main->initDefaultController();

  unset($pathController, $field);
}

$main->response->send();
unset($authStatus, $dbContent, $main);
