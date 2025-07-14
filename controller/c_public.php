<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$authStatus = $main->checkStatus();
$isDealer = $main->isDealer();
$dbContent = "";
$field = [
  'pageTitle' => $main->getCmsParam(VC::PROJECT_TITLE),
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
      // сохранять тип языка принудительно при сохраннении заказа если доступны разные языки (или нет. нет)
      // Старые заказы всегда сохраняются на русском
      $main->setLocale($order['importantValue']['locale'] ?? '');

      $dbContent .= $main->getFrontContent('dataOrder', $order);

      $customer = $main->db->loadCustomerByOrderId($order['ID']);
      if ($customer) {
        $dbContent .= $main->getFrontContent('dataCustomer', $customer);
      }
    }
  }

  unset($orderId, $order, $customer);
}

else if ($authStatus && isset($_GET['orderVisitorId'])) {
  $orderId = $_GET['orderVisitorId'];

  if (is_finite($orderId)) {
    $order = $main->db->loadVisitorOrderById($orderId);

    if (count($order)) $dbContent .= $main->getFrontContent('dataVisitorOrder', $order);
  }

  unset($order, $orderId);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_PUBLIC_TEMPLATE, $main);

$main->publicMain();
require ABS_SITE_PATH . 'public/public.php';
if ($isDealer) {
  $main->publicDealer();
  $path = $main->url->getPath(true) . 'public/public.php';

  if (file_exists($path)) {
    $publicCss = $main->getCmsParam(VC::DEAL_URI_CSS);
    $publicJs = $main->getCmsParam(VC::DEAL_URI_JS);
    require $path;
  }
}

$main->publicMain()
     ->setControllerViewField(ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php');
if ($isDealer) {
  $main->publicDealer()
       ->setControllerViewField($main->url->getPath(true) . 'public/views/' . PUBLIC_PAGE . '.php');
}

$main->response->setContent(template(OUTSIDE ? '_outside' : 'base', $main->getControllerField()));

unset($path);
