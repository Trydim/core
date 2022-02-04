<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 * @var string $pathTarget
 */

$curMonth = date('Y-m');
$dateRange = ["$curMonth-01 00:00:01", "$curMonth-31 23:59:59"];
$ordersStatus = $main->db->loadTable('order_status');
$orders = $main->db->loadOrder(0, 1000,	'last_edit_date', false, $dateRange);

$field = [];
$field['cssLinks'] = [CORE_CSS . 'module/calendar.css'];
$field['jsLinks'] = [CORE_JS . 'module/calendar.js'];
$field['pageTitle'] = 'Календарь';
$field['footerContent'] = '';

if(count($orders)) {
	$orders = json_encode($orders);
	$field['footerContent'] .= "<div hidden id='ordersValue'>$orders</div>";
}

if(count($ordersStatus)) {
  $ordersStatus = json_encode($ordersStatus);
  $field['footerContent'] .= "<div hidden id='ordersStatusValue'>$ordersStatus</div>";
}

$main->setControllerField($field)->fireHook('calendarTemplate', $field);
require $pathTarget;
$html = template('base', $field);
