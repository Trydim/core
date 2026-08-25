<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main
 */

$main->addAssets('module/customers.js');

// Used in views/customers.php
$param = [];
$main->addControllerField(VC::BASE_PAGE_TITLE, 'Клиенты')
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getSettings('json', true));

// получить конфиг текущего пользователя
$setting = $main->getLogin('customization');
$setting = $setting ?: [];

$columns = $setting['customersShowColumns'] ?? ['id', 'name', 'contacts', 'tin', 'orders'];
$param['columns'] = array_map(function ($item) {
  return [
    'dbName' => $item,
    'name' => gTxtDB('customers', $item),
  ];
}, $columns);

$main->fireHook(VC::HOOKS_CUSTOMERS_TEMPLATE, $main);
require $main->url->getRoutePath();
$main->response->setContent(template());
