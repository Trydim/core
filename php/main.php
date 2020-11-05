<?php

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

if (defined('MAIN_ACCESS')) die('access denied!');
define('MAIN_ACCESS', true);
define('ABS_SITE_PATH', __DIR__ . '/../../');
define('MAIN_PATH', __DIR__ . '/');

require_once '../model/func.php';
$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : 'noMode';
$result = [];
extract($_REQUEST);

$added   = isset($added) ? $added = json_decode($added, true) : false;
$changed = isset($changed) ? $changed = json_decode($changed, true) : false;
$deleted = isset($deleted) ? $deleted = json_decode($deleted) : false;

try {
	switch ($mode) {
		case 'auth':
			require_once 'auth.php';
			break;
		case 'load':
		case 'DB':
			require_once 'db.php';
			break;
		case 'docs':
			require_once 'docs.php';
			break;
	}

	// $result['error'] должен содержать сообщение
	$result['status'] = isset($result['error']) ? checkError($result['error']) : true;

} catch (\mysql_xdevapi\Exception $e) {
	echo $e->getMessage();
}

echo json_encode($result);
