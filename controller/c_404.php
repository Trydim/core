<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $pathTarget
 */

ob_start();
include($pathTarget);
$html = ob_get_clean();
