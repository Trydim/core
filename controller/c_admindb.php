<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

$field = [
	'pageTitle' => 'Administration DB',
];

$field['cssLinks'] = [CORE_CSS . 'libs/handsontable.full.min.css'];

if(DB_TABLE_IN_SIDEMENU && isset($_GET['tableName'])) {
  $tableActive = $_GET['tableName'];
}

require $pathTarget;
$html = template('base', $field);
