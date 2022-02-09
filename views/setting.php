<?php  if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global object
 * @var $admin - from controller
 */


$field['content'] = template('parts/settingContent');

if ($main->getLogin('admin')) {
  $field['footerContent'] .= <<<footerContent
<template id="rateModalTmp">
  <table class="text-center table table-striped">
    <thead>
      <tr>
        <th>Код</th>
        <th>Имя</th>
        <th>Курс</th>
        <th>Основная</th>
        <th>Обозначение</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
</template>

<template id="orderStatus">
  <div class="input-group mb-3" data-field="orderStatusItem">
    <input class="input-group-text col-2" data-field="key" disabled>
    <input type="text" class="form-control" data-field="name">
  </div>
</template>
footerContent;
}
