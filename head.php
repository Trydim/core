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

if ($main->getCmsParam('mode')) require CORE . '/model/main.php';
else {
  $html = '';
  $main->beforeController();

  // dealer branch
  // require CORE . 'controller/c_' . $main->url->getRoute() . '.php';

  $target = getTargetPage($_GET);
  $pathTarget = checkTemplate($target);

  if (OUTSIDE) $main->setLoginStatus('no');
  else {
    $main->checkAuth()
         ->setAccount()
         ->applyAuth($target);
  }

  $target === '' && $target = 'public';
  $pathController = __DIR__ . "/controller/c_$target.php";
  if (file_exists($pathController)) require $pathController;
  else $main->initDefaultController($html, $target, $pathTarget);

  echo $html;
  unset($html, $field);
}

unset($target, $pathTarget, $pathController, $authStatus, $dbContent, $main);
