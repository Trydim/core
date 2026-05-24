<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$param = [
  'showFilter' => $main->getCmsParam('FILTER_ORDERS') ?? '',
];

$main->addControllerField(VC::BASE_PAGE_TITLE, gTxt('Orders'))
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataUser', $main->getLogin('all')));

// получить конфиг текущего пользователя
$setting = $main->getLogin('customization');
$setting = $setting ?: [];

// Все доступные для сортировки колонки
$param['orderColumns'] = $columns = $main->db->getBaseOrdersQueryColumns();
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataOrdersAllColumn', $columns));
// Колонки, которые отображаются.
$columns = $setting['ordersShowColumns'] ?? ['id', 'createDate', 'lastEditDate', 'userName', 'customerName', 'status', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('orders', $item),
  ];
}, $columns);
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataOrdersColumn', $columns));


// Пользовательские заказы
$columns = $setting['ordersShowVisitorColumns'] ?? ['id', 'createDate', 'importantValue', 'total'];
$columns = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name'   => gTxtDB('visitorOrders', $item),
  ];
}, $columns);
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataOrdersVisitColumn', $columns));

if ($param['showFilter']) $param['filterOptions'] = $main->db->selectQuery($param['showFilter'], ['id', 'name']);

$main->fireHook(VC::HOOKS_ORDER_TEMPLATE, $main);

require $main->url->getRoutePath();
$main->addControllerField(VC::BASE_FOOTER_CONTENT, template('parts/ordersFooterContent', $param))
     ->response->setContent(template());
