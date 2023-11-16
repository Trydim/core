<?php

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 */

switch ($cmsAction) {
  case 'connect':

    break;
  case 'disconnect':
    echo 1;
    break;
}
