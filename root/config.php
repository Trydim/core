<?php

/**
 * Все пути относительно index.php.
 */

$publicConfig = [
  VC::PROJECT_TITLE => 'PROJECT_TITLE',
  /** Любое истинное значение включает режим отладки */
  //'DEBUG' => true,

  /** Почта */
  //VC::MAIL_TARGET_DEBUG => 'trydim@mail.ru',
  //'MAIL_SMTP' => true,
  //'MAIL_PORT' => 465,
  //'MAIL_HOST' => 'smtp.yandex.ru';
  //'MAIL_FROM' => 'mail.common@list.ru';
  //'MAIL_PASSWORD' => 'eBsv3cj7LtofBLULy6ni';

  /** Раскомментировать, если требуется изменить путь */
  //'URI_IMG' => 'public/images/',
  //'URI_CSS' => 'public/css/',
  //'URI_JS'  => 'public/js/',

  /** Использовать БД для авторизации */
  //VC::USE_DATABASE => true,

  /** Возможность прямого редактирования БД из админки */
  //VC::CHANGE_DATABASE => false,

  /** Режим разработчика для csv редактора (true/false*) */
  //'CSV_DEVELOP' => false,
  /** Описание csv файлов */
  //'PATH_LEGEND' => 'public/views/legend.php',
  /** Папка csv файлов */
  //'PATH_CSV'    => 'shared/csv/',
  /** Сохранять историю изменений */
  //'CSV_CHANGE_HISTORY' => true,

  /** Количество символов в csv */
  //'CSV_STRING_LENGTH' => '1000',
  /** Разделитель в csv */
  //'CSV_DELIMITER'     => ';',

  /** Сохранять пользовательские расчеты */
  //'USERS_ORDERS' => false,
  /** Доступность "Канбан" для страницы заказов, если страница не доступна не имеет значения */
  //VC::ORDERS_KANBAN => true,

  /** Вход только с регистрацией. Определяется в зависимости от доступной страницы. */
  VC::ONLY_LOGIN => true,
  /** Страница для доступа без регистрации: файл/файлы с таким именем должен быть в public/views/
   * Если пользователь не зарегистрирован, переход на эту страницу.
   * (позже) или через запятую если несколько страниц.
   * если false, то константа ONLY_LOGIN всегда true
   */
  VC::PUBLIC_PAGE => 'calculator',

  /** Пункты меню какие показывать и последовательность (по умолчанию все страницы)
  'admindb', 'customers', 'dealers', 'orders', 'fileManager', 'users'
  админ-ние   клиенты      дилеры     заказы    ФМ            мен-ры
  hr - черта в меню
  */
  VC::ACCESS_MENU => [
    'admindb', 'customers', 'dealers', 'orders', 'users', 'customPage',
    ['customPage', 'pi-customIcon'],
    ['link' => 'customPage', 'icon' => 'pi-customIcon'],
  ],

  /**
   * Фильтр заказов
   * @type {string|bool} - dealers - фильтрация по дилерам
   *  users - фильтрация по пользователям
   *  customers - по клиентам
   */
  'FILTER_ORDERS' => false,

  /** Папка по умолчанию для файлового менеджера */
  //'SHARE_PATH' => 'public/images/',

  /** Контент редактор */
  //VC::USE_CONTENT_EDITOR => true,

  /** Поддомены для дилеров */
  //'USE_DEAL_SUBDOMAIN' => true,

  /** Доступны ли различные языки, по умолчанию нет */
  //VC::LOCALES => true,
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
