<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var object $db
 * @var string $pathTarget
 */

$field = [
  'pageTitle' => 'Настройки',
];
$param = [];
$field['footerContent'] = '';

if ($main->getSettings('admin')) {
  file_exists(SETTINGS_PATH) && $fileSetting = file_get_contents(SETTINGS_PATH);

  if (USE_DATABASE) {
    $permissions = $db->loadTable('permission');
    $permIds = [];

    $permissions = array_map(function ($row) use (&$permIds) {
      $permIds[] = $row['ID'];
      $row['name'] = gTxt($row['name']);
      $row['accessVal'] = json_decode($row['access_val'], true);
      unset($row['access_val']);
      return $row;
    }, $permissions);

    $param['permIds'] = implode(',', $permIds);
    $param['permStatus'] = $permissions;
    $permissions = json_encode($permissions);
  }
}

require $pathTarget;
$html = template('base', $field);
