<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $pathTarget
 */

//Allowed extensions
/*$config = [
  'extensions_for_editor' => array('ab', 'txt', 'php', 'js', 'tpl', 'html', 'htm', 'css', 'text', 'json', 'lng', 'xml', 'ini', 'sql')
];*/

define('ROOT', SHARE_DIR);

function tree($path) {
  if (stream_resolve_include_path($path)) {

    $files = scandir($path);
    natcasesort($files);

    echo '<ul>';

    if (count($files) > 2) {

      foreach ($files as $file) {
        if (stream_resolve_include_path($path . $file) && $file != '.' && $file != '..') {
          if (filetype($path . $file) == 'dir') sub($file, $path); // if folder
          else if ($file) {
            $ext = strtolower(preg_replace('/^.*\./', '', $file));
            echo '<li class="ext-file ext-' . $ext . '">' . $file . '</li>';
          }
        }
      }

    }
    echo "</ul>";
  }
}

function sub($dir, $path) {
  echo '<li><div id="' . $dir . '" data-fo="' . $path . $dir . '/' . '" class="fo closed">' . $dir . '</div>';
  tree($path . $dir . '/');
  echo '</li>';
}

$field = [
	'pageTitle' => 'File manager',
];

$field['cssLinks'] = [CORE_CSS . 'libs/fm/fileManager.css', CORE_CSS . 'libs/fm/font-awesome.min.css'];

require $pathTarget;
$html = template('base', $field);
