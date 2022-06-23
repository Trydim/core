<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var string $pathTarget
 */

$field = [
  'pageTitle'     => 'Дилеры',
  'sideRight'     => '',
  'pageFooter'    => '',
  'footerContent' => '',
  //'cssLinks'  => [CORE_CSS . 'module/dea.css?ver=8cdf94ab40'],
  'jsLinks'   => [CORE_JS . 'module/dealers.js?ver=73262afc8e'],
];

ob_start();
require $pathTarget;
$field['content'] = ob_get_clean();
$html = template('base', $field);
