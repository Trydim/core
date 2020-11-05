<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
$field = [
  'pageTitle' => 'Статистика',
];

require $pathTarget;
$html = template('base', $field);