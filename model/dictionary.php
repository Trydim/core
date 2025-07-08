<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 */

$result = [];

!isset($_SESSION) && session_start();

switch ($cmsAction) {
  case 'changeLang':
    // Устанавливаем на 10 лет
    setcookie('lang', $main->url->request->get('lang'), time() + (3600 * 24 * 3600), '/');
    break;

  case 'loadLanguages':
    $result['languagesList'] = $main->getAvailableLanguages();
    break;

  case 'loadDictionary':
  case 'addDictionary':
  case 'changeDictionary':
  case 'delDictionary':
    break;
}

$main->response->setContent($result);
