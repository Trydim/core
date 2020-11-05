<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once 'core/php/libs/db.php';

$field = [ 'pageTitle' => 'Заказы' ];

if (!isset($db)) $db = new \RedBeanPHP\db('./config.php');

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

$field['content'] = template('parts/ordersContent', $param);
$field['footerContent'] = '<a id="publicPageLink" href="' . PUBLIC_PAGE . '" hidden></a>';
require $pathTarget;
$html = template('base', $field);
