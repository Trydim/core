<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global
 * @var $param - from controller c_orders.php
 */

// $auth = template('parts/authBlock');
// $field['pageHeader'] = <<<pageHeader

// pageHeader;
$field['content'] = template('parts/ordersContent', $param);

$field['footerContent'] .= '<a id="publicPageLink" href="' . SITE_PATH . '" hidden></a>';
$field['footerContent'] .= <<<footerContent
<template id="changeStatus">
  <option value="\${ID}">\${name}</option>
</template>
<template id="tableImportantValue">
  <div>\${key} - \${value}</div>
</template>
<template id="sendMailTmp">
  <form class="content-center" action="#" id="authForm">
    <div class="input-group">
      <span class="input-group-text">Почта:</span>
      <input type="text" id="email" class="form-control" value="" name="email">
    </div>
  </form>
</template>
<template id="noFoundSearchMsg">
  <tr><td colspan="15">не найдено</td></tr>
</template>
<!--template id="orderOpenForm">
  <div>
    <div>Дата создания - \${create_date}</div>
    <div>Дата редактирования - \${last_edit_date}</div>
    <div>Закачик - \${customer}</div>
    <div>Менеджер - \${name}</div>
    <div>Статус - \${status}</div>
    <div>\${important_value}</div>
    <div>\${report_value}</div>
    <div>\${total}</div>
  </div>
</template-->
footerContent;

$field['footerContent'] .= template('docs/printTpl');
$field['footerContent'] .= $main->initDictionary();
