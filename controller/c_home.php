<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $dbConfig
 * @var string $pathTarget
 */

require_once CORE . 'php/libs/db.php';

if (!isset($db)) $db = new \RedBeanPHP\db($dbConfig);

$curMonth = date('Y-m');
$dateRange = ["$curMonth-01 00:00:01", "$curMonth-31 23:59:59"];
$orders = $db->loadOrder(0, 1000,	'last_edit_date', false, $dateRange);

$field = [];
$field['cssLinks'] = [CORE_CSS . 'libs/calendar/calendar.css'];
$field['pageTitle'] = 'Home';
$field['footerContent'] = '';

if(count($orders)) {
	$orders = json_encode($orders);
	$field['footerContent'] .= "<div hidden id='ordersValue'>$orders</div>";
}

require $pathTarget;
$html = template('base', $field);
