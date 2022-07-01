<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

ob_start();
include $main->url->getRoutePath();
$html = ob_get_clean();
