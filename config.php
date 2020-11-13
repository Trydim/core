<?php //if ( !defined('MAIN_ACCESS')) die('access denied!');

// Путь от корня сайта
if ( !defined('SITE_PATH')) define('SITE_PATH', '/');

if ( !defined('CONTROLLER')) define('CONTROLLER', 'core/controller/c_');
if ( !defined('VIEW')) define('VIEW', 'core/views/');

if ( !defined('CORE_CSS')) define('CORE_CSS', SITE_PATH . 'core/assets/css/');
if ( !defined('CORE_SCRIPT')) define('CORE_SCRIPT', SITE_PATH . 'core/assets/js/');

if ( !defined('PATH_CSS')) define('PATH_CSS', SITE_PATH . 'public/css/');
if ( !defined('PATH_IMG')) define('PATH_IMG', SITE_PATH . 'public/images/');
if ( !defined('PATH_SCRIPT')) define('PATH_SCRIPT', SITE_PATH . 'public/js/');

//----------------------------------------------------------------------------------------------------------------------
// project config
/* Использовать БД для авторизации */
if ( !defined('USE_DATABASE')) define('USE_DATABASE', true);

/* Возможность прямого редактирования БД из админки */
if ( !defined('CHANGE_DATABASE')) define('CHANGE_DATABASE', false);

/* Папка с csv файлами */
if ( !defined('PATH_CSV')) define('PATH_CSV', ABS_SITE_PATH . 'csv/');
if ( !defined('CSV_STRING_LENGTH')) define('CSV_STRING_LENGTH', '1000');
if ( !defined('CSV_DELIMITER')) define('CSV_DELIMITER', ';');

/* Отображать таблицы в меню */
if ( !defined('DB_TABLE_IN_SIDEMENU')) define('DB_TABLE_IN_SIDEMENU', true);

/* Страница для доступа без регистрации */
if ( !defined('PUBLIC_PAGE')) define('PUBLIC_PAGE', 'calculator');

/* Какую библиотку использовать (добавить в настройки) mpdf, html2pdf */
if ( !defined('PDF_LIBRARY')) define('PDF_LIBRARY', 'mpdf');

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config
if(USE_DATABASE) {
	$dbConfig = [
		'dbHost'     => 'localhost',
		'dbName'     => 'vmeste-print',
    /*'dbUsername' => 'dbUser',
    'dbPass'     => 'WHZM4JpunONGycmf'*/
		'dbUsername' => 'root',
		'dbPass'     => ''
	];
}
