<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$dateTo = date('Y-m-d');
$dateFrom = (new DateTime($dateTo))->modify('-1 month')->format('Y-m-d');
//$daysInMonth = date('t', mktime(0, 0, 0, $curMonth, 1, $curYear));
$dateRange = [
  'dateEditedFrom' => "$dateFrom 00:00:00",
  'dateEditedTo' => "$dateTo 23:59:59",
];
$ordersStatus = $main->db->loadOrderStatus();
$orders = $main->db->loadOrders(['countPerPage' => PHP_INT_MAX], $dateRange);

$field = [
  'pageTitle'     => 'Календарь',
  'cssLinks'      => [CORE_CSS . 'module/calendar.css?ver=1dbd460d5c'],
  'jsLinks'       => [
    CORE_JS . 'libs/fullCalendar.min.js?ver=960857bb87',
    CORE_JS . 'module/calendar.js?ver=960857bb87',
  ],
  'footerContent' => '',
];

if (count($orders)) {
  $orders = json_encode($orders);
  $field['footerContent'] .= "<div hidden id='ordersValue'>$orders</div>";
}

if (count($ordersStatus)) {
  $ordersStatus = json_encode($ordersStatus);
  $field['footerContent'] .= "<div hidden id='ordersStatusValue'>$ordersStatus</div>";
}

$main->setControllerField($field)->fireHook(VC::HOOKS_CALENDAR_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
