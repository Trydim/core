<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
$field = [
	'pageTitle' => 'Пользователи',
];

$field['sideRight'] = '';

require $pathTarget;
$html = template('base', $field);