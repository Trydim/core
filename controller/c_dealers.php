<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main - global
 */

// Hidden queries words: update, database
if (includes($main->url->getRequestUri(), 'update')) {
  $start = time();
  $msg = 'Dealers:<br>';

  foreach ($main->db->loadDealers(true, false) as $dealer) {
    $main->dealer->update($dealer['id']);
    $msg .= $dealer['name'] . '<br>';
  }

  $main->response->setContent($msg . '<br>The Updated is completed in ' . (time() - $start) . ' sec!');
  return;
}

else if (includes($main->url->getRequestUri(), 'database')) {
  $param['isDBEditor'] = true;
  $param['dealerList'] = [];

  foreach ($main->db->loadDealers(false, false) as $dealer) {
    $param['dealerList'][] = [
      'id'   => $dealer['id'],
      'name' => $dealer['name'],
    ];
  }
}

$field = [
  'pageTitle'     => gTxt('Dealers'),
  'sideRight'     => '',
  'footerContent' => $main->initDictionary(),
];

$dealerProps = [];

// CMS Languages is enabled
if ($main->getCmsParam(VC::LOCALES)) {
  $dealerProps['prop_locales'] = [
    'name'   => gTxt('Available languages'),
    'type'   => 'multiSelect',
    'values' => array_map(function ($row) {
      $row['id'] = $row['ID'];
      return $row;
    }, $main->getAvailableLanguages()),
  ];
}

// All dealers properties
$dealerProps = array_merge($dealerProps, $main->getSettings(VC::DEALER_PROPERTIES));
foreach ($main->db->getTables('prop') as $table) {
  // Param saved in JSON
  $prop = $dealerProps[$table['dbTable']] ?? [];

  $dealerProps[$table['dbTable']] = [
    'name'   => $prop['name'] ?? $table['name'],
    'type'   => $prop['type'] ?? 'select',
    'values' => array_map(function ($row) {
      $row['id'] = $row['ID'];
      return $row;
    }, $main->db->loadTable($table['dbTable'])),
  ];
}
$field['footerContent'] .= $main->getFrontContent('dataProperties', $dealerProps);

// If user have table property, add libs
$haveTable = array_find($dealerProps, function ($prop) { return $prop['type'] === 'table'; });

$main->setControllerField($field)
     ->addAssets(['module/dealers.css', 'module/dealers.js']);

if (!empty($haveTable)) $main->addAssets('libs/handsontable.full.min.js', 'before');

unset($values, $dealerProps, $haveTable);

$main->fireHook(VC::HOOKS_DEALERS_TEMPLATE, $main);

$field[VC::BASE_CONTENT] = template('dealers', ['param' => $param ?? []]);

$main->response->setContent(template('base', $field));
