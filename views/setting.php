<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $param - from controller
 */

/*$field['headContent']    = <<<headContent
headContent;
$field['pageHeader']    = <<<pageHeader
pageHeader;
$field['pageFooter']    = <<<pageFooter
pageFooter;
$field['sideLeft']      = <<<sideLeft
sideLeft;*/

$field['content'] = template('parts/settingContent', $param);

if (isset($result)) {
  $result = json_encode($result);
  $field['footerContent'] = "<input type='hidden' id='userSetting' value='$result'>";
}

