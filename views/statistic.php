<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

$block = template('parts/authBlock');
// $field['pageHeader']  = <<<pageHeader
// pageHeader;

$field['content'] = <<<CONTENT
<div class="statistic" id="statistic" style="margin: 0 auto;min-height: 500px"></div>
CONTENT;

$field['footerContent'] = <<<footerContent
footerContent;
