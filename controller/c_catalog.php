<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
*/

$field = [
	'pageTitle' => 'Пользователи',
  'footerContent' => '',
];

$field['sideRight'] = '';

$properties = [];
foreach ($db->getTables('prop') as $table) $properties[$table['name']] = $db->loadTable($table['dbTable']);
$properties = array_merge($properties, $main->getSettings('propertySetting'));

require $pathTarget;
$html = template('base', $field);
