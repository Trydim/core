<?php if (!defined('MAIN_ACCESS')) die('access denied!');
/**
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Статистика',
  'jsLinks'   => [CORE_JS . 'module/statistic.js?ver=768c45005c'],
];

require $pathTarget;
$html = template('base', $field);
