<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var array $dbConfig
 * @var string $pathTarget
 */

require_once CORE . 'php/libs/db.php';

$field = [ 'pageTitle' => 'Пользователи' ];

if (!isset($db)) $db = new \RedBeanPHP\db($dbConfig);

// получить конфиг текущего пользователя
//$setting = $db->getUserSetting(/*login user*/);

if(!isset($setting)) {
  $columns = $db->loadUsers(0, 1);

	if(count($columns)) {
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

$param['columns'] = $columns;
require $pathTarget;
$html = template('base', $field);
