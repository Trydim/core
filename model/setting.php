<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global main object
 *
 * @var $cmsAction - fromQuery
 *
 * @var $user - from Query
 */

$db = $main->getDB();

switch ($cmsAction) {
  case 'saveSetting':
    $usersId = $main->getLogin('id');
    $user = json_decode($user ?? '[]', true);
    $userName = !empty($user['name']) ? $user['name'] : 'noName';

    // Change Setting
    if (USE_DATABASE && $usersId) {

      // Update User
      if (!empty($user)) {

        // Test unique login
        $users = $db->selectQuery('users', '*', ' login = "' . $user['login'] . '"');
        if (count($users) > 1 || $users[0]['ID'] !== $usersId) {
          $result['error'] = gTxt('Login exist');
          break;
        }

        $param[$usersId] = [
          'name'          => $userName,
          'login'         => $user['login'],
          'contacts'      => json_encode($user['fields'] ?? []), // todo
          'customization' => $user['customization'] ?? '{}',
        ];

        // Check password
        if (!empty($user['password']) && $user['password'] === $user['passwordRepeat']) {
          $param[$usersId]['password'] = password_hash($user['password'], PASSWORD_BCRYPT);
        }

        // Save user
        $columns = $db->getColumnsTable('users');
        $result['error'] = $db->insert($columns, 'users', $param, true);

        // Set new User Params
        if (empty($result['error'])) {
          $_SESSION['login'] = $user['login'];
          $_SESSION['name'] = $userName;
          isset($param[$usersId]['password']) && $_SESSION['hash'] = $param[$usersId]['password'];
        }
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

          if (isset($permission['delete'])) {
            $result['error']['del'] = $db->deleteItem('permission', [$id]);
            continue;
          }

          $field = [
            'name'       => $permission['name'],
            'properties' => json_encode($permission['properties']),
          ];

          // Js random 0 - 1
          if ($id < 1) $param['new'][uniqid()] = $field;
          else $param['change'][$id] = $field;
        }

        $columns = $db->getColumnsTable('permission');
        $result['error']['addPerm'] = $db->insert($columns, 'permission', $param['new']);
        $result['error']['changePerm'] = $db->insert($columns, 'permission', $param['change'], true);
      }
      unset($permissions);

      // Статусы
      if (isset($orderStatus)) {
        //$currentTable = $db->loadTable('order_status');
        $param = [
          'new'    => [],
          'change' => [],
        ];

        foreach (json_decode($orderStatus, true) as $status) {
          $id = $status['ID'];

          if (isset($status['delete'])) {
            $result['error']['statusDel'] = $db->deleteItem('order_status', [$id]);
            continue;
          }

          // Js random 0 - 1
          if ($id < 1) {
            $param['new'][uniqid()]['name'] = $status['name'];
          } else {
            $param['change'][$id]['name'] = $status['name'];
          }
        }

        $columns = $db->getColumnsTable('order_status');
        $result['error']['statusAdd'] = $db->insert($columns, 'order_status', $param['new']);
        $result['error']['statusChange'] = $db->insert($columns, 'order_status', $param['change'], true);
      }

      // Rate
      $rate = json_decode($rate ?? '[]', true);
      if (count($rate)) {
        $param = [
          'new'    => [],
          'change' => [],
        ];

        foreach ($rate as $item) {
          $id = $item['ID'];

          if (isset($item['delete']) && boolValue($item['delete']) === true) {
            $result['error']['del'] = $db->deleteItem('money', [$id]);
            continue;
          }

          $field = [
            'code' => $item['code'],
            'name' => $item['name'],
            'short_name' => $item['shortName'],
            'rate' => $item['rate'],
            'main' => intval($item['main']),
          ];

          if ($id === 'new') $param['new'][uniqid()] = $field;
          else $param['change'][$id] = $field;
        }

        $columns = $db->getColumnsTable('money');
        $result['error']['addRate'] = $db->insert($columns, 'money', $param['new']);
        $result['error']['changeRate'] = $db->insert($columns, 'money', $param['change'], true);
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
    !empty($mail['target']) && $main->setSettings('mailTarget', $mail['target']);
    !empty($mail['targetCopy']) && $main->setSettings('mailTargetCopy', $mail['targetCopy']);
    !empty($mail['subject']) && $main->setSettings('mailSubject', $mail['subject']);
    !empty($mail['fromName']) && $main->setSettings('mailFromName', $mail['fromName']);

    // Global manager setting
    $managerFields = json_decode($managerFields ?? '[]', true);
    count($managerFields) && $main->setSettings('managerFields', $managerFields);

    // Global other setting
    $main->setSettings('statusDefault', $statusDefault ?? $main->db->selectQuery('order_status', 'ID')[0]);
    $other = json_decode($otherFields ?? '[]', true);
    $main->setSettings('phoneMaskGlobal', $other['phoneMask']['global'] ?? $main->getSettings('phoneMaskGlobal') ?? '+_ (___) ___ __ __');

    $main->saveSettings();
    break;
  case 'load':
    if (USE_DATABASE) $result['user'] = $db->getUser($main->getLogin(), 'ID, login, customization');
    else $result['user'] = $db->getUserFromFile($main->getLogin(), '', $main->checkStatus('ok'));

    $result['setting'] = getSettingFile();
    break;

  // Options property
  case 'createProperty':
  case 'changeProperty':
    $property = json_decode($property ?? '[]', true);

    $tableName = $property['name'];
    $tableCode = $property['code'] ?? translit($tableName);
    $propName = 'prop_' . str_replace('prop_', '', $tableCode);
    $setting = $main->getSettings('optionProperties');

    if ($property['type'] === 'select') { // Справочник
      $param = [];
      foreach ($property['fields'] as $id => $value) {
        $param[translit($value['name'])] = $value['type'];
      }

      if (!isset($setting[$propName])) {
        $setting[$propName]['name'] = $tableName;
        $main->setSettings('optionProperties', $setting)->saveSettings();
        $result['error'] = $db->createPropertyTable($propName, $param);
      } else if ($cmsAction === 'changeProperty') {
        $db->delPropertyTable([$propName]);
        $setting[$propName]['name'] = $tableName;
        $main->setSettings('optionProperties', $setting)->saveSettings();
        $result['error'] = $db->createPropertyTable($propName, $param);
      } else $result['error'] = 'Property exist';

    } else { // остальные
      $dataType = $property['type'];

      if (!isset($setting[$propName]) || $cmsAction === 'changeProperty') {
        $setting[$propName] = [
          'name' => $tableName,
          'type' => $dataType,
        ];
        $main->setSettings('optionProperties', $setting)->saveSettings();
      } else $result['error'] = 'Property exist';
    }
    break;
  case 'loadProperties':
    $result['optionProperties'] = [];
    $setting = $main->getSettings('optionProperties');
    $dbProperties = array_keys($db->getTables('prop'));

    if ($setting) {
      foreach ($setting as $code => $table) {
        if (isset($table['type']) || in_array($code, $dbProperties)) {
          $type = $table['type'] ?? 'select';

          $result['optionProperties'][] = [
            'name' => $table['name'],
            'code' => $code,
            'type' => $type,
            'typeLang' => gTxtDB('types', $type),
          ];
        }
      }
    }
    break;
  case 'loadProperty':
    if (isset($props)) {
      $result['propertyValue'] = $db->getColumnsTable($props); // todo загрузить просто
    }
    break;
  case 'delProperties':
    $property = json_decode($property ?? '[]', true);
    $setting = $main->getSettings('optionProperties');

    if (isset($props)) {
      $props = explode(',', $props);

      $db->delPropertyTable($props);
    }

    if (isset($props) && ($setting = getSettingFile()) && isset($setting['propertySetting'])) {
      $setting['propertySetting'] = array_filter($setting['propertySetting'], function ($item) use ($props) {
        return !in_array($item, $props);
      }, ARRAY_FILTER_USE_KEY);

      //setSettingFile($setting);
    }
    $main->saveSettings();
    break;

}
