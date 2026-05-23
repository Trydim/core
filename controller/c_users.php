<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'Пользователи');
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getSettings('json', true));
$main->addAssets('module/users.js');

$param = [];

if (!isset($setting)) {
  $param['columns'] = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name' => gTxtDB('users', $item),
    ];
  },
    ['id', 'permissionName', 'login', 'name', 'contacts', 'registerDate', 'activity']
  );
} else $param['columns'] = $setting['userColumns'];

$param['permission'] = array_map(
  function ($item) { return "<option value=" . $item['id'] . ">" . gTxt($item['name']) . "</option>"; },
  $main->db->loadPermission()
);
$param['permission'] = implode('', $param['permission']);

$param['managerField'] = $main->getSettings(VC::MANAGER_FIELDS) ?? [];

$main->fireHook(VC::HOOKS_USERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template());
