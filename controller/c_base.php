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
    $target === 'admin' && header('location: ' . SITE_PATH . PUBLIC_PAGE);
  } else {
    $main->setLoginStatus('no');
  }
}

if ( !$main->checkStatus('ok') && $target !== PUBLIC_PAGE) {
  $_SESSION['target'] = $target !== 'home' ? $target : '';
  $target = 'admin';
  $pathTarget = checkTemplate($target);
  //header('Location: ' . SITE_PATH . 'admin?status=' . $main->getLoginStatus());
}

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
