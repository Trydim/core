<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var array $param - from controller c_orders.php
 */

$main->addControllerField(VC::BASE_CONTENT, template('parts/ordersContent', $param));

$main->addControllerField(
  VC::BASE_FOOTER_CONTENT,
  '<a id="publicPageLink" href="' . $main->url->getPath() . '" hidden></a>'
);

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

ob_start(); ?>
<template id="changeStatus">
  <option value="${id}">${name}</option>
</template>
<template id="tableHeaderCell">
  <th>
    <input type="button" class="btn btn-info btn-sm table-th" value="${name}" data-column="${dbName}">
  </th>
</template>
<template id="sendMailTmp">
  <form class="content-center" action="#" id="authForm">
    <div class="input-group">
      <span class="input-group-text"><?= gTxt('E-Mail') ?>:</span>
      <input type="text" id="email" class="form-control" required name="email">
    </div>
  </form>
</template>
<template id="noFoundSearchMsg">
  <tr><td colspan="15">не найдено</td></tr>
</template>
<template id="tableContactsValue">
  <div>${key}: ${value}</div>
</template>
<template id="orderColumnsTableTmp">
  <form action="#" id="columnsSetting">$orderColumnsTableTmp</form>
</template>
<?php $main->addControllerField(VC::BASE_FOOTER_CONTENT, ob_get_clean());


$printTpl = template('docs/printTpl');
if (!includes($printTpl, 'not found')) {
  $main->addControllerField(VC::BASE_FOOTER_CONTENT, template('docs/printTpl'));
}

$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary());
