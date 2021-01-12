<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var object $main
 * @var object $db
 * @var array $dbConfig
 * @var string $pathTarget
 */

$field = [ 'pageTitle' => 'Заказы' ];

// получить конфиг текущего пользователя
$setting = $db->getUserSetting(/*login user*/);

if(!isset($setting->ordersColumnSort)) {
	$setting->ordersColumnSort = $db->loadOrder(0, 1);

	if(count($setting->ordersColumnSort)) {
	  $columns = array_keys($setting->ordersColumnSort[0]) ?: [];
		$setting->ordersColumnSort = array_map(function ($item) {
		  $dbName = $item;

		  $item = [
		    'dbName' => $dbName,
        'name' => gTxtDB('orders', $dbName),
      ];

		  return $item;
    }, $columns);
	}
}

$param['columns'] = $setting->ordersColumnSort;

$main->exist('orderTemplate') && $field = doHook('orderTemplate', $field);
require $pathTarget;
$html = template('base', $field);
