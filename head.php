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

  require CORE . 'controller/c_' . $main->url->getRoute() . '.php';
  echo $html;

  unset($html, $field);
}

unset($authStatus, $dbContent, $main);
