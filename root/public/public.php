<?php

/**
 * @var array $field
 * @var string $field['pageTitle']
 * @var string $field['headContent']
 * @var string[] $field['cssLinks'] - относительно /public/css/
 * @var string[] $field['jsLinks'] - относительно /public/js/
 * @var string $field['pageHeader'] - По умолчанию пусто.
 * @var string $field['pageFooter'] - По умолчанию плашка.
 */
$field = $field ?? [];

/*// Прайс
$param = [
  'id'    => 'id-product',
  'name'  => 'Наименование',
  'mName' => 'Материал',
  'unit'  => 'Ед. изм.',
  'value' => ['Стоимость, руб.', 'float'],
];

$price = loadCVS($param, 'price.csv');

$price = json_encode(array_filter($price, function ($i) {
  return boolval(strlen($i['id']));
}));*/


$field = [
  'headContent' => '<meta name="Public"><meta name="description" content="Public">',
  'cssLinks'    => ['styles.css'],
  'jsLinks'     => ['calculator.min.js'],

  //'pageHeader' => '',
  'pageFooter'  => '',
];

/*$dbContent = "<input type='hidden' id='dataPrice' value='$price'>" .
             "<input type='hidden' id='dataConfig' value='$config'>";*/
/*
// Курс
$dbContent .= $main->getCourse();
*/
