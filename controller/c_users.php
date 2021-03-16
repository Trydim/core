<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var array $dbConfig
 * @var string $pathTarget
 */

$field = [ 'pageTitle' => 'Пользователи' ];

if (!isset($db)) die('db not defined');

// получить конфиг текущего пользователя
//$setting = $db->getUserSetting(/*login user*/);

if(!isset($setting)) {
  $columns = $db->loadUsers(0, 1);

	if(count($columns) === 1) {
    unset($columns[0]['permission_id']);
    $columns = array_keys($columns[0]) ?: [];
    $columns = array_map(function ($item) {
      $dbName = $item;

      $item = [
        'dbName' => $dbName,
        'name' => gTxtDB('users', $dbName),
      ];

      return $item;
    }, $columns);
	}
}

$permission = $db->selectQuery('permission', ['ID', 'name']);

$param['permission'] = implode('', array_map(function ($item) {
  return "<option value=" . $item['ID'] . ">" . gTxt($item['name']) . "</option>";
}, $permission));

$param['columns'] = isset($columns) ? $columns : '';
require $pathTarget;
$html = template('base', $field);
