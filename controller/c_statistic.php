<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  'pageTitle' => 'Статистика',
  'jsLinks'   => [
    CORE_JS . 'libs/canvasjs.min.js?ver=d9712ad6ef',
    CORE_JS . 'module/statistic.js?ver=d9712ad6ef',
  ],
];

require $main->url->getRoutePath();
$html = template('base', $field);
