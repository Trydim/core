<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field['jsLinks'][] = CORE_JS . 'module/history.js';

require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));