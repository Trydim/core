<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

$field = [
	'pageTitle' => 'File manager',
];

$field['cssLinks'] = [CORE_CSS . 'libs/fm/fileManager.css', CORE_CSS . 'libs/fm/font-awesome.min.css'];

require $pathTarget;
$html = template('base', $field);
