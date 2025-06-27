<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$block = template('parts/authBlock');
// $field['pageHeader']  = <<<pageHeader
// pageHeader;

$field['content'] = <<<CONTENT
<div class="calendar" id="calendar"></div>
CONTENT;

$field['footerContent'] .= '<a id="publicPageLink" href="' . $main->url->getPath() . '" hidden></a>';
$gTxt = 'gTxt'; //функция перевода для вызова в Heredoc

$field['footerContent'] .= <<<footerContent

<template id="orderTemplate">
  <div>
    <span>Статус заказа: \${status}</span><br>
    <span>Создан: \${createDate}</span><br>
    <span>Посл изменения: \${lastEditDate}</span><br>
    <span>Менеджер: \${userName}</span><br>
    <span>Клиент: \${customerName}</span><br>
    <!--<span>\${importantValue}</span><br>-->
  </div>
</template>
<template id="orderBtnTemplate">
  <input type="button" class="btn btn-success" value="{$gTxt('Edit')}" data-action="openOrder">
</template>
footerContent;
