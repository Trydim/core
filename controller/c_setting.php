<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Настройки',
  'footerContent' => $main->initDictionary(),
  'cssLinks'   => [CORE_CSS . 'module/setting.css?ver=096616aa6f'],
  'jsLinks'    => [CORE_JS . 'module/setting.js?ver=2239ad0927'],
];

$field['footerContent'] .= $main->getFrontContent('dataUser', $main->getLogin('all'))
                           . $main->getSettings('json', true);

if (USE_DATABASE && $main->getLogin('isAdmin')) {
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

  $field['footerContent'] .= $main->getFrontContent('dataPermissions', $permissions);

  // if available orders
  if ($main->availablePage('orders')) {
    $field['footerContent'] .= $main->getFrontContent('dataOrdersStatus', $main->db->loadOrderStatus());
  }

  $field['footerContent'] .= $main->getCourse();

  unset($permissions);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_SETTING_TEMPLATE, $main);
ob_start();
require $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
