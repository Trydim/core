<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
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

require $pathTarget;
$html = template('base', $field);
