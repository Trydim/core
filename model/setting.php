<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global main object
 *
 * @var array $dbConfig - config from public
 *
 * @var $setAction - fromQuery
 * @var $orderMail - fromQuery
 * @var $orderMailCopy - fromQuery
 * @var $login - fromQuery
 * @var $password - fromQuery
 * @var $passwordRepeat - fromQuery
 * @var $customization - fromQuery
 */

/**
 * Set manager custom field from Request
 */
function setOrderMailField() {
  define('KEY' , 'orderMail');

  $result = [];

  array_map(function ($key) use (&$result) {
    if (stripos($key, KEY) !== false) {
      $id = str_replace(KEY, '', $key);

      //$fieldKey = preg_replace('/\D\S/g', '', trim($_REQUEST[$key]));
      $fieldKey = trim($_REQUEST[$key]);
      $fieldIndex = translit($fieldKey);
      $fieldType = isset($_REQUEST[TYPE . $id]) ? $_REQUEST[TYPE . $id] : 'string';

      $result[$fieldIndex] = ['name' => $fieldKey, 'type' => $fieldType];
    }
  }, array_keys($_REQUEST));

  return $result;
}

/**
 * Set manager custom field from Request
 */
function setManagerCustomField() {
  define('KEY' , 'mCustomFieldKey');
  define('TYPE' , 'mCustomFieldType');

  $result = [];

  array_map(function ($key) use (&$result) {
    if (stripos($key, KEY) !== false) {
      $id = str_replace(KEY, '', $key);

      //$fieldKey = preg_replace('/\D\S/g', '', trim($_REQUEST[$key]));
      $fieldKey = trim($_REQUEST[$key]);
      $fieldIndex = translit($fieldKey);
      $fieldType = isset($_REQUEST[TYPE . $id]) ? $_REQUEST[TYPE . $id] : 'string';

      $result[$fieldIndex] = ['name' => $fieldKey, 'type' => $fieldType];
    }
  }, array_keys($_REQUEST));

  return $result;
}

if (!isset($db)) {
  require_once 'classes/Db.php';
  $db = new RedBeanPHP\Db($dbConfig);
}

if (isset($setAction)) {
  switch ($setAction) {
    case 'save':
      $usersId = isset($priority) ? $priority : false;

      // Change Setting
      if (USE_DATABASE && $usersId) {
        $columns = $db->getColumnsTable('users');
        $param[$usersId] = [
          'login'         => $login,
          'customization' => $customization,
        ];

        if ($password && $password === $passwordRepeat) $param[$usersId]['password'] = password_hash($password, PASSWORD_BCRYPT);

        $result['error'] = $db->insert($columns, 'users', $param, true);

        // Доступы
        if (isset($permIds)) {
          $columns = $db->getColumnsTable('permission');
          $param = [];

          foreach (explode(',', $permIds) as $id) {
            $param[$id]['access_val'] = [];
            // Меню
            if (isset($_REQUEST['permMenuAccess_' . $id])) {
              $param[$id]['access_val']['menuAccess'] = $_REQUEST['permMenuAccess_' . $id];
            }

            $param[$id]['access_val'] = json_encode($param[$id]['access_val']);
          }

          $result['error'] = $db->insert($columns, 'permission', $param, true);
        }
      } else {
        $password = '123'; // default password
        $hash = '';

        if ($password && $password === $passwordRepeat) $param['password'] = $password;

        if(file_exists(SYSTEM_PATH)) {
          $param = explode('|||', file_get_contents(SYSTEM_PATH))[2];

          $password = $param[1];
          $hash = $param[2];
        }

        $fileData = implode('|||', [$login, $password, $hash]);
        file_put_contents(SETTINGS_PATH, $fileData);
      }

      // Global mail setting
      // Переписать и согласовать с mail.php загрузка пустые строки не сохранять
      $setting = file_exists(SETTINGS_PATH) ? json_decode(file_get_contents(SETTINGS_PATH), true) : [];
      isset($orderMail) && $setting['orderMail'] = $orderMail;
      isset($orderMailCopy) && $setting['orderMailCopy'] = $orderMailCopy;
      !USE_DATABASE && $setting['onlyOne'] = isset($onlyOne);

      // Global manager setting
      $managerSetting = setManagerCustomField();
      count($managerSetting) && $setting['managerSetting'] = $managerSetting;

      isset($setting) && file_put_contents(SETTINGS_PATH, json_encode($setting));
      break;
    case 'load':
      if (USE_DATABASE) $result['user'] = $db->getUser($main->getLogin(), 'ID, login, customization');
      else $result['user'] = $db->getUserFromFile($main->getLogin(), '', $main->checkStatus('ok'));

      $result['setting'] = getSettingFile();
      break;
    case 'addPermType':
      if (isset($permType)) {
        $dbKey = translit($permType);

        $permissions = $db->loadTable('permission');

        foreach ($permissions as $item) {
          if ($item['name'] === $dbKey) {
            $result['error'] = "Запись $permType существует";
            break;
          }
        }

        if (!isset($result['error'])) {
          $columns = $db->getColumnsTable('permission');
          $param = ['0' => [
            'name' => $dbKey,
            'access_val' => '[]',
          ]];
          $result['error'] = $db->insert($columns, 'permission', $param);

          $filePath = ABS_SITE_PATH . 'lang/dictionary.php';
          if (!count($result['error']['result']) && file_exists($filePath)) {
            $file = file($filePath);
            $file[count($file) - 1] = "  '$dbKey' => '$permType',\r\n];\r\n";
            file_put_contents($filePath, $file);
          }
        }
      }
      break;
    case 'removePermType':
      if (isset($permId)) {
        $result['error'] = $db->deleteItem('permission', [$permId]);
      }
      break;

    case 'createProperty':
      $propertySetting = [];
      $setting = file_exists(SETTINGS_PATH) ? json_decode(file_get_contents(SETTINGS_PATH), true) : [];

      $propName = isset($dbTable) ? 'prop_' . translit($dbTable) : false;
      $dataType = isset($dataType) ? str_replace('s_', '', $dataType) : false;

      isset($setting['propertySetting'][$propName]) && $result['error'] = 'Property exist' && $setting = false;

      if ($setting !== false && $propName && $dataType) {
        $setting['propertySetting'][$propName] = [
          'name' => $dbTable,
          'type' => $dataType,
        ];
        file_put_contents(SETTINGS_PATH, json_encode($setting));
      }
      break;
    case 'loadProperties':
      if (file_exists(SETTINGS_PATH)) {
        $setting = json_decode(file_get_contents(SETTINGS_PATH), true);
        isset($setting['propertySetting']) && $result['propertiesTables'] = $setting['propertySetting'];
      }
      break;
    case 'delProperty':
      if (file_exists(SETTINGS_PATH) && isset($props)) {
        $setting = json_decode(file_get_contents(SETTINGS_PATH), true);

        if (isset($setting['propertySetting'])) {
          $setting['propertySetting'] = array_filter($setting['propertySetting'], function ($item) use ($props) {
            return !in_array($item, $props);
          }, ARRAY_FILTER_USE_KEY);

          file_put_contents(SETTINGS_PATH, json_encode($setting));
        }
      }
      break;

  }
}
