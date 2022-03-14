<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Test Admin function',
  'cssLinks'   => ['https://unpkg.com/mocha/mocha.css'],
  'jsLinks'   => [
    'https://unpkg.com/chai/chai.js',
    'https://unpkg.com/mocha/mocha.js',
    URI . 'core/src/js/test/test.js',
  ],
];

$field['sideLeft']   = '<style>#mocha-stats { top: 50px; }</style>';
$field['sideRight']  = '';
$field['pageFooter'] = '';

$field['sideRight']  = '';

ob_start();
require $pathTarget;
$field['content'] = ob_get_clean();
$html = template('base', $field);
