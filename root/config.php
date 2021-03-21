<?php

$publicConfig = [
  // Любое значение включает режим отладки
  'DEBUG' => 'true',

  'PATH_CSS' => SITE_PATH . 'public/css/',
  'PATH_IMG' => SITE_PATH . 'public/images/',
  'PATH_JS'  => SITE_PATH . 'public/js/',

  /** Использовать БД для авторизации */
  'USE_DATABASE' => true,

  /** Возможность прямого редактирования БД из админки */
  'CHANGE_DATABASE' => false,

  /** Папка с csv файлами */
  'PATH_CSV' => ABS_SITE_PATH . 'csv/',
  'CSV_STRING_LENGTH' => '1000',
  'CSV_DELIMITER' => ';',

  /** Отображать таблицы в меню */
  'DB_TABLE_IN_SIDEMENU' => true,

  /** Сохранять пользовательские расчеты */
  'USERS_ORDERS' => true,

  /** Домашняя страница - страница на которую переходит ПОСЛЕ регистрации
   * По умолчанию PUBLIC_PAGE
   * Если нету, тогда на первую открытую ACCESS_MENU
   */
  //'HOME_PAGE' => 'catalog',

  //'ONLY_LOGIN' => true,
  /** Страница для доступа без регистрации: файл/файлы с таким именем должен быть в public/views/
   * Если пользователь не зарегистрирован, переход на эту страницу.
   * (позже) или через запятую если несколько страниц.
   * если false, то константа ONLY_LOGIN всегда true
   */
  'PUBLIC_PAGE' => 'calculator',

  /** Какую библиотеку использовать (добавить в настройки) mpdf, html2pdf */
  // внутри битрикс не доступно mpdf
  'PDF_LIBRARY' => 'mpdf',

  /** Пункты меню какие показывать и последовательность
  'orders', 'calendar', 'customers', 'users', 'statistic', 'admindb', 'catalog', 'setting'
  заказы     календарь   клиенты   менеджеры статистика администрирование каталог настройки
  options - настройки
   */
  'ACCESS_MENU' => ['orders', 'calendar', 'customers', 'users', 'statistic', 'admindb', 'setting'],

  /**
   * Количество кнопок для печати.
   * кнопки будут иметь тип и значение для перевода:
   * printType1 - printType2 - ... - printTypeN
   */
  'PRINT_BTN' => 3,
];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config
$dbConfig = [
  'dbHost'     => 'localhost',
  'dbName'     => 'dbName',
  /*'dbUsername' => 'dbUser',
  'dbPass'     => 'WHZM4JpunONGycmf'*/
  'dbUsername' => 'root',
  'dbPass'     => ''
];
