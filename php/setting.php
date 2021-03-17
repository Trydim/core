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

if (!isset($db)) {
  require_once 'libs/Db.php';
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

        $result = implode('|||', [$login, $password, $hash]);
        file_put_contents(SETTINGS_PATH, $result);
      }

      // Global mail setting
      $setting = [];
      isset($orderMail) && $setting['orderMail'] = $orderMail;
      isset($orderMailCopy) && $setting['orderMailCopy'] = $orderMailCopy;


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
