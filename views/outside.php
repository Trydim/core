<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $vars extract param
 */
$inline = strtolower(OUTSIDE);

if(isset($global)) $content = $global;
else if (!isset($content)) $content = '';

$coreScript = CORE_SCRIPT;

$globalWindowJsValue = 'window.CL_OUTSIDE = "1"; window.SITE_PATH = "' . SITE_PATH . '";' .
                       ' window.MAIN_PHP_PATH = "' . SITE_PATH . 'index.php' . '";' .
                       ' window.PUBLIC_PAGE = "' . PUBLIC_PAGE . '";' .
                       ' window.PATH_IMG = "' . PATH_IMG . '";';

$inline && $globalWindowJsValue = "<script>$globalWindowJsValue</script>";

$cssLinksArr = $inline ? '' : [];
if(!isset($cssLinks)) $cssLinks = [];
array_map(function($item) use (&$cssLinksArr, $inline) {
  if ($inline) {
    $global = '';
    if (stripos($item, 'global') !== false) $global = 'data-global="true"';
    $href = $inline === 'i' ? 'href' : 'data-href';
    $cssLinksArr .= "<link rel=\"stylesheet\" $global $href=\"$item\">";
  }
  else $cssLinksArr[] = $item;
}, $cssLinks);

$jsLinksArr = [ $coreScript . 'src.js', $coreScript . 'main.js'];
if(!isset($jsLinks)) $jsLinks = [];
array_map(function($item) use (&$jsLinksArr) {
  $jsLinksArr[] = $item;
}, $jsLinks);

$inline && $jsLinksArr = array_reduce($jsLinksArr, function($r, $item) {
  $r .= '<script defer type="module" src="' . $item . '"></script>';
  return $r;
}, '');

if(!isset($footerContent)) $footerContent = '';

$result = [
  'content'             => $content,
  'globalWindowJsValue' => $globalWindowJsValue,
  'footerContent'       => $footerContent,
  'cssLinksArr'         => $cssLinksArr,
  'jsLinksArr'          => $jsLinksArr,
];

if ($inline === 's') {
  echo getPageAsString($result);
} else if ($inline === 'i') {
  echo $cssLinksArr . $globalWindowJsValue . $content . $footerContent . $jsLinksArr;
} else {
  echo json_encode($result);
  die();
}
