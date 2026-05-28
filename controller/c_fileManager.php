<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

function tree($path): void
{
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
  VC::BASE_PAGE_TITLE => 'File manager',
];

$field[VC::BASE_CSS_LINKS] = [CORE_CSS . 'module/fileManager.css?ver=fda1c25660'];
$field[VC::BASE_JS_LINKS]  = [CORE_JS . 'module/fileManager.js?ver=45223fc11b'];

$main->setControllerField($field)->fireHook(VC::HOOKS_FILE_MANAGER_TEMPLATE, $main);
ob_start();
include $main->url->getRoutePath();
$field['content'] = ob_get_clean();
$main->response->setContent(template('base', $field));
