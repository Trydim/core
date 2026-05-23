<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$main->addControllerField(VC::BASE_PAGE_TITLE, 'История изменений')
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary())
     ->addControllerField(VC::BASE_CONTENT, '<div class="historyPage" id="h-100"></div>')
     ->response->setContent(template());
