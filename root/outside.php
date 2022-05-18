<?php
/**
 * I - inline без Shadow Dom, S - Включить в тень
 * @var string
 */
const OUTSIDE = 'S';

if (defined('MAIN_ACCESS') || defined('ABS_SITE_PATH')) die('access denied!');

const MAIN_ACCESS = true;
const ABS_SITE_PATH = __DIR__ . '/';

$homePath = get_include_path();
set_include_path(ABS_SITE_PATH);

require ABS_SITE_PATH . 'core/head.php';

set_include_path($homePath);
