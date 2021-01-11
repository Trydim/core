<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $db
 * @var string $pathTarget
 */

$field = [ 'pageTitle' => 'Клиенты' ];

// получить конфиг текущего пользователя
//$setting = $db->getUserSetting(/*login user*/);

if(!isset($setting)) {
  $columns = $db->loadCustomers(0, 1);

	if(count($columns)) {
    $columns = array_keys($columns[0]) ?: [];
    $columns = array_map(function ($item) {
      $dbName = $item;

      $item = [
        'dbName' => $dbName,
        'name' => gTxtDB('customers', $dbName),
      ];

      return $item;
    }, $columns);
	}
}

$param['columns'] = $columns;
require $pathTarget;
$html = template('base', $field);
