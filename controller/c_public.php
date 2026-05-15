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

// Если загрузка
if (
  $authStatus && is_numeric($orderId = $main->url->request->get('orderId'))
  &&
  $order = $main->db->loadOrdersById($orderId, true)
) {
  // Старые заказы всегда сохраняются на русском
  $defLocale = '';
  if ($main->isDealer()) {
    $dealerSetting = $main->getLogin('dealer')['settings'];
    $defLocale = $dealerSetting['locales'][0]['code']  ?? '';
  }

  $main->setLocale($order['importantValue']['locale'] ?? $defLocale);

  $dbContent .= $main->getFrontContent('dataOrder', $order);

  if ($customer = $main->db->loadCustomerByOrderId($order['ID'])) {
    $dbContent .= $main->getFrontContent('dataCustomer', $customer);
  }

  unset($orderId, $order, $customer);
}

else if (
  $authStatus && is_numeric($orderId = $main->url->request->get('orderVisitorId'))
  &&
  count($order = $main->db->loadVisitorOrderById($orderId))
) {
  $dbContent .= $main->getFrontContent('dataVisitorOrder', $order);

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
