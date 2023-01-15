<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main
 */

$param = [];
$field = [
  'pageTitle' => 'Клиенты',
  'jsLinks'   => [CORE_JS . 'module/customers.js?ver=6347eef0e2'],
  'footerContent' => $main->getSettings('json', true),
];

// получить конфиг текущего пользователя
//$setting = $main->db->getUserSetting(/*login user*/);

if (!isset($setting)) {
  $columns = ['ID', 'name', 'contacts',  'ITN', 'orders'];

  $param['columns'] = array_map(function ($item) {
    return [
      'dbName' => $item,
      'name' => gTxtDB('customers', $item),
    ];
  }, $columns);
}

$main->setControllerField($field)->fireHook(VC::HOOKS_CUSTOMERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
