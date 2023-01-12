<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var Main $main - global
 */

$param = [
  'showFilter' => $main->availablePage('dealers') && $main->getCmsParam('DEALERS_ORDERS_SHOW'),
];
$user = [
  'permission' => $main->getLogin(VC::USER_PERMISSION),
  'isAdmin'    => $main->getLogin(VC::USER_IS_ADMIN),
];
$field = [
  'pageTitle' => 'Заказы',
  'jsLinks'   => [CORE_JS . 'module/orders.js?ver=9d335261f8'],
  'footerContent' => "<input type='hidden' id='dataUser' value='". json_encode($user) . "'>",
];

// получить конфиг текущего пользователя
$setting = $main->getSettings('customization');
if (!$setting) $setting = new stdClass();

if (!isset($setting->ordersColumnsSort)) {
  $columns = ['ID', 'createDate', 'lastEditDate', 'userName', 'customerName', 'status', 'total'];

  $columns = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name'   => gTxtDB('orders', $item),
    ];
  }, $columns);

  $field[VC::BASE_FOOTER_CONTENT] .= "<input type='hidden' id='dataOrdersColumn' value='". json_encode($columns) . "'>";
}

if ($main->getCmsParam('USERS_ORDERS') && !isset($setting->ordersVisitorColumnsSort)) {
  $columns = ['ID', 'createDate', 'lastEditDate', 'userName', 'customerName', 'status', 'total'];

  $param['ordersVisitorColumns'] = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name'   => gTxtDB('visitorOrders', $item),
    ];
  }, $columns);
}

if ($param['showFilter']) {
  $param['dealers'] = $main->db->selectQuery('dealers', ['id', 'name']);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_ORDER_TEMPLATE, $main);
require $main->url->getRoutePath();
$html = template('base', $field);
