<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$param = [
  'showFilter' => $main->getCmsParam('FILTER_ORDERS') ?? '',
];

$field = [
  VC::BASE_PAGE_TITLE => 'Заказы',
  VC::BASE_CSS_LINKS => [CORE_CSS . 'module/orders.css?ver=1'],
  VC::BASE_JS_LINKS  => [CORE_JS . 'module/orders.js?ver=9d335261f8'],
  VC::BASE_FOOTER_CONTENT => $main->getFrontContent('dataUser', $main->getLogin('all')),
];

// получить конфиг текущего пользователя
$setting = $main->getLogin('customization');
$setting = $setting ?: [];

// Все доступные поля для заказов
$columns = $main->db->getBaseOrdersQueryColumns();
$param['orderColumns'] = $columns;
$field[VC::BASE_FOOTER_CONTENT] .= $main->getFrontContent('dataOrdersAllColumn', $columns);
// Колонки, которые отображаются.
$columns = $setting['ordersShowColumns'] ?? ['ID', 'createDate', 'lastEditDate', 'userName', 'customerName', 'status', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('orders', $item),
  ];
}, $columns);
$field[VC::BASE_FOOTER_CONTENT] .= $main->getFrontContent('dataOrdersColumn', $columns);


// Пользовательские заказы
$columns = $setting['ordersShowVisitorColumns'] ?? ['ID', 'createDate', 'importantValue', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('visitorOrders', $item),
  ];
}, $columns);
$field[VC::BASE_FOOTER_CONTENT] .= $main->getFrontContent('dataOrdersVisitColumn', $columns);

if ($param['showFilter']) $param['filterOptions'] = $main->db->selectQuery($param['showFilter'], ['id', 'name']);

$main->setControllerField($field)->fireHook(VC::HOOKS_ORDER_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
