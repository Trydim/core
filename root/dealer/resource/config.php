<?php

$publicConfig = [
  'ONLY_LOGIN' => true,

  'PUBLIC_PAGE' => 'calculator',

  'ACCESS_MENU' => ['admindb', 'calendar', 'catalog', 'customers', 'dealers', 'orders', 'users', 'customPage'],

  'PATH_IMG' => 'public/images/',

  /** Контент редактор */
  'USE_CONTENT_EDITOR' => true,
];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config

$dbConfig = [
  'dbPrefix'   => '$prefix',
  'dbHost'     => '$dbHost',
  'dbName'     => '$dbName',
  'dbUsername' => '$dbUsername',
  'dbPass'     => '$dbPass'
];
