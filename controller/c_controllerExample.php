<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

$field = [
	'pageTitle' => 'pageTitleEmtry',
];

require $pathTarget;
$html = template('base', $field);
