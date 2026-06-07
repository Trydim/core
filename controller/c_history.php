<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'История изменений')
     ->addAssets(['module/history.css', 'module/history.js'])
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary())
     ->addControllerField(VC::BASE_CONTENT, '<div id="historyPage" class="h-100"></div>')
     ->response->setContent(template());
