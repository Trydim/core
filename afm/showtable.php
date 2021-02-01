<?php

if (stream_resolve_include_path('config.php')) {
  include_once('config.php');
} else {
  die ("Not found file: config.php");
}

if (stream_resolve_include_path('language/' . $config["language"] . '.lng')) {
  require_once 'language/' . $config["language"] . '.lng';
} else {
  require_once 'language/en.lng';
  echo 'Not found language/' . $config["language"] . '.lng';

}

if (isset($_POST['dir']) && !empty($_POST['dir'])) $_POST['dir'] = urldecode($_POST['dir']) . '/';

function formatBytes($size) {
  $sizes = array('b', 'kb', 'mb', 'gb', 'tb');
  $retstring = 0;
  if ($retstring === 0) {
    $retstring = '%01.2f %s';
  }
  $lastsizestring = end($sizes);
  foreach ($sizes as $sizestring) {
    if ($size < 1024) {
      break;
    }
    if ($sizestring != $lastsizestring) {
      $size /= 1024;
    }
  }
  if ($sizestring == $sizes[0]) {
    $retstring = '%01d %s';
  } // Bytes aren't normally fractional
  return sprintf($retstring, $size, $sizestring);
}

function foldersize($path) {
  if (!file_exists($path)) return 0;
  if (is_file($path)) return filesize($path);
  $ret = 0;
  foreach (glob($path . "/*") as $fn)
    $ret += foldersize($fn);
  return $ret;
}

function slashes($str) {
  $pos = strpos($str, "//");
  while ($pos != false) {
    $str = str_replace("//", "/", $str);
    $pos = strpos($str, "//");
  }
  return $str;
}


//open folder ....................................................


echo '<table id="ab-list-pages"><thead>
	<tr>
		<th>' . basename($_POST['dir']) . '/</th>
		<th>' . $lang["file_size"] . '</th>
		<th>' . $lang["action"] . '</th>		
	</tr>
	</thead>';

////////////////////////////////////////////////////////

if (stream_resolve_include_path($_POST['dir'])) {

  $files = scandir($_POST['dir']);


  natcasesort($files);

  if (count($files) > 2) {

    foreach ($files as $file) {

      if (stream_resolve_include_path($_POST['dir'] . $file) && $file != '.' && $file != '..' && filetype($_POST['dir'] . $file) == 'dir') {

        // if folder

        $foldersize = '<small>' . formatBytes(foldersize($_POST['dir'] . '/' . $file)) . '</small>';
        $folderpath = slashes($_POST['dir'] . '/' . $file . '/');


        echo '<tr class="lightgray"><td class="ab-tdfolder"><a href="' . $folderpath . '" class="closed">' . $file . '</a></td><td>' . $foldersize . '</td><td><a class="ab-btn red delete-directory" title="' . $lang['delete'] . '" href="' . $folderpath . '"><i class="fa fa-trash-o" aria-hidden="true"></i></a><button class="ab-btn blue renamefolder" title="' . $lang['rename'] . '"><i class=" fa fa-random" aria-hidden="true"></i></button><a class="ab-btn asphalt downloadfolder" title="' . $lang['zip_and_download'] . '"  href="downloadfolder.php?file=' . $folderpath . '"><i class="fa fa-download" aria-hidden="true"></i></a></td></tr>';

      }
    }

    foreach ($files as $file) {

      if (stream_resolve_include_path($_POST['dir'] . $file) && $file != '.' && $file != '..' && filetype($_POST['dir'] . $file) !== 'dir') {

        //if files

        $filepath = slashes($_POST['dir'] . '/' . $file);

        $protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') ||
                     $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";

        $current_url = $protocol . $_SERVER['SERVER_NAME'] . '/';

        $url = str_replace($_SERVER['DOCUMENT_ROOT'], $current_url, $filepath);

        $ext = strtolower(preg_replace('/^.*\./', '', $file));

        $size = '<small>' . formatBytes(filesize($filepath)) . '</small>';


        if (in_array($ext, array("jpg", "jpeg", "png", "gif", "ico", "bmp"))) {

//if image file

          echo '<tr class="white">
  <td class="ab-tdfile"><span class="ext-file ext-' . $ext . '">' . $file . '</span></td>
  <td>' . $size . '</td>
  <td><a href="' . $filepath . '" class="ab-btn red delete-file" title="' . $lang['delete'] . '"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
  <button class="ab-btn blue renamefile" title="' . $lang['rename'] . '"><i class=" fa fa-random" aria-hidden="true"></i></button>
  <a class="ab-btn asphalt downloadfile" title="' . $lang['download'] . '"  href="core/afm/downloadfile.php?file=' . $filepath . '"><i class="fa fa-download" aria-hidden="true"></i></a>
  <a class="ab-btn green zoom" href="' . $url . '" target="_blank"><i class="fa fa-eye" aria-hidden="true"></i></a></td>
  </tr>';

        } elseif (in_array($ext, $config['extensions_for_editor'])) {

//if edited file

          echo '<tr class="white"><td class="ab-tdfile"><span class="ext-file ext-' . $ext . '">' . $file . '</span></td><td>' . $size . '</td><td><a href="' . $filepath . '" class="ab-btn red delete-file" title="' . $lang['delete'] . '"><i class="fa fa-trash-o" aria-hidden="true"></i></a><button class="ab-btn blue renamefile" title="' . $lang['rename'] . '"><i class=" fa fa-random" aria-hidden="true"></i></button><a class="ab-btn asphalt downloadfile" title="' . $lang['download'] . '"  href="downloadfile.php?file=' . $filepath . '"><i class="fa fa-download" aria-hidden="true"></i></a><a class="ab-btn violet ab-edit-file" href="editor.php?editfile=' . $filepath . '" target="_blank" title="' . $lang['edit'] . '"><i class=" fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
        } else {

// if other file


          echo '<tr class="lightgray"><td class="ab-tdfile"><span class="ext-file ext-' . $ext . '">' . $file . '</span></td><td>' . $size . '</td><td><a href="' . $filepath . '" class="ab-btn red delete-file" title="' . $lang['delete'] . '"><i class="fa fa-trash-o" aria-hidden="true"></i></a><button class="ab-btn blue renamefile" title="' . $lang['rename'] . '"><i class=" fa fa-random" aria-hidden="true"></i></button><a class="ab-btn asphalt downloadfile" title="' . $lang['download'] . '"  href="downloadfile.php?file=' . $filepath . '"><i class="fa fa-download" aria-hidden="true"></i></a></td></tr>';

        }

      }

    }
  } else {
    echo '<tr class="lightgray"><td>---</td><td>---</td><td>---</td></tr>';
  }

} else {
  die('Not found - ' . $_POST['dir']);
}

//////////////////////////////////////////////////


echo '</table>';

?>
