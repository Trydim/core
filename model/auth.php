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
      $_SESSION['login']    = $user['login'];
      $_SESSION['password'] = $password;
      $_SESSION['PHPSESSID'] = $_COOKIE['PHPSESSID'];

      $_SESSION['hash'] = password_hash($_COOKIE['PHPSESSID'] . $password, PASSWORD_BCRYPT);
      $main->db->setUserHash($user['id'], $_SESSION['hash']);

      if ($main->isDealer() || isset($user['dealerId'])) {
        $_SESSION['dealerId'] = $user['dealerId'] ?? $main->getCmsParam('dealerId');

        // Subdomain or sub folder
        $target = $main->url->getUri();

        if (empty($main->url->getSubDomain())) {
          $scheme = '://';
          $target = str_replace($scheme, $scheme . $user['urlPrefix'] . '.', $target);

          $target .= '?save=' . $_SESSION['PHPSESSID'];
        }

        else if (!$main->getCmsParam(VC::USE_DEAL_SUBDOMAIN)) {
          $dealLink = "dealer/$user[dealerId]";
          if (!includes($target, $dealLink)) $target .= "dealer/$user[dealerId]";
        }

        header('Location: ' . $target, true, 303);
        die;
      }

      else $main->reDirect('');
    } else $main->reDirect("login?status=error&login=$login");
    break;
  case 'exit':
    if (isset($_SESSION['id'])) {
      $userId = $_SESSION['id'];
      $dealerId = $_SESSION['dealerId'] ?? false;
      session_destroy();
      session_abort();

      $main->db->setUserHash($userId, password_hash(uniqid(), PASSWORD_BCRYPT));
      $main->reDirect($dealerId ? 'dealer/' . $dealerId : '');
    }
    break;
}
