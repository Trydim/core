<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 * @var object $db - global
 * @var string $pathTarget
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
$elementsColumn = $setting['optionsColumn'] ?? 'ID,C.name,E.name,activity,sort,last_edit_date';
$field['footerContent'] .= "<input type='hidden' id='elementsColumn' value='$elementsColumn'>";
$optionsColumn = $setting['elementsColumn'] ?? 'O.ID,images,O.name,U.ID,O.activity,sort,last_edit_date,MI.ID,input_price,MO.ID,output_percent,output_price';
$field['footerContent'] .= "<input type='hidden' id='optionsColumn' value='$optionsColumn'>";

// Типы товаров
$types = $db->selectQuery('codes', ['symbol_code', 'name']);
$section = $db->selectQuery('section', ['ID', 'name']);


// Валют и единиц измерения
$units = $db->selectQuery('units', ['ID', 'short_name']);
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
$properties = array_merge([], $properties);

unset($optionsColumn, $elementsColumn, $propSetting);
require $pathTarget;
$html = template('base', $field);
