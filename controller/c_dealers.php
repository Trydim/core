<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 */

if (includes($main->url->getRequestUri(), 'update')) {
  $start = time();

  foreach ($main->db->loadDealers() as $dealer) {
    if (boolValue($dealer['activity'] ?? false)) $main->dealer->update($dealer['id']);
  }

  $main->response->setContent('Dealers updated! by ' . (time() - $start) . ' sec');
  return;
}

$field = [
  'pageTitle'     => 'Дилеры',
  'sideRight'     => '',
  'footerContent' => $main->initDictionary(),
  'cssLinks'  => [CORE_CSS . 'module/dealers.css?ver=8cdf94ab40'],
  'jsLinks'   => [CORE_JS . 'module/dealers.js?ver=73262afc8e'],
];

// all Properties
$setting = $main->getSettings(VC::DEALER_PROPERTIES);
foreach ($main->db->getTables('prop') as $table) {
  // Param saved in json
  $prop = $setting[$table['dbTable']] ?? [];

  $setting[$table['dbTable']] = [
    'name'   => $prop['name'] ?? $table['name'],
    'type'   => $prop['type'] ?? 'select',
    'values' => array_map(function ($row) {
      $row['id'] = $row['ID'];
      return $row;
    }, $main->db->loadTable($table['dbTable'])),
  ];
}
$field['footerContent'] .= "<input type='hidden' id='dataProperties' value='" . json_encode($setting) . "'>";

// if have table property, add libs
$haveTable = array_filter($setting, function ($prop) { return $prop['type'] === 'table'; });
if (count($haveTable)) {
  array_unshift($field['jsLinks'], CORE_JS . 'libs/handsontable.full.min.js?ver=f3bb2b6859');
}
unset($setting, $haveTable);

$main->setControllerField($field)->fireHook(VC::HOOKS_DEALERS_TEMPLATE, $main);
ob_start();
include $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
