<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Клиенты',
  'jsLinks'   => [CORE_JS . 'module/customers.js?ver=6347eef0e2'],
  'footerContent' => $main->getSettings('json', true),
];

// получить конфиг текущего пользователя
//$setting = $main->db->getUserSetting(/*login user*/);

if (!isset($setting)) {
  $columns = $main->db->loadCustomers(0, 1);

  if (count($columns)) {
    $columns = array_keys($columns[0]) ?: [];
    $columns = array_map(function ($item) {
      $dbName = $item;

      $item = [
        'dbName' => $dbName,
        'name' => gTxtDB('customers', $dbName),
      ];

      return $item;
    }, $columns);
  }
}

$param['columns'] = $columns;
require $main->url->getRoutePath();
$html = template('base', $field);
