<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global main object
 *
 * @var string $cmsAction - extract from query in head.php
 * @var array $user - extract from query
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
        if (count($users) > 1 || (count($users) > 0 && $users[0]['ID'] !== $usersId)) {
          $result['error'] = gTxt('Login exist');
          break;
        }

        $user['customization'] = $user['customization'] ?? [];

        // Only one login
        if ($user['onlyOne']) {
          $user['customization']['onlyOne'] = true;
        }

        $param[$usersId] = [
          'name'          => $userName,
          'login'         => $user['login'],
          'contacts'      => json_encode($user['fields'] ?? []),
          'customization' => json_encode($user['customization']),
        ];

        // Check password
        if (!empty($user['password']) && $user['password'] === $user['passwordRepeat']) {
          $param[$usersId]['password'] = password_hash($user['password'], PASSWORD_BCRYPT);
          $param[$usersId]['hash'] = password_hash($user['password'], PASSWORD_BCRYPT);
        }

        // Save user
        $columns = $db->getColumnsTable('users');
        $result = $db->insert($columns, 'users', $param, true);

        // Set new User Params
        if (empty($result['error'])) {
          $_SESSION['login'] = $user['login'];
          $_SESSION['name'] = $userName;
          isset($param[$usersId]['hash']) && $_SESSION['hash'] = $param[$usersId]['hash'];
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
        $result = $db->insert($columns, 'permission', $param['new']);
        $result = $db->insert($columns, 'permission', $param['change'], true);
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
            $result['statusDel']['error'] = $db->deleteItem('order_status', [$id]);
            continue;
          }

          // Js random 0 - 1
          if ($id < 1) {
            $param['new'][uniqid()] = [
              'code' => $status['code'],
              'name' => $status['name'],
              'sort' => $status['sort'],
            ];
          } else {
            $param['change'][$id] = [
              'code' => $status['code'],
              'name' => $status['name'],
              'sort' => $status['sort'],
            ];
          }
        }

        $columns = $db->getColumnsTable('order_status');
        $result['statusAdd']['error'] = $db->insert($columns, 'order_status', $param['new']);
        $result['statusChange']['error'] = $db->insert($columns, 'order_status', $param['change'], true);
        $result['statusList'] = $db->loadOrderStatus();
      }

      // Rate
      $rate = json_decode($rate ?? '[]', true);
      if (count($rate)) {
        // Auto update
        $main->setSettings(VC::AUTO_REFRESH, $rate[VC::AUTO_REFRESH]);
        $main->setSettings(VC::SERVER_REFRESH, $rate[VC::SERVER_REFRESH]);

        $rate = $rate['data'];
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

      file_put_contents(SYSTEM_PATH, implode('|||', [$user['login'], $user['password'], $hash])); // todo перенести в DB
      //$setting['onlyOne'] = boolval($user['onlyOne']);
    }

    // Global mail setting
    $mail = json_decode($mail ?? '[]', true);
    !empty($mail['target'])     && $main->setSettings(VC::MAIL_TARGET, $mail['target']);
    !empty($mail['targetCopy']) && $main->setSettings(VC::MAIL_TARGET_COPY, $mail['targetCopy']);
    !empty($mail['subject'])    && $main->setSettings(VC::MAIL_SUBJECT, $mail['subject']);
    !empty($mail['fromName'])   && $main->setSettings(VC::MAIL_FROM_NAME, $mail['fromName']);

    // Global manager setting
    $managerFields = json_decode($managerFields ?? '[]', true);
    count($managerFields) && $main->setSettings(VC::MANAGER_FIELDS, $managerFields);

    // Global other setting
    $main->setSettings(VC::STATUS_DEFAULT, $statusDefault ?? $main->db->selectQuery('order_status', 'ID')[0]);
    $other = json_decode($otherFields ?? '[]', true);
    $main->setSettings(VC::PHONE_MASK_GLOBAL, $other['phoneMask']['global'] ?? $main->getSettings(VC::PHONE_MASK_GLOBAL) ?? '+_ (___) ___ __ __')
         ->setSettings(VC::CATALOG_IMAGE_SIZE, $other[VC::CATALOG_IMAGE_SIZE] ?? []);

    $main->saveSettings();
    break;
  case 'saveColumns':
    if (!isset($tableType) || !isset($columns)) { $result['error'] = 'saveColumns error'; break; }

    $usersId = $main->getLogin('id');
    $tableType = $tableType ?? 'order';
    $customization = $main->getLogin('customization');
    $customization[$tableType] = json_decode($columns, true);

    $param[$usersId] = ['customization' => $customization];

    // Save user
    $result = $db->insert($db->getColumnsTable('users'), 'users', $param, true);
    break;
  case 'load':
    if (USE_DATABASE) $result['user'] = $db->getUser($main->getLogin(), 'ID, login, customization');
    else $result['user'] = $db->getUserFromFile($main->getLogin(), '', $main->checkStatus());

    $result['setting'] = $main->getSettings();
    break;

  // Options property
  case 'createProperty': case 'createDealersProperty':
  case 'changeProperty': case 'changeDealersProperty':
    $propKey  = in_array($cmsAction, ['createProperty', 'changeProperty']) ? VC::OPTION_PROPERTIES : VC::DEALER_PROPERTIES;
    $isChange = includes($cmsAction, 'change');
    $property = json_decode($property ?? '[]', true);

    $tableName = $property['newName'];
    $tableCode = strtolower(translit($property['newCode'] ?? $tableName));
    $propName  = 'prop_' . str_replace('prop_', '', $tableCode);
    $setting   = $main->getSettings($propKey);

    // Удалить сущности свойства, если есть (пока только таблица)
    if ($isChange) {
      // Если теперь не справочник удалить таблицу.
      if (!includes($property['type'], 'select')) $db->delPropertyTable([$propName]);
    }

    if (includes($property['type'], 'select')) { // Справочник
      $haveTable = count($db->getTables($propName));

      $param = [];
      foreach ($property['fields'] as $field) {
        if ($haveTable && $isChange) $param[translit($field['newName'])] = $field['type'];
        else {
          $param[] = [
            'newName' => $field['newName'],
            'type'    => $field['type'],
          ];
        }
      }

      if (!isset($setting[$propName]) || !$haveTable) {
        $result['error'] = $db->createPropertyTable($propName, $param);
      } else if ($isChange) {
        $result['error'] = $db->changePropertyTable($propName, $param);
      } else $result['error'] = 'Property exist';

      $setting[$propName] = [
        'name' => $tableName,
        'type' => $property['type'],
      ];
      $main->setSettings($propKey, $setting)->saveSettings();
    } else if (includes($property['type'], 'table')) {
      $setting[$propName] = [
        'name' => $tableName,
        'type' => 'table',
        'columns' => $property['fields'],
      ];
      $main->setSettings($propKey, $setting)->saveSettings();
    } else { // остальные
      // If changed, else remove old value.
      if ($isChange) unset($setting[$property['code']]);

      if (!isset($setting[$propName])) {
        $setting[$propName] = [
          'name' => $tableName,
          'type' => $property['type'],
        ];
        $main->setSettings($propKey, $setting)->saveSettings();
      } else $result['error'] = 'Property exist';
    }
    break;
  case 'changePropertyOrder': case 'changeDealersPropertyOrder':
    $propKey  = includes($cmsAction, 'Dealer') ? VC::DEALER_PROPERTIES : VC::OPTION_PROPERTIES;
    $property = json_decode($property ?? '[]', true);

    if (!count($property)) { $result['error'] = $cmsAction . ' error: Property is empty'; break; }

    $setting = [];
    foreach ($property as $prop) {
      $setting[$prop['code']] = [
        'name' => $prop['name'],
        'type' => $prop['type'],
      ];
    }

    $main->setSettings($propKey, $setting)->saveSettings();
    $result = ['ok'];
    break;
  case 'loadProperties': case 'loadDealersProperties':
    $propKey = $cmsAction === 'loadProperties' ? VC::OPTION_PROPERTIES : VC::DEALER_PROPERTIES;
    $result[$propKey] = [];
    $setting = $main->getSettings($propKey);
    $dbProperties = array_keys($db->getTables('prop'));

    if (is_array($setting)) {
      function getPropertyField($name, $type): array {
        if (includes($name, '_ids')) $type = 'file';

        switch ($type) {
          case 'varchar(255)':  $type = 'string'; break;
          case 'varchar(1000)': $type = 'textarea'; break;
          case 'float': case 'double': $type = 'float'; break;
          case 'decimal(10,4)': $type = 'money'; break;
          case 'timestamp':     $type = 'date'; break;
          case 'int(1)':        $type = 'bool'; break;
          case 'int(20)':       $type = 'int'; break;
        }

        return [
          'name' => $name,
          'type' => $type,
        ];
      }

      foreach ($setting as $code => $table) {
        if (isset($table['type']) || in_array($code, $dbProperties)) {
          $type = $table['type'] ?? 'select';
          $param = [
            'name' => $table['name'],
            'code' => $code,
            'type' => $type,
          ];

          if (includes($type, 'select')) {
            $columns = $db->getColumnsTable($code);

            if (count($columns) > 2) {
              $fields = [];

              foreach ($columns as $column) {
                if (in_array($column['columnName'], ['ID', 'name'])) continue;

                $fields[] = getPropertyField($column['columnName'], $column['type']);
              }

              $param['fields'] = $fields;
            }
          }

          $result[$propKey][] = $param;
        }
      }
    }
    break;
  case 'loadProperty':
    if (isset($props)) {
      $result['propertyValue'] = $db->getColumnsTable($props); // todo загрузить просто
    }
    break;
  case 'deleteProperty':  case 'deleteDealersProperty':
    $propKey = $cmsAction === 'deleteProperty' ? VC::OPTION_PROPERTIES : VC::DEALER_PROPERTIES;
    $property = json_decode($property ?? '[]', true);
    $setting = $main->getSettings($propKey);

    if (!empty($property['fields'])) {
      $db->delPropertyTable([$property['code']]);
    }

    if (isset($property['code'])) {
      unset($setting['prop_' . str_replace('prop_', '', $property['code'])]);

      $main->setSettings($propKey, $setting)->saveSettings();
    }
    break;
}

if (isset($result)) $main->response->setContent($result);
