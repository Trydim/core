<?php
/**
 * Писать специально уникальные(новые) имена фукнций.
 */


/**
 * @param $number
 * @param $reportValue
 * @return false|string
 */
function addCpNumber_DefaultFunc($number, $reportValue) {
  $report = json_decode($reportValue, true);
  $report['cpNumber'] = $report['cpNumber'] ?? $number;
  return json_encode($report);
}
addHook('addCpNumber', 'addCpNumber_DefaultFunc');
