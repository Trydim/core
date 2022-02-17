<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Администрирование',
];

$field['cssLinks'] = [CORE_CSS . 'module/admindb.css'];
$field['jsLinks'] = [CORE_JS . 'module/admindb.js'];

if (DB_TABLE_IN_SIDEMENU) {
  if (isset($_GET['tableName'])) $tableActive = $_GET['tableName'];
  else {
    // Todo путь к первому файлу
    $firstTable = '';
    reDirect('admindb?tableName=' . $firstTable);
  }
}

if (PATH_LEGEND && file_exists(PATH_LEGEND)) require PATH_LEGEND;

require $pathTarget;
$html = template('base', $field);
