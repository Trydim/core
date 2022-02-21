<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global
 */

// todo пропускать запросы к файлам. (почему не все файлы?)
preg_match("/\..+$/i", $_SERVER['REQUEST_URI'], $match);
if (!empty($match) && !in_array($match[0], ['.php', '.csv'])) die();
unset($match);

require __DIR__ . '/cmsSetting.php';

if (isset($_REQUEST['mode'])) require __DIR__ . '/model/main.php';
else {
  $html = '';

  $target = getTargetPage($_GET);
  $pathTarget = checkTemplate($target);

  if (OUTSIDE) $main->setLoginStatus('no');
  else {
    $main->checkAuth()
         ->setAccount()
         ->applyAuth($target);
  }

  $target === '' && $target = 'public';
  require __DIR__ . "/controller/c_$target.php";
  echo $html;
}

unset($target, $pathTarget, $html, $authStatus, $dbContent, $field, $orderId, $main);
