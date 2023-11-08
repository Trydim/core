<?php

/**
 * @var Main $main
 */

const URL_TELEGRAM = 'https://api.telegram.org/bot',
      TOKEN = '6923935821:AAEzxdER-PujGKw2MO4BXDFkJxITVqrZcWc',
      SUBSCRIBE = ABS_SITE_PATH . SHARE_PATH . 'subscribeList.json';

$data = $_REQUEST['botData']['message'];

$method = 'sendMessage';
$action = $data['text'] ?? 'noText';
$chatId = $data['chat']['id'];
$username = $data['chat']['username'];

function toggleUser($chatId, $username = false) {
  $botList = file_get_contents(SUBSCRIBE);

  if (!$botList && $username) $botList = '{}';

  if ($botList) {
    $botList = json_decode($botList, true);

    if ($username) $botList[$chatId] = $username;
    else unset($botList[$chatId]);

    file_put_contents(SUBSCRIBE, json_encode($botList));
    return true;
  }

  return false;
}

$result = ['chat_id' => $chatId];
switch ($action) {
  case '/start':
    // Найти пользователя у всех дилеров
    $pagerParam = [
      'pageNumber'   => 0,
      'countPerPage' => 10000,
      'sortColumn'   => 'ID',
      'sortDirect'   => false,
    ];

    foreach ($main->db->loadDealers() as $dealer) {
      $prefix = $dealer['cmsParam']['prefix'] ?? false;
      if (!$prefix) def($dealer['ID'] . ' not have prefix');

      $main->db->setPrefix($prefix);
      foreach ($main->db->loadUsers($pagerParam) as $user) {
        $contacts = json_decode($user['contacts'] ?? '[]', true);
        $telegramUsername = trim($contacts['telegramUsername'] ?? '');

        if ($telegramUsername === $username) {
          $r = toggleUser($chatId, $username);
          $result['text'] = $r ? 'Подписан пользователь: ' . $username : 'Ошибка';
          break 3; // Остановить switch
        }
      }
    }

    // Найти пользователя в производстве

    //$main->setCmsParam($publicConfig);
    //$db = new DbMain();


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

$result = httpRequest(URL_TELEGRAM . TOKEN . '/' . $method, ['method' => 'post'], json_encode($result));
def($result);
