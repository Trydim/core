<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $main - global object
 * @var $param - from controller
 * @var $admin - from controller
 */

/*$field['headContent']    = <<<headContent
headContent;
$field['pageHeader']    = <<<pageHeader
pageHeader;
$field['sideLeft']      = <<<sideLeft
sideLeft;*/

$field['content'] = template('parts/settingContent', $param);

if ($main->getSettings('admin')) {
  $field['footerContent'] .= <<<footerContent
<template id="customField">
  <div class="input-group mb-3" data-field="customFieldItem">
    <input type="text" class="form-control" data-field="key">
    <select class="form-select" data-field="type">
      <option value="string">Текст (~200 символов)</option>
      <option value="textarea">Текст (много)</option>
      <option value="number">Число</option>
      <option value="date">Дата</option>
    </select>
  </div>
</template>

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
footerContent;
}
