<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $vars extract param
 */

global $main, $target;

$inline = strtolower(OUTSIDE);

$content = $global ?? $content ?? '';
$footerContent = $footerContent ?? '';

$cssLinksArr = $cssLinks ?? [];
$cssLinksRes = $inline ? '' : [];

$jsLinksArr = array_merge([CORE_JS . 'src.js', CORE_JS . 'main.js'], $jsLinks ?? []);
//$jsLinksRes = $inline ? '' : [];

$jsGlobalConst = json_encode([
  'DEBUG'         => DEBUG,
  'CL_OUTSIDE'    => true,
  'CSV_DEVELOP'   => $main->getCmsParam('CSV_DEVELOP') ?: false,
  'SITE_PATH'     => SITE_PATH,
  'MAIN_PHP_PATH' => SITE_PATH . 'index.php',
  'PUBLIC_PAGE'   => PUBLIC_PAGE,
  'URI_IMG'       => URI_IMG,
  'AUTH_STATUS'   => $main->checkStatus('ok'),
  'INIT_SETTING'  => $main->frontSettingInit,
]);

$globalWindowJsValue = '<script>window.CMS_CONST = ' . $jsGlobalConst . '</script>';

array_map(function($item) use (&$cssLinksRes, $inline) {
  $global = stripos($item, 'global') !== false ? 'data-global="true"' : '';
  $href = $inline === 'i' ? 'href' : 'data-href';
  $cssLinksRes .= "<link rel=\"stylesheet\" $global $href=\"$item\">";
}, $cssLinksArr);

$result = [
  'initJs'        => file_get_contents(CORE . 'views/parts/outside.js'),
  'isShadow'      => $inline === 's',
  'jsGlobalConst' => $jsGlobalConst,
  'content'       => $content . $footerContent,
  'css'           => $cssLinksRes,
  'js'            => $jsLinksArr,
];

echo json_encode($result);

/*if ($inline === 's') {
  echo getPageAsString($result);
} else if ($inline === 'i') {
  echo implode('', $result);
} else {
  echo json_encode($result);
}*/
die();
