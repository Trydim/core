<?php

/**
 * Все пути относительно index.php.
 */

$publicConfig = [
  'PROJECT_TITLE' => 'PROJECT_TITLE',
  /** Любое значение включает режим отладки */
  //'DEBUG' => true,

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
  'admindb', 'calendar', 'catalog', 'customers', 'dealers', 'orders', 'fileManager', 'statistic', 'users'
  админ-ние   календарь   каталог    клиенты      дилеры     заказы    ФМ             статистика   мен-ры
  hr - черта в меню
  */
  'ACCESS_MENU' => ['admindb', 'calendar', 'catalog', 'customers', 'dealers', 'orders', 'users', 'customPage'],

  /**
   * Фильтр заказов
   * @type {string|bool} - dealers - фильтрация по дилерам
   *  users - фильтрация по пользователям
   *  customers - по клиентам
   */
  'FILTER_ORDERS' => false,

  /** Папка по умолчанию для файлового менеджера */
  // 'SHARE_PATH' => 'public/images/',

  /** Контент редактор */
  // 'USE_CONTENT_EDITOR' => true,

  /** Поддомены для дилеров */
  //'USE_DEAL_SUBDOMAIN' => true,

  /** если базовый язык не совпадает с целевым, то будут загружать словари в из подпаки /lang/{TARGET_LANG}/dictionary.php */
  /*'LOCALES' => [
    'BASE_LANG' => 'ru',
    'TARGET_LANG' => 'ru', //en, pl, ..
  ]*/
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
