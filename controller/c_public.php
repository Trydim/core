<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $db
 */

if (!isset($main)) $main = new cms\Main();

$dbContent = "";
$field = [];

require ABS_SITE_PATH . 'public/public.php';

$authStatus = $main->checkStatus('ok');

// Если загрузка
if($authStatus && isset($_GET['orderId'])) {
	$orderId = $_GET['orderId'];

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


require ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php';
if (OUTSIDE) $html = template('outside', $field);
else $html = template('base', $field);
