<?php use RedBeanPHP\db;

if (!defined('MAIN_ACCESS')) die('access denied!');

require_once './libs/db.php';
$db = new db('../config.php');

!isset($authAction) && ($authAction = 'noAuthAction');
!isset($login) && ($login = '');
!isset($password) && ($password = '');

session_start();

switch ($authAction) {
	case 'login':
		if($userId = $db->checkPassword($login, $password)) {
			$_SESSION['login']    = $login;
			$_SESSION['priority'] = $userId; //типа маскирую
			$_SESSION['id']       = $_COOKIE['PHPSESSID'];

			$_SESSION['hash']  = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
			$db->setUserHash($userId, $_SESSION['hash']);
      //$result = isset($_SESSION['target']) && $_SESSION['target'] !== 'admin' ? $_SESSION['target'] : '';
      $result = isset($clientPageTarget) && strlen($clientPageTarget) ? $clientPageTarget : PUBLIC_PAGE;
		} else $result = "admin?status=error&login=$login&password=$password";
		break;
	case 'exit':
		if(isset($_SESSION['priority'])) {
			$hash = password_hash(uniqid(), PASSWORD_BCRYPT);
			$db->setUserHash($_SESSION['priority'], $hash);
			$_SESSION['target'] = '';
			$result = 'admin?status=no';
		}
		break;

}

header('location: ' . SITE_PATH . $result);
die();