<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 */

$login = $login ?? '';
$password = $password ?? '';

!isset($_SESSION) && session_start();

switch ($cmsAction) {
  case 'login':
    $main->fireHook(VC::HOOKS_AUTH_LOGIN_BEFORE, $main);
    if ($user = $main->db->checkPassword($login, $password)) {

      $_SESSION['id']       = $user['id'];
      $_SESSION['name']     = $user['name'];
      $_SESSION['login']    = $login;
      $_SESSION['password'] = $password;
      $_SESSION['PHPSESSID'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $main->db->setUserHash($user['id'], $_SESSION['hash']);

      if ($main->isDealer() || isset($user['dealerId'])) {
        $_SESSION['dealerId'] = $user['dealerId'] ?? $main->getCmsParam('dealerId');
      }

      $main->reDirect(isset($user['dealerId']) ? 'dealer/' . $user['dealerId'] : '');
    } else $main->reDirect("login?status=error&login=$login");
    break;
  case 'exit':
    if (isset($_SESSION['id'])) {
      $_SESSION['password'] = uniqid();
      $hash = password_hash(uniqid(), PASSWORD_BCRYPT);

      $main->db->setUserHash($_SESSION['id'], $hash);
      $main->reDirect(isset($user['dealerId']) ? 'dealer/' . $user['dealerId'] : '');
    }
    break;
}
