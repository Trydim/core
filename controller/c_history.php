<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$field = [
  VC::BASE_CSS_LINKS => [CORE_CSS . 'module/history.css'],
  VC::BASE_JS_LINKS  => [CORE_JS . 'module/history.js'],
  VC::BASE_FOOTER_CONTENT => $main->initDictionary(),
];

require $main->url->getRoutePath();
$main->response->setContent(template('base', $field));
