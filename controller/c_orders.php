<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$param = [
  'showFilter' => $main->availablePage('dealers') && $main->getCmsParam('DEALERS_ORDERS_SHOW'),
];

$field = [
  'pageTitle' => 'Заказы',
  'jsLinks'   => [CORE_JS . 'module/orders.js?ver=9d335261f8'],
  'footerContent' => "<input type='hidden' id='dataUser' value='". json_encode($main->getLogin('all')) . "'>",
];

// получить конфиг текущего пользователя
$setting = $main->getLogin('customization');
$setting = $setting ?: [];

// Все доступные поля для заказов
$columns = $main->db->getBaseOrdersQueryColumns();
$param['orderColumns'] = $columns;
$field[VC::BASE_FOOTER_CONTENT] .= "<input type='hidden' id='dataOrdersAllColumn' value='" . json_encode($columns) . "'>";
// Колонки, которые отображаются.
$columns = $setting['ordersShowColumns'] ?? ['ID', 'createDate', 'lastEditDate', 'userName', 'customerName', 'status', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('orders', $item),
  ];
}, $columns);
$field[VC::BASE_FOOTER_CONTENT] .= "<input type='hidden' id='dataOrdersColumn' value='". json_encode($columns) . "'>";


// Пользовательские заказы
$columns = $setting['ordersShowVisitorColumns'] ?? ['ID', 'cpNumber', 'createDate', 'importantValue', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('visitorOrders', $item),
  ];
}, $columns);
$field[VC::BASE_FOOTER_CONTENT] .= "<input type='hidden' id='dataOrdersVisitColumn' value='". json_encode($columns) . "'>";

if ($param['showFilter']) {
  $param['dealers'] = $main->db->selectQuery('dealers', ['id', 'name']);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_ORDER_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
