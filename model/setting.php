<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global main object
 *
 * @var $cmsAction - fromQuery
 *
 * @var $user - from Query
 *
 * @var $customization - fromQuery
 */

$db = $main->getDB();

switch ($cmsAction) {
  case 'saveSetting':
    $usersId = $main->getLogin('id');
    $user = json_decode($user ?? '[]', true);
    $userName = !empty($user['name']) ? $user['name'] : 'noName';

    // Change Setting
    if (USE_DATABASE && $usersId) {
      // Test unique login
      $users = $db->selectQuery('users', '*', ' login = "' . $user['login'] . '"');
      if (count($users) > 1 || $users[0]['ID'] !== $usersId) {
        $result['error'] = gTxt('Login exist');
        break;
      }

      $param[$usersId] = [
        'name'          => $userName,
        'login'         => $user['login'],
        'customization' => $customization ?? '{}',
      ];

      // Check password
      if (!empty($user['password']) && $user['password'] === $user['passwordRepeat']) {
        $param[$usersId]['password'] = password_hash($user['password'], PASSWORD_BCRYPT);
      }

      // Save user
      if ($user['change']) {
        $columns = $db->getColumnsTable('users');
        $result['error'] = $db->insert($columns, 'users', $param, true);

        // Set new userName
        if (!count(checkError($result['error']))) $_SESSION['name'] = $userName;
      }

      // Permission
      // Test unique permission name
      $permissions = json_decode($permissions ?? '[]', true);
      if (count($permissions)) {
        $param = [
          'new'    => [],
          'change' => [],
        ];

        foreach ($permissions as $permission) {
          $id = $permission['id'];

          if (isset($permission['delete'])) $result['error']['del'] = $db->deleteItem('permission', [$id]);

          // Js random 0 - 1
          $param[$id < 1 ? 'new' : 'change'][$id] = [
            'name'       => $permission['name'],
            'access_val' => json_encode($permission['accessVal']),
          ];
        }

        $columns = $db->getColumnsTable('permission');
        $result['error']['add'] = $db->insert($columns, 'permission', $param['new']);
        $result['error']['change'] = $db->insert($columns, 'permission', $param['change'], true);
      }

      // Статусы
      if (isset($orderStatus)) {
        $columns = $db->getColumnsTable('order_status');
        $currentTable = $db->loadTable('order_status');
        $param = [];
        foreach (json_decode($orderStatus, true) as $status) {
          $param[$status['ID']]['name'] = $status['name'];
        }
        $result['error'] = $db->insert($columns, 'order_status', $param, false);
      }
    } else {
      $hash = '';

      // Check password
      if (!empty($user['password']) && $user['password'] === $user['passwordRepeat']) {
        $password = $hash = password_hash($user['password'], PASSWORD_BCRYPT);
      }

      file_put_contents(SYSTEM_PATH, implode('|||', [$user['login'], $user['password'], $hash]));
      //$setting['onlyOne'] = boolval($user['onlyOne']);
    }

    // Global mail setting
    $mail = json_decode($mail ?? '[]', true);
    !empty($mail['mailTarget']) && $main->setSettings('mailTarget',  $mail['mailTarget']);
    !empty($mail['mailTargetCopy']) && $main->setSettings('mailTargetCopy',  $mail['mailTargetCopy']);
    !empty($mail['mailSubject']) && $main->setSettings('mailSubject',  $mail['mailSubject']);
    !empty($mail['mailFromName']) && $main->setSettings('mailFromName',  $mail['mailFromName']);

    // Global manager setting
    $managerFields = json_decode($managerFields ?? '[]', true);
    count($managerFields) && $main->setSettings('managerFields', $managerFields);

    $main->saveSettings();
    break;
  case 'load':
    if (USE_DATABASE) $result['user'] = $db->getUser($main->getLogin(), 'ID, login, customization');
    else $result['user'] = $db->getUserFromFile($main->getLogin(), '', $main->checkStatus('ok'));

    $result['setting'] = getSettingFile();
    break;

  case 'createProperty':
  case 'changeProperty':
    if (isset($tableName) && isset($dataType) && !empty($tableName)) {
      $propertySetting = [];
      $setting = getSettingFile();

      $tableCode = $tableCode ?? translit($tableName);
      $propName = 'prop_' . str_replace('prop_', '', $tableCode);
      $dataType = str_replace('s_', '', $dataType);

      if (!isset($setting['propertySetting'][$propName])) {
        $setting['propertySetting'][$propName] = [
          'name' => $tableName,
          'type' => $dataType,
        ];
        setSettingFile($setting);
      } else {
        $result['error'] = 'Property exist';
      }
    } else $result['error'] = 'Property name not exist';
    break;
  case 'loadProperties':
    $setting = $setting ?? getSettingFile();
    if (isset($setting['propertySetting'])) {
       $result['propertiesTables'] = array_filter($setting['propertySetting'],
         function ($prop) { return isset($prop['type']);}
       );
    }
    break;
  case 'delProperties':
    if (isset($props) && ($setting = getSettingFile()) && isset($setting['propertySetting'])) {
      $setting['propertySetting'] = array_filter($setting['propertySetting'], function ($item) use ($props) {
        return !in_array($item, $props);
      }, ARRAY_FILTER_USE_KEY);

      setSettingFile($setting);
    }
    break;

}
