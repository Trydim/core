<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
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

if (isset($result)) {
  $result = json_encode($result);
  $field['footerContent'] = "<input type='hidden' id='userSetting' value='$result'>";
}

if ($admin) {
  $field['footerContent'] .= <<<footerContent

footerContent;
}
