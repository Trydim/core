<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var $param - from controller c_orders.php
 */

$field['content'] = template('parts/ordersContent', $param);

$field['footerContent'] .= '<a id="publicPageLink" href="' . $main->url->getPath() . '" hidden></a>';

$orderColumnsTableTmp = '';
foreach ($param['orderColumns'] as $column) {
  $orderColumnsTableTmp .= '
    <div class="input-group my-1 droppable">
      <div class="input-group-text dragItem"><i class="pi pi-list"></i></div>
      <label for="col' . $column . '" class="input-group-text flex-grow-1">' . gTxtDB('orders', $column) . ':</label>
      <div class="input-group-text">
        <input type="checkbox" id="col' . $column . '" class="form-check-input mt-0" value="true" name="' . $column . '">
      </div>
    </div>';
}

$field['footerContent'] .= <<<footerContent
<template id="changeStatus">
  <option value="\${ID}">\${name}</option>
</template>
<template id="tableHeaderCell">
  <th>
    <input type="button" class="btn btn-info btn-sm table-th" value="\${name}" data-column="\${dbName}">
  </th>
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
<template id="tableContactsValue">
  <div>\${key}: \${value}</div>
</template>
<!--template id="orderOpenForm">
  <div>
    <div>Дата создания - \${create_date}</div>
    <div>Дата редактирования - \${last_edit_date}</div>
    <div>Заказчик - \${customer}</div>
    <div>Менеджер - \${name}</div>
    <div>Статус - \${status}</div>
    <div>\${important_value}</div>
    <div>\${report_value}</div>
    <div>\${total}</div>
  </div>
</template-->
<template id="orderColumnsTableTmp">
  <form action="#" id="columnsSetting">$orderColumnsTableTmp</form>
</template>
footerContent;

$field['footerContent'] .= template('docs/printTpl');
$field['footerContent'] .= $main->initDictionary();
