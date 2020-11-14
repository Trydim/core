<?php

$publicConfig = [
  'PATH_CSS' => SITE_PATH . 'public/css/',
  'PATH_IMG' => SITE_PATH . 'public/images/',
  'PATH_JS'  => SITE_PATH . 'public/js/',

  /* Использовать БД для авторизации */
  'USE_DATABASE' => true,

  /* Возможность прямого редактирования БД из админки */
  'CHANGE_DATABASE' => false,

  /* Папка с csv файлами */
  'PATH_CSV' => ABS_SITE_PATH . 'csv/',
  'CSV_STRING_LENGTH' => '1000',
  'CSV_DELIMITER' => ';',

  /* Отображать таблицы в меню */
  'DB_TABLE_IN_SIDEMENU' => true,

  /* Страница для доступа без регистрации: файл с таким именем должен быть в public/views/ */
  'PUBLIC_PAGE' => 'calculator',

  /* Какую библиотеку использовать (добавить в настройки) mpdf, html2pdf */
  // внутри битрикс не доступно mpdf
  'PDF_LIBRARY' => 'mpdf',

];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config
$dbConfig = [
  'dbHost'     => 'localhost',
  'dbName'     => 'tabletop',
  /*'dbUsername' => 'dbUser',
  'dbPass'     => 'WHZM4JpunONGycmf'*/
  'dbUsername' => 'root',
  'dbPass'     => ''
];
