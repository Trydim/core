<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 */

$authStatus = $main->checkStatus();
$dbContent = "";
$field = [
  'pageTitle' => $main->getCmsParam('PROJECT_TITLE'),
  'headContent' => '<meta name="Public"><meta name="description" content="Public">',
  'cssLinks' => [],
  'jsLinks'  => [],
];
$publicCss = $main->getCmsParam('uriCss');
$publicJs = $main->getCmsParam('uriJs');

/** для совместимовсти */
define('PATH_CSS' , $publicCss);
define('PATH_JS' , $publicJs);

// Если загрузка
if ($authStatus && isset($_GET['orderId'])) {
  $orderId = $_GET['orderId'];

  if (is_numeric($orderId)) {
    $order = $main->db->loadOrderById($orderId);

    if ($order) {
      $dbContent .= "<input type='hidden' id='dataOrder' value='" . json_encode($order) . "'>";

      $customer = $main->db->loadCustomerByOrderId($order['ID']);
      if ($customer) {
        $dbContent .= "<input type='hidden' id='dataCustomer' value='" . json_encode($customer) . "'>";
      }
    }
  }

  unset($orderId, $order, $customer);
}

if ($authStatus && isset($_GET['orderVisitorId'])) {
  $orderId = $_GET['orderVisitorId'];

  if (is_finite($orderId)) {
    $order = $main->db->selectQuery('client_orders', ['*'], "cp_number = '$orderId'");

    if (count($order) === 1) {
      $dbContent .= "<input type='hidden' id='dataVisitorOrder' value='" . json_encode($order[0]) . "'>";
    }
  }

  unset($order, $orderId);
}

if (!$authStatus) $field['sideLeft'] = '';

require ABS_SITE_PATH . 'public/public.php';
if ($main->isDealer()) {
  $dealPublic = ABS_SITE_PATH . $main->getCmsParam('dealerPath') . 'public/public.php';

  if (file_exists($dealPublic)) {
    $publicCss = $main->getCmsParam('uriCss');
    $publicJs = $main->getCmsParam('uriJs');
    require $dealPublic;
  }
}

require ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php';
if ($main->isDealer()) {
  $dealPublic = ABS_SITE_PATH . $main->getCmsParam('dealerPath') . 'public/views/' . PUBLIC_PAGE . '.php';
  if (file_exists($dealPublic)) {
    require $dealPublic;
  }

  unset($dealPublic);
}

$html = template(OUTSIDE ? '_outside' : 'base', $field);
