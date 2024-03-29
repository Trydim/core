<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

//Allowed extensions
/*$config = [
  'extensions_for_editor' => array('ab', 'txt', 'php', 'js', 'tpl', 'html', 'htm', 'css', 'text', 'json', 'lng', 'xml', 'ini', 'sql')
];*/

function tree($path) {
  if (stream_resolve_include_path($path)) {

    $files = scandir($path);
    array_shift($files);
    array_shift($files);
    natcasesort($files);

    echo '<ul>';

    if (count($files)) {

      foreach ($files as $file) {
        if (stream_resolve_include_path($path . $file)) {
          if (filetype($path . $file) === 'dir') {
            echo '<li><div id="' . $file . '" data-fo="' . $path . $file . '/' . '" class="fo closed">' . $file . '</div>';
            tree($path . $file . '/');
            echo '</li>';
          }
        }
      }

      foreach ($files as $file) {
        if (stream_resolve_include_path($path . $file)) {
          if (filetype($path . $file) !== 'dir') {
            $ext = strtolower(preg_replace('/^.*\./', '', $file));
            echo '<li class="ext-file ext-' . $ext . '">' . $file . '</li>';
          }
        }
      }

    }
    echo "</ul>";
  }
}

$field = [
	'pageTitle' => 'File manager',
];

$field['cssLinks'] = [CORE_CSS . 'module/fileManager.css?ver=fda1c25660'];
$field['jsLinks'] = [CORE_JS . 'module/fileManager.js?ver=45223fc11b'];

$main->setControllerField($field)->fireHook(VC::HOOKS_FILE_MANAGER_TEMPLATE, $main);
ob_start();
include $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
