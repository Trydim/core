<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 * @var object $db - global
 * @var string $pathTarget
*/

$field = [
	'pageTitle' => 'Пользователи',
  'footerContent' => '',
  'sideRight' => '',
];

$units = $db->selectQuery('units', ['ID', 'short_name']);
$money = $db->selectQuery('money', ['ID', 'name']);

$properties = [];
foreach ($db->getTables('prop') as $table) $properties[$table['name']] = $db->loadTable($table['dbTable']);
$properties = array_merge($properties, $main->getSettings('propertySetting'));



require $pathTarget;
$html = template('base', $field);
