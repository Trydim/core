<?php

/**
 * @param $number
 * @param $reportVal
 * @return false|string
 */
function addCpNumber_func($number, $reportVal) {
  $reportVal = json_decode($reportVal, true);
  $reportVal['global']['cpNumber'] = $number;
  return json_encode($reportVal);
}
addHook('addCpNumber', 'addCpNumber_func');
