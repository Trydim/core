<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'Администрирование');

$main->addAssets([
  'module/admindb.css',
  'libs/handsontable.full.min.js',
  'module/admindb.js',
]);

if ($main->url->request->has('tableName')) $tableActive = $main->url->request->get('tableName');
else {
  count($main->dbTables) && $main->reDirect('admindb?tableName=' . $main->dbTables[0]['fileName']);
}

$pathLegend = $main->getCmsParam(VC::LEGEND_PATH);
if ($pathLegend && file_exists($pathLegend)) require $pathLegend;
unset($pathLegend);

$main->fireHook(VC::HOOKS_ADMIN_DB_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template());
