<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 */

$field = [
  'pageTitle'     => 'Дилеры',
  'sideRight'     => '',
  'footerContent' => $main->initDictionary(),
  'cssLinks'  => [CORE_CSS . 'module/dealers.css?ver=8cdf94ab40'],
  'jsLinks'   => [CORE_JS . 'module/dealers.js?ver=73262afc8e'],
];

ob_start();
include $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$html = template('base', $field);
