<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Статистика',
  'jsLinks'   => [CORE_JS . 'module/statistic.js?ver=d0d4a4997f'],
];

require $pathTarget;
$html = template('base', $field);
