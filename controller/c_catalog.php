<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$db = $main->getDB();

function prepareData($data) {
  return json_encode(array_map(function ($item) {
    $item['id'] = $item['ID'];
    unset($item['ID']);
    return $item;
  }, array_values($data)));
}

$field = [
  'pageTitle' => 'Каталог',
  'sideRight'     => '',
  'pageFooter'    => '',
  'footerContent' => '',
  'cssLinks'  => [CORE_CSS . 'module/catalog.css?ver=8cdf94ab40'],
  'jsLinks'   => [CORE_JS . 'module/catalog.js?ver=73262afc8e'],
];

// Загрузка настройки столбцов
$setting = $main->getSettings();
$value = $setting['optionsColumn'] ?? 'ID,C.name,E.name,activity,sort,lastEditDate';
$field['footerContent'] .= "<input type='hidden' id='elementsColumn' value='$value'>";
$value = $setting['elementsColumn'] ?? 'ID,images,name,unitId,activity,sort,lastEditDate,moneyInputId,inputPrice,moneyOutputId,outputPercent,outputPrice';
$field['footerContent'] .= "<input type='hidden' id='optionsColumn' value='$value'>";

// Типы товаров
$value = $db->selectQuery('codes', ['symbolCode', 'name']);
$field['footerContent'] .= "<input type='hidden' id='dataCodes' value='" . json_encode($value) . "'>";
// Единиц измерения
$value = $db->selectQuery('units', ['ID', 'name', 'shortName']);
$field['footerContent'] .= "<input type='hidden' id='dataUnits' value='" . prepareData($value) . "'>";
// Валюта
$value = $db->getMoney();
$field['footerContent'] .= "<input type='hidden' id='dataMoney' value='" . prepareData($value) . "'>";

// Все свойства
$value = $main->getSettings(VC::OPTION_PROPERTIES);
foreach ($db->getTables('prop') as $table) {
  $value[$table['dbTable']] = [
    'name'   => $value[$table['dbTable']]['name'] ?? $table['name'],
    'values' => array_map(function ($row) {
      $row['id'] = $row['ID'];
      return $row;
    }, $db->loadTable($table['dbTable'])),
  ];
}
$field['footerContent'] .= "<input type='hidden' id='dataProperties' value='" . json_encode($value) . "'>";

unset($value, $propSetting, $mess);

$main->setControllerField($field)->fireHook(VC::HOOKS_CATALOG_TEMPLATE, $main);
ob_start();
require $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
