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
  'userId'        => $main->getLogin('id'),
  'login'         => isset($result['user']['login']) ? $result['user']['login'] : '',
  'orderMail'     => isset($result['setting']['orderMail']) ? $result['setting']['orderMail'] : '',
  'orderMailCopy' => isset($result['setting']['orderMailCopy']) ? $result['setting']['orderMailCopy'] : '',
];

$admin = $db->getUser($main->getLogin(), 'name, permission_id');
$admin = $admin['permission_id'] === 1 || strtolower($admin['name']) === 'admin';
$param['admin'] = $admin;

require $pathTarget;
$html = template('base', $field);
