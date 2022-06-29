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

if (isset($_REQUEST['mode'])) require __DIR__ . '/model/main.php';
else {
  $html = '';

  if ($main->isDealer()) {
    $targetPage = str_replace($main->getCmsParam('dealerPath'), '', $_GET['targetPage'] ?? '');
    $target = getTargetPage($targetPage);
  } else {
    $target = getTargetPage($_GET['targetPage'] ?? '');
  }

  $pathTarget = checkTemplate($target);

  $main->beforeController($target);

  $target === '' && $target = 'public';
  require __DIR__ . "/controller/c_$target.php";
  echo $html;

  unset($html, $target, $pathTarget, $dbContent, $field);
}

unset($authStatus, $dbContent, $main);
