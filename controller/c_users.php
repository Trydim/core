<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'Пользователи')
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getSettings('json', true))
     ->addAssets('module/users.js');

$param = [];
if ($main->isDealer()) {
  $param['permission']   = $main->db->loadPermission();
  $param['managerField'] = $main->getSettings(VC::MANAGER_FIELDS) ?? [];
}

$main->fireHook(VC::HOOKS_USERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template());
