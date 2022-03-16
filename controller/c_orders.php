<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var object $main
 * @var array $dbConfig
 * @var string $pathTarget
 */

$param = [];
$field = [
  'pageTitle' => 'Заказы',
  'jsLinks'   => [CORE_JS . 'module/orders.js?ver=170b891407'],
];

$user = [
  'permission' => $main->getSettings('permission'),
  'isAdmin'    => $main->getLogin('admin'),
];
$field['footerContent'] = "<input type='hidden' id='dataUser' value='". json_encode($user) . "'>";

// получить конфиг текущего пользователя
$setting = $main->getSettings('customization');
if (!$setting) $setting = new stdClass();

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

if ($main->getCmsParam('USERS_ORDERS') && !isset($setting->ordersVisitorColumnsSort)) {
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

$main->setControllerField($field)->fireHook('orderTemplate', $field);
require $pathTarget;
$html = template('base', $field);
