<?php if ( !defined('MAIN_ACCESS')) die('access denied!');
$field = [
	'pageTitle' => 'Administration DB',
];

$field['cssLinks'] = [CORE_CSS . 'libs/handsontable.full.min.css'];

if(DB_TABLE_IN_SIDEMENU && isset($_GET['tableName'])) {
  if (!isset($db)) exit('no bd connect'); // Включена ли БД проверка должны быть в базе.пхп

  $tableActive = $_GET['tableName'];
}

require $pathTarget;
$html = template('base', $field);
