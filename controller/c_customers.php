<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once 'core/php/libs/db.php';

$field = [ 'pageTitle' => 'Клиенты' ];

if (!isset($db)) $db = new \RedBeanPHP\db('./config.php');

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

$field['content'] = template('parts/customersContent', $param);
$field['pageFooter'] = template('parts/paginationBlock', $param);
require $pathTarget;
$html = template('base', $field);
