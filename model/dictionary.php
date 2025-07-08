<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 */

!isset($_SESSION) && session_start();

switch ($cmsAction) {
  case 'changeLang':
    $requestParams = $main->url->request->all();

    $lang = $requestParams['lang'];
    // Устанавливаем на 10 лет
    setcookie('target_lang', $lang, time() + (3600 * 24 * 3600), '/');

    // Перенаправляем без параметра lang в URL
    $url = strtok($_SERVER['REQUEST_URI'], '?'); // Базовый URL без query

    unset($requestParams['lang']);
    if (!empty($query)) {
      $url .= '?' . http_build_query($requestParams);
    }

    $main->reDirect($url);
    break;

  case 'loadDictionary':
  case 'addDictionary':
  case 'changeDictionary':
  case 'delDictionary':
    break;
}
