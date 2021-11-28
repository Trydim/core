<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var object $main
 * @var array $dbConfig
 * @var string $pathTarget
 */

$field = ['pageTitle' => 'Заказы'];

// получить конфиг текущего пользователя
$setting = $main->db->getUserSetting();
if (!$setting) $setting = json_decode('{}');

if (!isset($setting->ordersColumnsSort)) {
  $columns = $main->db->loadOrder(0, 1);
  if (!empty($columns)) {
    $setting->ordersColumnsSort = array_map(function ($item) {
      return [
        'dbName' => $item,
        'name'   => gTxtDB('orders', $item),
      ];
    }, array_keys($columns[0]));

    $param['ordersColumns'] = $setting->ordersColumnsSort;
  }
}

if (USERS_ORDERS && !isset($setting->ordersVisitorColumnsSort)) {
  $columns = $main->db->loadVisitorOrder(0, 1);
  if (!empty($columns)) {
    $setting->ordersVisitorColumnsSort = array_map(function ($item) {
      return [
        'dbName' => $item,
        'name'   => gTxtDB('visitorOrders', $item),
      ];
    }, array_keys($columns[0]));

    $param['ordersVisitorColumns'] = $setting->ordersVisitorColumnsSort;
  }
}

$main->exist('orderTemplate') && $field = doHook('orderTemplate', $field);
require $pathTarget;
$html = template('base', $field);
