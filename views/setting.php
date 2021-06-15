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


isset($fileSetting) && $field['footerContent'] .= "<input type='hidden' id='userSetting' value='$fileSetting'>";
isset($permissions) && $field['footerContent'] .= "<input type='hidden' id='permissionSetting' value='$permissions'>";

if ($main->getSettings('admin')) {
  $field['footerContent'] .= <<<footerContent
<template id="customField">
  <div class="col-12 d-flex justify-content-between mt-1" data-field="customFieldItem">
    <div class="col-6">
      <input type="text" data-field="key">
    </div>
    <div class="col-6">
      <select class="w-100" data-field="type">
        <option value="string">Текст (~200 символов)</option>
        <option value="textarea">Текст (много)</option>
        <option value="number">Число</option>
        <option value="date">Дата</option>
      </select>
    </div>
  </div>
</template>
footerContent;
}
