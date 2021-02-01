<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $fmAction
 */

$config = [
  'extensions_for_editor' => array('ab', 'txt', 'php', 'js', 'tpl',
                                   'html', 'htm', 'css', 'text', 'json', 'lng', 'xml', 'ini', 'sql') //Allowed extensions
];

if (isset($fmAction)) {
  switch ($fmAction) {
    case 'showTable':
      if (isset($dir) && $dir) $dir = urldecode($dir) . '/';

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

      $html = '<table id="ab-list-pages"><thead>
                 <tr><th>' . basename($dir) . '/</th><th>Размер</th><th>Действие</th></tr>
               </thead>';

      if (stream_resolve_include_path($dir)) {
        $files = scandir($dir);
        natcasesort($files);

        if (count($files) > 2) {
          foreach ($files as $file) {
            if (stream_resolve_include_path($dir . $file) && $file != '.' && $file != '..' && filetype($dir . $file) == 'dir') {

              // if folder
              $foldersize = '<small>' . formatBytes(foldersize($dir . '/' . $file)) . '</small>';
              $folderpath = slashes($dir . '/' . $file . '/');

              $html .= '<tr class="lightgray">
                          <td class="ab-tdfolder"><a href="' . $folderpath . '" class="closed">' . $file . '</a></td>
                          <td>' . $foldersize . '</td>
                          <td><a class="ab-btn red delete-directory" title="Удалить папку" href="' . $folderpath . '"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
                          <button class="ab-btn blue renamefolder" title="Переименовать папку"><i class=" fa fa-random" aria-hidden="true"></i></button>
                          <a class="ab-btn asphalt downloadfolder" title="Скачать архивом"  href="downloadfolder.php?file=' . $folderpath . '"><i class="fa fa-download" aria-hidden="true"></i></a></td></tr>';

            }
          }

          foreach ($files as $file) {

            if (stream_resolve_include_path($dir . $file) && $file != '.' && $file != '..' && filetype($dir . $file) !== 'dir') {

              //if files

              $filepath = slashes($dir . '/' . $file);

              $protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') ||
                           $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";

              $current_url = $protocol . $_SERVER['SERVER_NAME'] . '/';

              $filepath = str_replace('\\', '/', $filepath); // исправить
              $filepath = str_replace('//', '/', $filepath); // исправить
              $url = str_replace($_SERVER['DOCUMENT_ROOT'], $current_url, $filepath);

              $ext = strtolower(preg_replace('/^.*\./', '', $file));

              $size = '<small>' . formatBytes(filesize($filepath)) . '</small>';

              $html .= '<tr class="white">
                          <td class="ab-tdfile"><span class="ext-file ext-' . $ext . '">' . $file . '</span></td>
                          <td>' . $size . '</td>
                          <td><a href="' . $filepath . '" class="ab-btn red delete-file" title="Удалить файл"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
                          <button class="ab-btn blue renamefile" title="Переименовать файл"><i class=" fa fa-random" aria-hidden="true"></i></button>
                          <a class="ab-btn asphalt downloadfile" title="Скачать файл"  href="downloadfile.php?file=' . $filepath . '"><i class="fa fa-download" aria-hidden="true"></i></a>';

              //if image file
              if (in_array($ext, array("jpg", "jpeg", "png", "gif", "ico", "bmp"))) {
                $html .= '<a class="ab-btn green zoom" href="' . $url . '" target="_blank"><i class="fa fa-eye" aria-hidden="true"></i></a>';

                //if edited file
              } elseif (in_array($ext, $config['extensions_for_editor'])) {
                $html .= '<a class="ab-btn violet ab-edit-file" href="editor.php?editfile=' . $filepath . '" target="_blank" title="Редактировать"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
              }

              $html .= '</td></tr>';
            }
          }
        } else {
          $html .= '<tr class="lightgray"><td>---</td><td>---</td><td>---</td></tr>';
        }

      } else {
        die('Not found - ' . $dir);
      }

      $html .= '</table>';
      break;
    case 'createFolder':
      if (isset($dir) && $dir) {
        mkdir($dir, 0777, true);
      }
      break;
  }
}

$result['html'] = isset($html) ? $html : '';
