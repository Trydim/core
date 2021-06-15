<?php
if (!defined('MAIN_ACCESS')) die('access denied!');
if (!isset($main) || !isset($target)) die('variables undefined');

/**
 * @var array $dbConfig
 */

session_start();

isset($_GET['status']) && $main->setLoginStatus($_GET['status']);
!isset($_SESSION['hash']) && $main->setLoginStatus('no');
//Проверка пароля
if (!$main->checkStatus('error') && isset($_SESSION['hash']) && $_SESSION['id'] === $_COOKIE['PHPSESSID']) {
  require_once CORE . 'model/classes/Db.php';
  $db = new RedBeanPHP\Db($dbConfig);
  if ($db->checkUserHash($_SESSION)) {
    $main->setLogin($_SESSION);
    $target === '' && reDirect(true);
  } else {
    $main->setLoginStatus('no');
  }
}

// Перейти на страницу входа(login) если нет регистрации и доступ к открытой странице закрыт или
// нет регистрации и целевая страница не открыта
if ($main->checkStatus('no') && $target !== 'login'
    && (ONLY_LOGIN || (PUBLIC_PAGE && $target !== 'public'))) {
  //$_SESSION['target'] = !in_array($target , [HOME_PAGE, PUBLIC_PAGE]) ? $target : '';
  $_SESSION['target'] = $target;
  reDirect(false);
} else if ($target === 'login') $pageTarget = isset($_SESSION['target']) ? $_SESSION['target'] : '';

session_abort();

// Установка всех параметров для аккаунта
if ($main->checkStatus('ok') && isset($db)) {
  // Меню
  $main->setSideMenu();

  if (DB_TABLE_IN_SIDEMENU) {
    $dbTables = [];
    if (CHANGE_DATABASE) USE_DATABASE && $dbTables = array_merge($dbTables, $db->getTables());
    else USE_DATABASE && $dbTables = array_merge($dbTables, $db->getTables('prop'));
    $dbTables = array_merge($dbTables, $db->scanDirCsv(PATH_CSV));
    //Xml::checkXml($dbTables);
  }

}
