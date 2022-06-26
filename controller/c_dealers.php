<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 * @var string $pathTarget
 */

$field = [
  'pageTitle'     => 'Дилеры',
  'sideRight'     => '',
  'pageFooter'    => '',
  'footerContent' => '',
  'cssLinks'  => [CORE_CSS . 'module/dealers.css?ver=8cdf94ab40'],
  'jsLinks'   => [CORE_JS . 'module/dealers.js?ver=73262afc8e'],
];

$dealers = $main->db->loadDealers();
$field['footerContent'] .= "<input type='hidden' id='dealersData' value='". json_encode($dealers) ."'>";

ob_start();
require $pathTarget;
$field['content'] = ob_get_clean();
$html = template('base', $field);
