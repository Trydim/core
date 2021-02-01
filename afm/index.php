<?php

if (stream_resolve_include_path('config.php')) {
  $config = array(
    'rootdirectory' => 'core/afm/',    // site root directory
    'language'      => 'ru',                              // en, ru - file name + '.lng' in folder 'language'

    'extensions_for_editor' => array('ab', 'txt', 'php', 'js', 'tpl',
                                     'html', 'htm', 'css', 'text', 'json', 'lng', 'xml', 'ini', 'sql') //Allowed extensions

  );
} else {
  die ("Not found file: config.php");
}

if (stream_resolve_include_path('language/' . $config["language"] . '.lng')) {
  require_once 'language/' . $config["language"] . '.lng';
} else {
  require_once 'language/en.lng';
  echo 'Not found language/' . $config["language"] . '.lng';

}
define('ROOT', $config["rootdirectory"] . '/');

//............. tree .........................................
function tree($path) {
  if (stream_resolve_include_path($path)) {

    $files = scandir($path);

    natcasesort($files);

    $files2 = array();

    echo '<ul>';

    if (count($files) > 2) {


      foreach ($files as $file) {

        if (stream_resolve_include_path($path . $file) && $file != '.' && $file != '..') {


          if (filetype($path . $file) == 'dir') {
            // if folder
            sub($file, $path);
          } else {
            //if files
            $files2[$file] = $file;

          }
        }
      }
//	}
      foreach ($files2 as $file) {

        if ($file) {

          $ext = strtolower(preg_replace('/^.*\./', '', $file));
          echo '<li class="ext-file ext-' . $ext . '">' . $file . '</li>';
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
//................. end tree ...................................
