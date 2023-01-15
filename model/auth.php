<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in main.php
 */

$login = $login ?? '';
$password = $password ?? '';

!isset($_SESSION) && session_start();

switch ($cmsAction) {
  case 'login':
    $main->fireHook('authLoginBefore', $main);
    if ($user = $main->db->checkPassword($login, $password)) {
      $_SESSION['login']    = $login;
      $_SESSION['password'] = $password;
      $_SESSION['name']     = $user['name'];
      $_SESSION['id']       = $user['ID'];
      $_SESSION['PHPSESSID'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $main->db->setUserHash($user['ID'], $_SESSION['hash']);

      $main->reDirect();
    } else $main->reDirect("login?status=error&login=$login");
    break;
  case 'exit':
    if (isset($_SESSION['id'])) {
      $hash = password_hash(uniqid(), PASSWORD_BCRYPT);
      $main->db->setUserHash($_SESSION['id'], $hash);
      $_SESSION['password'] = uniqid();
      $_SESSION['target'] = '';
      $main->reDirect();
    }
    break;
}
