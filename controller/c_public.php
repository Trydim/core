<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$authStatus = $main->checkStatus();
$isDealer = $main->isDealer();
$dbContent = "";
$field = [
  'pageTitle' => $main->getCmsParam('PROJECT_TITLE'),
  'headContent' => '<meta name="Public"><meta name="description" content="Public">',
  'cssLinks' => [],
  'jsLinks'  => [],
  'sideLeft' => $authStatus ? null : '',
];
$publicCss = $main->getCmsParam(VC::URI_CSS);
$publicJs = $main->getCmsParam(VC::URI_JS);

/** Для совместимости */
define('PATH_CSS' , $publicCss);
define('PATH_JS' , $publicJs);

// Если загрузка
if ($authStatus && isset($_GET['orderId'])) {
  $orderId = $_GET['orderId'];

  if (is_numeric($orderId)) {
    $order = $main->db->loadOrdersById($orderId, true);

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
    $order = $main->db->selectQuery('client_orders', ['*'], "ID = '$orderId'");

    if (count($order) === 1) {
      $dbContent .= "<input type='hidden' id='dataVisitorOrder' value='" . json_encode($order[0]) . "'>";
    }
  }

  unset($order, $orderId);
}

$main->publicMain();
require ABS_SITE_PATH . 'public/public.php';
if ($isDealer) {
  $main->publicDealer();
  $dealPublic = $main->url->getPath(true) . 'public/public.php';

  if (file_exists($dealPublic)) {
    $publicCss = $main->getCmsParam(VC::DEAL_URI_CSS);
    $publicJs = $main->getCmsParam(VC::DEAL_URI_JS);
    require $dealPublic;
  }
}

$main->publicMain();
require ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php';
if ($isDealer) {
  $main->publicDealer();
  $dealPublic = $main->url->getPath(true) . 'public/views/' . PUBLIC_PAGE . '.php';
  if (file_exists($dealPublic)) {
    require $dealPublic;
  }

  unset($dealPublic, $dealCsvPath);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_PUBLIC_TEMPLATE, $main);
$main->response->setContent(template(OUTSIDE ? '_outside' : 'base', $field));
