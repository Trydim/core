<?php
if (!defined('MAIN_ACCESS')) die('access denied!');
if (!isset($main) || !isset($target)) die('variables undefined');

/**
 * @var array $dbConfig
 */

if (isset($_GET['status'])) $main->setLoginStatus($_GET['status']);

session_start();

//Проверка пароля
if (!$main->checkStatus('error') && isset($_SESSION['hash']) && $_SESSION['id'] === $_COOKIE['PHPSESSID']) {
  require_once CORE . 'php/libs/db.php';
  $db = new RedBeanPHP\db($dbConfig);
  if ($db->checkUserHash($_SESSION)) {
    $main->setLogin($_SESSION);
    $target === '' && reDirect(true);
  } else {
    $main->setLoginStatus('no');
  }
}

// Перейти на страницу входа(login) если нет регистрации и доступ к открытой странице закрыт (ONLY_LOGIN === false/'')
if ($main->checkStatus('no') && (ONLY_LOGIN && $target !== 'login')) {
  //$_SESSION['target'] = !in_array($target , [HOME_PAGE, PUBLIC_PAGE]) ? $target : '';
  $_SESSION['target'] = $target;
  reDirect(false);
} else if ($target === 'login') $pageTarget = isset($_SESSION['target']) ? $_SESSION['target'] : '';

session_abort();

if (DB_TABLE_IN_SIDEMENU && $main->checkStatus('ok') && isset($db)) {
  $dbTables = [];
  CHANGE_DATABASE && USE_DATABASE && $dbTables = array_merge($dbTables, $db->getTables());
  $dbTables = array_merge($dbTables, $db->scanDirCsv());
  $dbTables = array_map(function ($item) {
    $item['name'] = gTxt($item['name']);
    return $item;
  }, $dbTables);
}
