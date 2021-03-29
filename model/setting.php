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
      $columns = USE_DATABASE ? $db->getColumnsTable('users') : [];

      // Change Setting
      if (USE_DATABASE && $usersId) {
        $param[$usersId] = [
          'login'         => $login,
          'customization' => $customization,
        ];

        if ($password && $password === $passwordRepeat) $param[$usersId]['password'] = password_hash($password, PASSWORD_BCRYPT);

        $result['error'] = $db->insert($columns, 'users', $param, true);
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
  }
}
