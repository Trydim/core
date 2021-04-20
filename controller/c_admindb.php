<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Administration DB',
];

$field['cssLinks'] = [CORE_CSS . 'module/admindb/admindb.css'];

if (DB_TABLE_IN_SIDEMENU) {
  if (isset($_GET['tableName'])) $tableActive = $_GET['tableName'];
  else {
    global $dbTables;
    count($dbTables) && reDirect(false, 'admindb?tableName=' . $dbTables[0]['fileName']);
  }
}

require $pathTarget;
$html = template('base', $field);
