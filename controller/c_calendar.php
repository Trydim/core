<?php use RedBeanPHP\Db;

if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 * @var Db $db - global
 * @var string $pathTarget
 */

$db = $main->db;

$curMonth = date('Y-m');
$dateRange = ["$curMonth-01 00:00:01", "$curMonth-31 23:59:59"];
$ordersStatus = $db->loadTable('order_status');
$orders = $db->loadOrder(0, 1000,	'last_edit_date', false, $dateRange);

$field = [];
$field['cssLinks'] = [CORE_CSS . 'module/calendar/calendar.css'];
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

$main->exist('calendarTemplate') && $field = doHook('calendarTemplate', $field);
require $pathTarget;
$html = template('base', $field);
