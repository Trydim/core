<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$curYear = date('Y');
$curMonth = date('m');
$daysInMonth = date('t', mktime(0, 0, 0, $curMonth, 1, $curYear));
$dateRange = [
  'dateCreateFrom' => "$curYear-$curMonth-01 00:00:00",
  'dateCreateTo' => "$curYear-$curMonth-$daysInMonth 23:59:59"
];
$ordersStatus = $main->db->loadOrderStatus();
$orders = $main->db->loadOrders([], $dateRange);

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

$main->setControllerField($field)->fireHook('calendarTemplate', $field);
require $main->url->getRoutePath();
$html = template('base', $field);
