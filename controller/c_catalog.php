<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
*/

$field = [
	'pageTitle' => 'Пользователи',
];

$field['sideRight'] = '';

require $pathTarget;
$html = template('base', $field);
