<?php

/**
 * @var Main $main - global
 *
 * @var array $field
 * @var string $field['pageTitle']
 * @var string $field['headContent']
 * @var string[] $field['cssLinks'] - использовать с , для css админки добавить CORE_CSS
 * @var string[] $field['jsLinks'] - относительно /public/js/, для js админки добавить CORE_JS
 * @var string $field['pageHeader'] - По умолчанию пусто.
 * @var string $field['pageFooter'] - По умолчанию плашка.
 *
 * @var string $publicCss
 * @var string $publicJs
 */
$field = $field ?? [
  'cssLinks' => [],
  'jsLinks'  => [],
];

/*// Прайс
$param = [
  'id'    => 'id-product',
  'name'  => 'Наименование',
  'mName' => 'Материал',
  'unit'  => 'Ед. изм.',
  'value' => ['Стоимость, руб.', 'float'],
];

$price = loadCSV($param, 'price.csv');

$price = json_encode(array_filter($price, function ($i) {
  return boolval(strlen($i['id']));
}));*/


$field['cssLinks'][] = $publicCss . 'styles.css';
$field['jsLinks'][] = $publicJs . 'calculator.min.js';
//$field['pageHeader'] = '';
$field['pageFooter'] = '';

/*$dbContent = "<input type='hidden' id='dataPrice' value='$price'>" .
             "<input type='hidden' id='dataConfig' value='$config'>";*/

// Настройки
// $dbContent .= $main->getSettings('json', true);

// Курс
//$dbContent .= $main->getCourse();

