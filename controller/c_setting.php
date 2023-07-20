<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Настройки',
  'footerContent' => '',
  'cssLinks'   => [CORE_CSS . 'module/setting.css?ver=096616aa6f'],
  'jsLinks'    => [CORE_JS . 'module/setting.js?ver=2239ad0927'],
];

$user = $main->db->getUserById($main->getLogin('id'));
$user = [
  'name'         => $user['name'],
  'login'        => $user['login'],
  'isAdmin'      => $main->getLogin('admin'),
  'contacts'     => $user['contacts'],
  'customization' => $user['customization'],
];
$field['footerContent'] .= "<input type='hidden' id='dataUser' value='" . json_encode($user) . "'>"
  . $main->getSettings('json', true);

if (USE_DATABASE && $user['isAdmin']) {
  $permissions['permissions'] = $main->db->loadTable('permission');

  $permissions['permissions'] = array_map(function ($row) {
    $row['id'] = intval($row['ID']);
    $row['name'] = gTxt($row['name']);
    $row['properties'] = json_decode($row['properties'], true);
    unset($row['ID']);
    return $row;
  }, $permissions['permissions']);

  $permissions['menu'] = array_map(function ($menu) {
    return ['id' => $menu, 'name' => gTxt($menu)];
  }, $main->getSideMenu());

  $field['footerContent'] .= "<input type='hidden' id='dataPermissions' value='" . json_encode($permissions) . "'>";

  // if available orders
  if ($main->availablePage('orders')) {
    $status = json_encode($main->db->loadOrderStatus());
    $field['footerContent'] .= "<input type='hidden' id='dataOrdersStatus' value='$status'>";
  }

  $field['footerContent'] .= $main->getCourse();

  unset($permissions, $status);
}

$field['footerContent'] .= $main->initDictionary();
$main->setControllerField($field)->fireHook(VC::HOOKS_SETTING_TEMPLATE, $main);
ob_start();
require $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
