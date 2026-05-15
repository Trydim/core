<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Пользователи',
  'footerContent' => $main->getSettings('json', true),
];

$main->addAssets('module/users.js');

$param = [];

if (!isset($setting)) {
  $param['columns'] = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name' => gTxtDB('users', $item),
    ];
  },
    ['ID', 'permissionName', 'login', 'name', 'contacts', 'registerDate', 'activity']
  );
} else $param['columns'] = $setting['userColumns'];

$param['permission'] = array_map(
  function ($item) { return "<option value=" . $item['ID'] . ">" . gTxt($item['name']) . "</option>"; },
  $main->db->selectQuery('permission', ['ID', 'name'])
);
$param['permission'] = implode('', $param['permission']);

$param['managerField'] = $main->getSettings(VC::MANAGER_FIELDS) ?? [];

$main->fireHook(VC::HOOKS_USERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
