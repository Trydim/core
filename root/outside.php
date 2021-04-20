<?php

if (defined('MAIN_ACCESS') || defined('ABS_SITE_PATH')) die('access denied!');

define('MAIN_ACCESS', true);
define('OUTSIDE', 'I'); // I - inline без Shadow Dom, S - Включить в тень
define('ABS_SITE_PATH', __DIR__ . '/');

$homePath = get_include_path();
set_include_path(ABS_SITE_PATH);

require 'core/head.php';

set_include_path($homePath);
