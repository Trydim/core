<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
$field = [
	'pageTitle' => 'pageTitleEmtry',
];

require $pathTarget;
$html = template('base', $field);