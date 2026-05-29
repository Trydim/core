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

$dealerProps = [];

// CMS Languages is enabled
if ($main->getCmsParam(VC::LOCALES)) {
  $dealerProps['prop_locales'] = [
    'name'   => gTxt('Available languages'),
    'type'   => 'multiSelect',
    'values' => $main->getAvailableLanguages(),
  ];
}

// All dealers properties
// If user have table property, add libs
$hasTableProp = false;
$dealerProps = array_merge($dealerProps, $main->getSettings(VC::DEALER_PROPERTIES));
foreach ($main->db->getTables('prop') as $table) {
  // Param saved in JSON
  $prop = $dealerProps[$table['dbTable']] ?? [];

  if ($prop['type'] === 'table') $hasTableProp = true;

  $dealerProps[$table['dbTable']] = [
    'name'   => $prop['name'] ?? $table['name'],
    'type'   => $prop['type'] ?? 'select',
    'values' => $main->db->loadTable($table['dbTable']),
  ];
}

$main->addAssets(['module/dealers.css', 'module/dealers.js']);
if ($hasTableProp) $main->addAssets('libs/handsontable.full.min.js', 'before');

$main->addControllerField(VC::BASE_PAGE_TITLE, gTxt('Dealers'))
     ->addControllerField(VC::BASE_CONTENT, template('dealers', ['param' => $param ?? []]))
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary())
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataProperties', $dealerProps));

$main->fireHook(VC::HOOKS_DEALERS_TEMPLATE, $main);
$main->response->setContent(template());
unset($values, $dealerProps, $haveTable);
