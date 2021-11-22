<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

$field['pageTitle'] = 'login';

$field['pageFooter']    = '';
$field['sideLeft']      = '';
$field['content']       = '';
$field['sideRight']     = '';

$wrongPass = isset($main) && $main->checkStatus('error');
$login = $_REQUEST['login'] ?? '';
$pass = $_REQUEST['password'] ?? '';

require $pathTarget;
$html = template('base', $field);
