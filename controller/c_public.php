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
if ($authStatus && isset($_GET['orderId'])) {
  $orderId = $_GET['orderId'];

  if (is_finite($orderId)) {
    $order = $db->loadOrderById($orderId);

    if ($order) {
      $customer = $db->loadCustomerByOrderId($order['ID']);

      $order = json_encode($order);
      $dbContent .= "<input type='hidden' id='dataOrder' value='$order'>";

      if ($customer) {
        $customer = json_encode($customer);
        $dbContent .= "<input type='hidden' id='dataCustomer' value='$customer'>";
      }
    }
  }

}

if ($authStatus && isset($_GET['orderVisitorId'])) {
  $orderId = $_GET['orderVisitorId'];

  if (is_finite($orderId)) {
    $order = $db->selectQuery('client_orders', ['*'], "cp_number = '$orderId'");

    if (count($order) === 1) {
      $order = json_encode($order[0]);
      $dbContent .= "<input type='hidden' id='dataVisitorOrder' value='$order'>";
    }
  }
}

if (!$authStatus) $field['sideLeft'] = '';


require ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php';
if (OUTSIDE) $html = template('outside', $field);
else $html = template('base', $field);
