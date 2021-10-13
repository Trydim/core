<?php
/**
 * Писать специально уникальные(новые) имена фукнций.
 */


/**
 * @param $number
 * @param $reportVal
 * @return false|string
 */
function addCpNumber_DefaultFunc($number, $reportVal) {
  $reportVal = json_decode($reportVal, true);
  $reportVal['cpNumber'] = $number;
  return json_encode($reportVal);
}
addHook('addCpNumber', 'addCpNumber_DefaultFunc');
