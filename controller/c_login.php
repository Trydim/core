<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 */

$field['pageTitle'] = $main->getCmsParam('PROJECT_TITLE');

$field['pageFooter'] = '';
$field['sideLeft']   = '';
$field['content']    = '';
$field['sideRight']  = '';

$wrongPass = $main->checkStatus('error');
$login     = $_REQUEST['login'] ?? '';
$pass      = $_REQUEST['password'] ?? '';

require $main->url->getRoutePath();
$html = template('base', $field);
