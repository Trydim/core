<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'Настройки');
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary());
$main->addAssets(['module/setting.css', 'module/setting.js']);

$main->addControllerField(
  VC::BASE_FOOTER_CONTENT,
  $main->getFrontContent('dataUser', $main->getLogin('all'))
  . $main->getSettings('json', true)
);

if (USE_DATABASE && $main->getLogin('isAdmin')) {
  $permissions['permissions'] = $main->db->loadPermission();

  $permissions['permissions'] = array_map(function ($row) {
    $row['id'] = intval($row['id']);
    $row['name'] = gTxt($row['name']);
    return $row;
  }, $permissions['permissions']);

  $permissions['menu'] = array_map(function ($menu) {
    return ['id' => $menu, 'name' => gTxt($menu)];
  }, $main->getSideMenu());

  $main->addControllerField( VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataPermissions', $permissions));

  // if available orders
  if ($main->availablePage('orders')) {
    $main->addControllerField( VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataOrdersStatus', $main->db->loadOrderStatus()));
  }

  $main->addControllerField( VC::BASE_FOOTER_CONTENT, $main->getCourse());
  unset($permissions);
}

$main->fireHook(VC::HOOKS_SETTING_TEMPLATE, $main);
ob_start();
require $main->url->getRoutePath();
$main->addControllerField(VC::BASE_CONTENT, ob_get_clean());
$main->response->setContent(template());
