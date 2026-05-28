<?php
/**
 * Писать специально уникальные(новые) имена фукнций.
 */

function addCpNumber_DefaultFunc($number, string $importantValue): string {
  $report = json_decode($importantValue, true);
  $report['cpNumber'] = $report['cpNumber'] ?? $number;
  return json_encode($report, JSON_HEX_APOS | JSON_HEX_QUOT);
}
addHook(VC::HOOKS_SAVE_ORDER, 'addCpNumber_DefaultFunc');
