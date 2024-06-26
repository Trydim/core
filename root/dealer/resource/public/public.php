<?php

/**
 * @var Main $main - global
 * @var array $field - from controller
 * @var string $dbContent
 */

$main->db->mergeContentData();

$dealer = $main->getLogin(VC::USER_DEALER);

$dbContent .= "<input type='hidden' id='dataDeal' value='". json_encode($dealer) . "'>";

unset($dealer);
