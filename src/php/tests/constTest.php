<?php

const CORE = __DIR__ . '/../../../';
const ABS_SITE_PATH = CORE . '../';
const SHARE_PATH = 'shared/';

require CORE . 'model/classes/VC.php';
require CORE . 'model/func.php';

spl_autoload_register('cmsAutoloader');
