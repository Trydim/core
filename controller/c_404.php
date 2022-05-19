<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

ob_start();
if (isset($pathTarget)) include($pathTarget);
$html = ob_get_clean();
