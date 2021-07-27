<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $db - global
 * @var string $pathTarget
 * @var object $main - global
 */

function prepareData($data) {
  return json_encode(array_reduce($data, function ($r, $item) {
    $r[$item['ID']] = $item;
    return $r;
  }, []));
}

$field = [
	'pageTitle' => 'Пользователи',
  'footerContent' => '',
  'sideRight' => '',
];

// Загрузка настройки столбцов
$setting = getSettingFile();
$elementsColumn = $setting['optionsColumn'] ?? 'ID,C.name,E.name,activity,sort,lastEditDate';
$field['footerContent'] .= "<input type='hidden' id='elementsColumn' value='$elementsColumn'>";
$optionsColumn = $setting['elementsColumn'] ?? 'ID,images,name,unitId,activity,sort,lastEditDate,moneyInputId,inputPrice,moneyOutputId,outputPercent,outputPrice';
$field['footerContent'] .= "<input type='hidden' id='optionsColumn' value='$optionsColumn'>";

// Типы товаров
$types = $db->selectQuery('codes', ['symbolCode', 'name']);
$section = $db->selectQuery('section', ['ID', 'name']);


// Валют и единиц измерения
$units = $db->selectQuery('units', ['ID', 'shortName']);
$field['footerContent'] .= "<input type='hidden' id='dataUnits' value='" . prepareData($units) . "'>";
$money = $db->selectQuery('money', ['ID', 'name']);
$field['footerContent'] .= "<input type='hidden' id='dataMoney' value='" . prepareData($money) . "'>";

// Все свойства
$properties = $main->getSettings('propertySetting');
foreach ($db->getTables('prop') as $table) {
  $name = isset($properties[$table['dbTable']])
    ? $properties[$table['dbTable']]['name']
    : $table['name'];

  $properties[$table['dbTable']] = [
    'name' => $name,
    'values' => $db->loadTable($table['dbTable']),
  ];
}
//$properties = array_merge([], $properties); //бредовая строка

unset($optionsColumn, $elementsColumn, $propSetting);
require $pathTarget;
$html = template('base', $field);
