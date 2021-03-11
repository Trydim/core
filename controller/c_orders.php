<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var object $main
 * @var object $db
 * @var array $dbConfig
 * @var string $pathTarget
 */

$field = ['pageTitle' => 'Заказы'];

// получить конфиг текущего пользователя
$setting = $db->getUserSetting();

if (!isset($setting->ordersColumnsSort)) {
  $columns = array_keys($db->loadOrder(0, 1)[0]);

  $setting->ordersColumnsSort = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name'   => gTxtDB('orders', $item),
    ];
  }, $columns);
}

if (USERS_ORDERS && !isset($setting->ordersVisitorColumnsSort)) {
  $columns = array_keys($db->loadVisitorOrder(0, 1)[0]);

  $setting->ordersVisitorColumnsSort = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name'   => gTxtDB('visitorOrders', $item),
    ];
  }, $columns);
}

$param['ordersColumns'] = $setting->ordersColumnsSort;
$param['ordersVisitorColumns'] = $setting->ordersVisitorColumnsSort;

$main->exist('orderTemplate') && $field = doHook('orderTemplate', $field);
require $pathTarget;
$html = template('base', $field);
