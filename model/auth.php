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
    $main->fireHook(VC::HOOKS_AUTH_LOGIN_BEFORE, $main);
    if ($user = $main->db->checkPassword($login, $password)) {
      $_SESSION['id']       = $user['id'];
      $_SESSION['name']     = $user['name'];
      $_SESSION['login']    = $login;
      $_SESSION['password'] = $password;
      $_SESSION['PHPSESSID'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $main->db->setUserHash($user['id'], $_SESSION['hash']);

      if ($main->isDealer()) {
        $id = $main->getCmsParam('dealerId');

        $_SESSION['dealerId'] = $id;
        setcookie('dealerLink', $id);
      }

      $main->reDirect();
    } else $main->reDirect("login?status=error&login=$login");
    break;
  case 'exit':
    if (isset($_SESSION['id'])) {
      $hash = password_hash(uniqid(), PASSWORD_BCRYPT);
      $target = $_COOKIE['dealerLink'] ?? '';
      $_SESSION['password'] = uniqid();

      $main->db->setUserHash($_SESSION['id'], $hash);
      setcookie('dealerLink', '');

      array_map(function ($key) { unset($_SESSION[$key]); }, ['target', 'dealerLink', 'dealerId']);
      $main->reDirect($target);
    }
    break;
}
