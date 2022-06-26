<?php

/**
 * Все пути относительно index.php.
 */

$publicConfig = [
  'PROJECT_TITLE' => 'PROJECT_TITLE',
  /** Любое значение включает режим отладки */
  //'DEBUG' => true,
  /** Путь к родительскому конфигу (только для созависимых админок)  */
  //'PATH_MAIN_CONFIG' => '',
  /** Относительный путь к админке (если расположение не site.com/core) */
  //'PATH_CORE' => '',

  /** Почта */
  //'MAIL_TARGET_DEBUG' => 'trydim@mail.ru',
  //'MAIL_SMTP' => true,
  //'MAIL_PORT' => 465,
  //'MAIL_HOST' => 'smtp.yandex.ru';
  //'MAIL_FROM' => 'noreplycalcby@yandex.ru';
  //'MAIL_PASSWORD' => '638ch1';

  /** Расскоментировать, если требуется изменить путь */
  //'PATH_CSS' => 'public/css/',
  //'PATH_IMG' => 'public/images/',
  //'PATH_JS'  => 'public/js/',

  /** Использовать БД для авторизации */
  //'USE_DATABASE' => true,

  /** Возможность прямого редактирования БД из админки */
  //'CHANGE_DATABASE' => false,

  /** Режим разработчика для csv редактора (true/false*) */
  //'CSV_DEVELOP' => false,
  /** Описание csv файлов */
  //'PATH_LEGEND' => 'public/views/legend.php',
  /** Папка csv файлов */
  //'PATH_CSV'    => 'shared/csv/',

  /** Количество символов в csv */
  //'CSV_STRING_LENGTH' => '1000',
  /** Разделитель в csv */
  //'CSV_DELIMITER'     => ';',

  /** Сохранять пользовательские расчеты */
  //'USERS_ORDERS' => false,

  /** Вход только с регистрацией. Определяется в зависимости от доступной страницы. */
  'ONLY_LOGIN' => true,
  /** Страница для доступа без регистрации: файл/файлы с таким именем должен быть в public/views/
   * Если пользователь не зарегистрирован, переход на эту страницу.
   * (позже) или через запятую если несколько страниц.
   * если false, то константа ONLY_LOGIN всегда true
   */
  'PUBLIC_PAGE' => 'calculator',

  /** Какую библиотеку использовать (добавить в настройки) mpdf, html2pdf */
  // внутри битрикс не доступно mpdf
  //'PDF_LIBRARY' => 'mpdf',
  /** PDF альбомный/портретный */
  //'PDF_ORIENTATION' => 'L',

  /** Пункты меню какие показывать и последовательность (по умолчанию все страницы)
  'orders', 'calendar', 'customers', 'users', 'statistic', 'admindb', 'catalog', 'fileManager', 'dealers',
  заказы     календарь   клиенты     менеджеры статистика  админ-ние каталог     ФМ              дилеры
  options - настройки
   */
  'ACCESS_MENU' => ['calendar', 'orders', 'customers', 'admindb', 'dealers', 'users'],

  /** Папка по умолчанию для файлового менеджера */
  // 'SHARE_PATH' => 'public/images/',

  /** Контент редактор */
  // 'USE_CONTENT_EDITOR' => false,
];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config
$dbConfig = [
  'dbHost'     => 'localhost',
  'dbName'     => 'cms',
  /*'dbUsername' => 'dbUser',
  'dbPass'     => 'WHZM4JpunONGycm'*/
  'dbUsername' => 'root',
  'dbPass'     => ''
];
