<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Пользователи',
  'jsLinks'   => [CORE_JS . 'module/users.js?ver=0151a08ae3'],
  'footerContent' => $main->getSettings('json', true),
];

if (!isset($setting)) {
  $columns = $main->db->loadUsers(0, 1);

  if (count($columns) === 1) {
    unset($columns[0]['permission_id']);
    $columns = array_keys($columns[0]) ?: [];
    $columns = array_map(function ($item) {
      $dbName = $item;

      return [
        'dbName' => $dbName,
        'name' => gTxtDB('users', $dbName),
      ];
    }, $columns);
  }
}

$permission = $main->db->selectQuery('permission', ['ID', 'name']);

$param['permission'] = $permission = implode('', array_map(function ($item) {
  return "<option value=" . $item['ID'] . ">" . gTxt($item['name']) . "</option>";
}, $permission));

$managerField = $main->getSettings(VC::MANAGER_FIELDS);
if (!$managerField) $managerField = [];

$main->setControllerField($field)->fireHook(VC::HOOKS_USERS_TEMPLATE, $main);
$param['columns'] = $columns ?? '';
require $main->url->getRoutePath();
$html = template('base', $field);
