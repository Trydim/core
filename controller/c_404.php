<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

ob_start();
if(isset($pathTarget)) include($pathTarget);
$html = ob_get_clean();