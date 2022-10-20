<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Test Admin function',
  'cssLinks'   => ['https://unpkg.com/mocha/mocha.css'],
  'jsLinks'   => [
    'https://unpkg.com/chai/chai.js',
    'https://unpkg.com/mocha/mocha.js',
    $main->uri->getHost() . 'core/src/js/test/test.js',
  ],
];

$field['sideLeft']   = '<style>#mocha-stats { top: 50px; }</style>';
$field['sideRight']  = '';
$field['pageFooter'] = '';

$field['sideRight']  = '';

ob_start();
include $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$html = template('base', $field);
