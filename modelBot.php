<?php

/**
 * @var Main $main
 */

const URL_TELEGRAM = 'https://api.telegram.org/bot',
      SUBSCRIBE = ABS_SITE_PATH . SHARE_PATH . 'subscribeList.json';

$data = $_REQUEST['botData']['message'];

$method = 'sendMessage';
$action = $data['text'] ?? 'noText';
$chatId = $data['chat']['id'];
$username = $data['chat']['username'];

function toggleUser(string $chatId, $user = false): bool {
  $botList = file_get_contents(SUBSCRIBE);

  if (!$botList && $user) $botList = '{}';

  if ($botList) {
    $botList = json_decode($botList, true);

    if ($user) $botList[$chatId] = $user;
    else unset($botList[$chatId]);

    file_put_contents(SUBSCRIBE, json_encode($botList));
    return true;
  }

  return false;
}
function haveUser(string $chatId): bool {
  $botList = file_get_contents(SUBSCRIBE);

  if ($botList) {
    $botList = json_decode($botList, true);

    return isset($botList[$chatId]);
  }
  return false;
}

$result = ['chat_id' => $chatId];
switch ($action) {
  case '/start':
    $db = $main->getDB();
    $pagerParam = [
      'pageNumber'   => 0,
      'countPerPage' => 10000,
      'sortColumn'   => 'ID',
      'sortDirect'   => false,
    ];

    // Проверить есть ли такой пользователь
    if (haveUser($chatId)) {
      $result['text'] = 'Пользователь ' . $username . ' уже подписан.';
      break;
    }

    // Найти пользователя у всех дилеров
    foreach ($db->loadDealers(false, false) as $dealer) {
      $prefix = $dealer['cmsParam']['prefix'] ?? false;
      if (!$prefix) def($dealer['ID'] . ' not have prefix');

      $db->setPrefix($prefix);
      foreach ($db->loadUsers($pagerParam) as $user) {
        $tgUsername = trim($contacts['telegramUsername'] ?? '');

        if ($tgUsername === $username) {
          $r = toggleUser($chatId, [
            'type' => 'dealer',
            'username' => $username,
            'permission' => $db->selectQuery('permission', ['ID', 'properties'], 'ID = ' . $user['permissionId'])[0]
          ]);
          $result['text'] = $r ? 'Подписан пользователь: ' . $username : 'Ошибка';
          break 3; // Остановить switch
        }
      }
    }

    // Найти пользователя в производстве
    $dbMakerConfig = [
      'dbHost'     => 'localhost',
      'dbName'     => 'graddoor_maker_prod',
      'dbUsername' => 'dbUser',
      'dbPass'     => 'WHZM4JpunONGycm'
    ];
    $db->addDb('maker', $dbMakerConfig)->selectDb('maker')->setPrefix('');

    foreach ($db->loadUsers($pagerParam) as $user) {
      $tgUsername = str_replace('@', '', trim($contacts['telegramUsername'] ?? ''));

      if ($tgUsername === $username) {
        $r = toggleUser($chatId, [
          'type' => 'maker',
          'username' => $username,
          'permission' => $db->selectQuery('permission', ['ID', 'properties'], 'ID = ' . $user['permissionId'])[0]
        ]);
        $result['text'] = $r ? 'Подписан пользователь: ' . $username : 'Ошибка';
        break 2;
      }
    }

    $result['text'] = 'Пользователь ' . $username . ' не найден.';
    break;
  case '/stop':
    // Удалить из списка
    $r = toggleUser($chatId);

    $result['text'] = $r ? 'Подписка отключена' : 'Ошибка';
    break;
  default:
    def('bot action not exist!');
    break;

}

$result = httpRequest(URL_TELEGRAM . TOKEN_TELEGRAM . '/' . $method, ['method' => 'post'], json_encode($result));
def($result);
