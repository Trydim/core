<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

if (!isset($main)) $main = new cms\Main();

// Прайс
$param = [
	'id'    => 'id-product',
	'name'  => 'Наименование',
	'mName' => 'Материал',
	'unit'  => 'Ед. изм.',
	'value' => ['Стоимость, руб.', 'float'],
];

$price = loadCVS($param, 'price.csv');

$price = json_encode(array_filter($price, function ($i) {
	return boolval(strlen($i['id']));
}));

// Конфиг параметров
$param = [
  'key'   => 'key*',
  'value' => ['значение', 'float'],
];

$config = loadCVS($param, 'config.csv');

$config = json_encode(array_filter($config, function ($i) {
  return boolval(strlen($i['key']));
}));


$authStatus = $main->checkStatus('ok');
$field = [];

$field['headContent'] = '<meta name="Калькулятор"><meta name="description" content="Калькулятор">';
$field['cssLinks']    = ['style.css'];
$field['pageTitle']   = 'Калькулятор';
$field['pageFooter']  = '';
//$field['pageHeader'] = '';

$dbContent = "<input type='hidden' id='dataPrice' value='$price'>" .
             "<input type='hidden' id='dataConfig' value='$config'>";

// Если загрузка
if($authStatus && isset($_GET['orderId'])) {
	$orderId = $_GET['orderId'];

	require_once 'php/libs/db.php';

	if(!isset($db)) $db = new \RedBeanPHP\db('config.php');

	if (is_finite($orderId)) {
	  $order = $db->loadOrderById([$orderId]);

    if ($order) {
      $customers = $db->loadCustomerByOrderId($order['ID']);

      $dbContent .= "<input type='hidden' id='orderSaveValue' value='$order[save_value]'>" .
                    "<input type='hidden' id='orderReport' value='$order[report_value]'>" .
                    "<input type='hidden' id='orderImportantValue' value='$order[important_value]'>";

      if($customers) {
        $customers = json_encode($customers);
        $dbContent .= "<input type='hidden' id='customerLoadOrders' value='$customers'>";
      }
    }
  }

}

if(!$authStatus) $field['sideLeft'] = '';

require $pathTarget;
$html = template('base', $field);
