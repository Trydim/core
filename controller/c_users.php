<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Пользователи',
  'jsLinks'   => [CORE_JS . 'module/users.js?ver=0151a08ae3'],
  'footerContent' => $main->getSettings('json', true),
];
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

$main->setControllerField($field)->fireHook(VC::HOOKS_USERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
