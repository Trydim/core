<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Настройки',
  'footerContent' => '',
  'cssLinks'   => [CORE_CSS . 'module/setting.css'],
  'jsLinks'    => [CORE_JS . 'module/setting.js'],
];

$user = [
  'name'         => $main->getLogin('name'),
  'login'        => $main->getLogin(),
  'permissionId' => $main->getSettings('permissionId'),
  'isAdmin'      => $main->getSettings('admin'),
];
$field['footerContent'] .= "<input type='hidden' id='dataUser' value='". json_encode($user) . "'>";

if ($user['isAdmin']) {
  $field['footerContent'] .= "<input type='hidden' id='dataSettings' value='" . $main->getSettings('json') . "'>";

  if (USE_DATABASE) {
    $permissions['permissions'] = $main->db->loadTable('permission');

    $permissions['permissions'] = array_map(function ($row) {
      $row['id'] = intval($row['ID']);
      $row['name'] = gTxt($row['name']);
      $row['accessVal'] = json_decode($row['access_val'], true);
      unset($row['ID'], $row['access_val']);
      return $row;
    }, $permissions['permissions']);

    $permissions['menu'] =  array_map(function ($menu) {
      return ['id' => $menu, 'name' => gTxt($menu)];
    }, $main->getSideMenu());

    $field['footerContent'] .= "<input type='hidden' id='dataPermissions' value='" . json_encode($permissions) . "'>";

    // if available orders
    if ($main->availablePage('orders') && false) {
      $status = json_encode($main->db->loadTable('order_status'));
      $field['footerContent'] .= "<input type='hidden' id='dataOrdersStatus' value='$status'>";
    }

    unset($permissions, $status);
  }
}

$main->fireHook('settingTemplate', $field);
require $pathTarget;
$html = template('base', $field);
