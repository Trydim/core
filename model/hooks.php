<?php
/**
 * Писать специально уникальные(новые) имена фукнций.
 */


/**
 * @param $number
 * @param string $importantValue
 * @return string
 */
function addCpNumber_DefaultFunc($number, string $importantValue): string {
  $report = json_decode($importantValue, true);
  $report['cpNumber'] = $report['cpNumber'] ?? $number;
  return json_encode($report);
}
addHook('addCpNumber', 'addCpNumber_DefaultFunc');
