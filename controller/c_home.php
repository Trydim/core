<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once 'core/php/libs/db.php';

if (!isset($db)) $db = new \RedBeanPHP\db('./config.php');

$curMonth = date('Y-m');
$dateRange = ["$curMonth-01 00:00:01", "$curMonth-31 23:59:59"];
$orders = $db->loadOrder(0, 1000,	'last_edit_date', false, $dateRange);

$field = [];
$field['cssLinks'] = []; //['/material-dashboard.css?v=2.1.2', 'libs/calendar/calendar.css'];//'libs/bootstrap.min.css',
$field['pageTitle'] = 'Home';
$field['footerContent'] = '';

if(count($orders)) {
	$orders = json_encode($orders);
	$field['footerContent'] .= "<div hidden id='ordersValue'>$orders</div>";
}

require $pathTarget;
$html = template('base', $field);
