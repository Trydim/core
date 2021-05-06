<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

$block = template('parts/authBlock');
// $field['pageHeader']  = <<<pageHeader
// pageHeader;

$field['content'] = <<<CONTENT
<div class="calendar" id="calendar"></div>
CONTENT;

$field['footerContent'] .= '<a id="publicPageLink" href="public" hidden></a>';
$field['footerContent'] .= <<<footerContent
<template id="orderTemplate">
	<div>
		<span>Статус заказа: \${S.name}</span><br>
		<span>Создан: \${create_date}</span><br>
		<span>Посл изменения: \${last_edit_date}</span><br>
		<span>Менеджер: \${name}</span><br>
		<span>Клиент: \${C.name}</span><br>
		<!--<span>\${important_value}</span><br>-->
	</div>
</template>
<template id="orderBtnTemplate">
  <input type="button" class="btn btn-success" value="Редактировать" data-action="openOrder">
</template>

footerContent;
