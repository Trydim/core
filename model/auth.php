<?php

/**
 * @var $main {class} - global from
 */

if (!defined('MAIN_ACCESS')) die('access denied!');

!isset($authAction) && ($authAction = 'noAuthAction');
!isset($login) && ($login = '');
!isset($password) && ($password = '');

switch ($authAction) {
  case 'login':
    $main->fireHook('authLoginBefore', $main);
    if ($user = $main->db->checkPassword($login, $password)) {
      $_SESSION['login']    = $login;
      $_SESSION['password'] = $password;
      $_SESSION['name']     = $user['name'];
      $_SESSION['id']       = $user['ID'];
      $_SESSION['PHPSESSID'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      /*$main->getSettings('onlyOne') && */
      $main->db->setUserHash($user['ID'], $_SESSION['hash']);

      reDirect(isset($clientPageTarget) && $clientPageTarget !== 'login' ? $clientPageTarget : '');
    } else reDirect("login?status=error&login=$login");
    break;
  case 'exit':
    if (isset($_SESSION['id'])) {
      $hash = password_hash(uniqid(), PASSWORD_BCRYPT);
      /*$main->getSettings('onlyOne') &&*/
      $main->db->setUserHash($_SESSION['id'], $hash);
      $_SESSION['password'] = uniqid();
      $_SESSION['target'] = '';
      reDirect();
    }
    break;

}
