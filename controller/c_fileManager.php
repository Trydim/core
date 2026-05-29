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

$main->addControllerField(VC::BASE_PAGE_TITLE, 'Файловый менеджер')
     ->addAssets(['module/fileManager.css', 'module/fileManager.js'])
     ->addControllerField(VC::BASE_CONTENT, template('fileManager'))
     ->fireHook(VC::HOOKS_FILE_MANAGER_TEMPLATE, $main)
     ->response->setContent(template());
