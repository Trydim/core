<?php use RedBeanPHP\Db;

if (!defined('MAIN_ACCESS')) die('access denied!');

require_once 'libs/Db.php';
$db = new Db();

!isset($authAction) && ($authAction = 'noAuthAction');
!isset($login) && ($login = '');
!isset($password) && ($password = '');

session_start();

switch ($authAction) {
  case 'login':
    if ($user = $db->checkPassword($login, $password)) {
      $_SESSION['login'] = $user['name'];
      $_SESSION['priority'] = $user['ID']; //типа маскирую
      $_SESSION['id'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $db->setUserHash($user['ID'], $_SESSION['hash']);

      reDirect(true, (isset($clientPageTarget) && $clientPageTarget !== 'login') ? $clientPageTarget : '');
    } else reDirect(false, "login?status=error&login=$login&password=$password");
    break;
  case 'exit':
    if (isset($_SESSION['priority'])) {
      $hash = password_hash(uniqid(), PASSWORD_BCRYPT);
      $db->setUserHash($_SESSION['priority'], $hash);
      $_SESSION['target'] = '';
      reDirect(false);
    }
    break;

}
