<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var object $db
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Настройки',
];

$setAction = 'load';
require CORE . 'php/setting.php';

$param = [
  'userId'         => $main->getLogin('id'),
  'login'          => isset($result['user']['login']) ? $result['user']['login'] : '',
  'orderMail'      => isset($result['setting']['orderMail']) ? $result['setting']['orderMail'] : '',
  'orderMailCopy'  => isset($result['setting']['orderMailCopy']) ? $result['setting']['orderMailCopy'] : '',
];

if (USE_DATABASE) {
  //$setAction = 'loadPermission';
  //require CORE . 'php/setting.php';
  $admin = $db->getUser($main->getLogin(), 'permission_id');
  $admin = $admin === '1'; // || strtolower($admin['name']) === 'admin';
} else $admin = true;
$param['admin'] = $admin;

require $pathTarget;
$html = template('base', $field);
