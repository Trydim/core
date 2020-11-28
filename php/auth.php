<?php use RedBeanPHP\db;

if (!defined('MAIN_ACCESS')) die('access denied!');

require_once 'libs/db.php';
$db = new db();

!isset($authAction) && ($authAction = 'noAuthAction');
!isset($login) && ($login = '');
!isset($password) && ($password = '');

session_start();

switch ($authAction) {
	case 'login':
    if ($userId = $db->checkPassword($login, $password)) {
      $_SESSION['login'] = $login;
      $_SESSION['priority'] = $userId; //типа маскирую
      $_SESSION['id'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $db->setUserHash($userId, $_SESSION['hash']);

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
