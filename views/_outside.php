<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$isFetch = preg_match('/outside\.php/', $_SERVER['REQUEST_URI']) && isset($_GET['osd']);
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
  'SITE_PATH'     => $main->url->getPath(),
  'MAIN_PHP_PATH' => $main->url->getHost() . $main->url->getPath() . 'outside.php',
  'PUBLIC_PAGE'   => PUBLIC_PAGE,
  'URI_IMG'       => URI_IMG,
  'URI_SHARE'     => $main->url->getBaseUri() . $main->getCmsParam('SHARE_PATH'),
  'AUTH_STATUS'   => $main->checkStatus(),
  'IS_DEAL'       => $main->isDealer(),
  'DEAL_URI_IMG'  => $main->getCmsParam(VC::DEAL_URI_IMG),
  'DEAL_URI_SHARED' => $main->url->getUri(true) . $main->getCmsParam('SHARE_PATH'),
  'INIT_SETTING'  => $main->frontSettingInit,
]);

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

if ($isFetch) echo json_encode($result);
else echo getPageAsString($result);
