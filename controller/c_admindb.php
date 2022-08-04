<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 */

$field = [
  'pageTitle' => 'Администрирование',
];

$field['cssLinks'] = [CORE_CSS . 'module/admindb.css?ver=3f0d36561c'];
$field['jsLinks'] = [
  CORE_JS . 'libs/handsontable.full.min.js?ver=f3bb2b6859',
  CORE_JS . 'module/admindb.js?ver=f3bb2b6859'
];

if (isset($_GET['tableName'])) $tableActive = $_GET['tableName'];
else {
  count($main->dbTables) && $main->reDirect('admindb?tableName=' . $main->dbTables[0]['fileName']);
}

$pathLegend = $main->getCmsParam('PATH_LEGEND');
if ($pathLegend && file_exists($pathLegend)) require $pathLegend;
unset($pathLegend);

require $main->url->getRoutePath();
$html = template('base', $field);
