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
footerContent;
}
