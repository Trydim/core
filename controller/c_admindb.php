<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Администрирование',
];

$field['cssLinks'] = [CORE_CSS . 'module/admindb.css?ver=3f0d36561c'];
$field['jsLinks'] = [CORE_JS . 'module/admindb.js?ver=f3bb2b6859'];

if ($main->getCmsParam('DB_TABLE_IN_SIDEMENU')) {
  if (isset($_GET['tableName'])) $tableActive = $_GET['tableName'];
  else {
    global $dbTables;
    count($dbTables) && reDirect('admindb?tableName=' . $dbTables[0]['fileName']);
  }
}

$pathLegend = $main->getCmsParam('PATH_LEGEND');
if ($pathLegend && file_exists($pathLegend)) require $pathLegend;
unset($pathLegend);

$main->setControllerField($field)->fireHook('admindbTemplate', $field);
require $pathTarget;
$html = template('base', $field);
