<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Администрирование',
];

$field[VC::BASE_CSS_LINKS] = [CORE_CSS . 'module/admindb.css?ver=3f0d36561c'];
$field[VC::BASE_JS_LINKS] = [
  CORE_JS . 'libs/handsontable.full.min.js?ver=f3bb2b6859',
  CORE_JS . 'module/admindb.js?ver=f3b1b2b65119'
];

if (isset($_GET['tableName'])) $tableActive = $_GET['tableName'];
else {
  count($main->dbTables) && $main->reDirect('admindb?tableName=' . $main->dbTables[0]['fileName']);
}

$pathLegend = $main->getCmsParam(VC::LEGEND_PATH);
if ($pathLegend && file_exists($pathLegend)) require $pathLegend;
unset($pathLegend);

$main->setControllerField($field)->fireHook(VC::HOOKS_ADMIN_DB_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
