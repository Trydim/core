<?php

/**
 * @param string $class
 */
function cmsAutoloader(string $class) {
  $path = __DIR__ . '/classes/' . $class . '.php';
  if (file_exists($path)) require_once $path;
}

/**
 *
 * @param $number
 * @param $reportVal
 * @return false|string
 */
function addCpNumber($number, $reportVal) {
  global $main;
  $reportVal = $main->fireHook('addCpNumber', $number, $reportVal);
  return gzcompress($reportVal, 9);
}

/**
 * alias for $main->addControllerField('cssLinks')
 * @param string $cssLink
 * @return mixed - false or Main object
 */
function addCssLink(string $cssLink) {
  global $main;
  if ($main instanceof Main) return $main->addControllerField('cssLinks', $cssLink);
  return false;
}

/**
 * alias for $main->addControllerField('jsLinks')
 * @param string $jsLink
 * @param mixed $position [optional] <p>
 * head - in head <p>
 * before - before all script, after cms libs<p>
 * last - before end body <p>
 * @return mixed - false or Main object
 */
function addJsLink(string $jsLink, string $position = 'last') {
  global $main;
  if ($main instanceof Main) return $main->addControllerField('jsLinks', $jsLink, $position);
  return false;
}

/**
 * Alias for $main->addHook();
 * @param $hookName - string
 * @param $callable - func
 */
function addHook($hookName, $callable) {
  global $main;
  if ($main instanceof Main) $main->addHook($hookName, $callable);
}

/**
 *
 * @param mixed $var
 * @return bool
 */
function boolValue($var): bool {
  if (is_bool($var)) return $var;
  if (is_string($var)) {
    return !(empty($var) || $var === '-' || $var === 'false');
  }
  if (is_numeric($var)) {
    return boolval($var);
  }
  return !empty($var);
}

/**
 * Check if there is an error
 * Deep search for all error messages and return as an array
 * @param array $result
 */
function checkError(array &$result): void {
  $error = [];
  if (!empty($result['error'])) {
    if (is_array($result['error'])) {
      array_walk_recursive($result['error'], function ($v, $k) use (&$error) {
        if (empty($v)) return;
        $error[] = [$k => $v];
      });
    } else $error = true;
  }

  if ($result['status'] = empty($error)) unset($result['error']);
  else $result['error'] = $error;
}

/**
 * Check exist template file in views directory
 * @param string $tmpFile
 *
 * @return string path to file name
 */
function checkTemplate(string $tmpFile): string {
  $view = CORE . 'views/';

  if ($tmpFile === '' && PUBLIC_PAGE
      && file_exists(ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php')) {
    return ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . '.php';
  } else if (file_exists(ABS_SITE_PATH . 'public/views/' . "$tmpFile.php")) {
    return ABS_SITE_PATH . 'public/views/' . "$tmpFile.php";
  } else if (file_exists($view . "$tmpFile.php")) {
    return $view . "$tmpFile.php";
  } else if (file_exists($view . $tmpFile . "/$tmpFile.php")) {
    return $view . $tmpFile . "/$tmpFile.php";
  } else {
    require $view . '404.php'; die();
  }
}

/**
 * for param by load csv
 * @param $type
 * @param $value
 * @return false|float
 */
function convert($type, $value) {
  switch ($type) {
    case 'int':
    case 'integer':
      return floor((integer)$value);
    case 'float':
    case 'double':
      return floatval(str_replace(',', '.', $value));
  }
  return $value;
}

function convertToArray($value) {
  if (is_array($value)) return $value;
  if (is_string($value)) {
    return array_map(function ($item) { return trim($item); }, explode(',', $value));
  }
}

/**
 * @param string $file1
 * @param string $file2
 * @return bool
 */
function compareFiles(string $file1, string $file2): bool {
  return file_exists($file1) && file_exists($file2)
         && md5_file($file1) === md5_file($file2);
}

/**
 * @param $var
 * @param bool $die
 */
function de($var, bool $die = true) {
  echo '<pre>';
  var_dump($var);
  echo '</pre>';
  if ($die) die();
}

/**
 * @param string[]|string $hayStack
 * @param string $search
 * @return bool
 */
function includes($hayStack, string $search): bool {
  if (is_array($hayStack)) {
    foreach ($hayStack as $item) {
      if (includes($item, $search)) return true;
    }
  } else {
    return stripos($hayStack, $search) !== false;
  }
  return false;
}

/**
 * @param $word
 *
 * @return false|float|int
 */
function getLimitLevenshtein($word) {
  if (iconv_strlen($word) <= 3) {
    return iconv_strlen($word);
  }

  return ceil(iconv_strlen($word) / 2);
}

function getPageAsString($data) {
  $id = 'wrapCalcNode' . uniqid();
  $initJs = $data['initJs'];
  unset($data['initJs']);

  $html = "<div id='$id'><script>window.node = '#$id';";
  $html .= 'window.data = ' . json_encode($data) . '</script>';
  $html .= '<script>' . $initJs . '</script></div>';

  return $html;
}

/**
 * @param string $targetPage
 * @return array|string|string[]
 */
function getTargetPage($targetPage = '') {
  $target = str_replace('/', '', $targetPage);
  if (PUBLIC_PAGE) {
    if ($target === 'public') return '';
    if ($target === PUBLIC_PAGE) reDirect();
  }
  return $target;
}

/**
 * Get setting from file
 *
 * @param bool $decode
 * @param bool $assoc
 * @return mixed - array or object
 */
function getSettingFile(bool $decode = true, bool $assoc = true) {
  if (file_exists(SETTINGS_PATH)) {
    $setting = file_get_contents(SETTINGS_PATH);
    return $decode ? json_decode($setting, $assoc) : $setting;
  }
  return $decode ? json_decode('[]', $assoc) : '[]';
}

/**
 * translate text
 * @param string $str
 * @return string
 */
function gTxt(string $str): string {
  static $txt;
  if (!$txt) {
    $txt = include ABS_SITE_PATH . 'lang/dictionary.php';
  }
  return $txt[$str] ?? $str;
}

/**
 * translate dataBase text
 * @param string $db
 * @param string $str
 * @return string
 */
function gTxtDB(string $db, string $str): string {
  static $txt;
  if (!$txt) {
    $txt = include ABS_SITE_PATH . 'lang/dbDictionary.php';
  }
  return $txt[$db][$str] ?? $str;
}

/**
 * Find index of Levelshtein
 *
 * @param string - when search?
 * @param array - what search? arr of string
 * @param string - in charset in csv (autodetect)
 * @param bool - if true return word, default return index position
 *
 * @return integer or string - int: return index of position keyword in array
 */
function findWord($input, $cell, $inCharset = 'windows-1251', $index = false) {
  $input = mb_strtolower($input, 'UTF-8');
  $shortest = -1;
  $gc = false;
  $nearest_word = null;
  $limit = getLimitLevenshtein($input); // Порог прохождения
  foreach ($cell as $key => $item) {
    $word = trim(mb_strtolower(iconv($inCharset, 'UTF-8', $item), 'UTF-8'));
    $lev = levenshtein($input, $word);
    if ($lev === 0) {
      $gc = $key;
      $nearest_word = $word;
      break;
    }
    if ($lev < $limit && ($lev <= $shortest || $shortest < 0)) {
      $gc = $key;
      $shortest = $lev;
      $nearest_word = $word;
    }
  }
  if ($index) {
    return $nearest_word;
  }

  return $gc;
}

/**
 * Find key
 *
 * @param string - when search?
 * @param array - what search? array of keys
 *
 * @return string - keys or false
 */
function findKey($cell, $input) {
  $count = count($input); // теперь всегда 1
  $input = '/(' . implode('|', $input) . ')/i';
  foreach ($cell as $key => $item) {
    if (preg_match_all($input, $key) === $count) {
      return $key;
    }
  }

  return false;
}

/**
 * @param $path {string} - path without slash on the end
 * @param $fileName {string} - only file name without slash
 * @return false|string
 */
function findingFile($path, $fileName) {
  $path = $path ?? ABS_SITE_PATH . SHARE_PATH;
  if (!file_exists($path)) return false;
  if (file_exists($path . '/' . $fileName)) return $path . '/' . $fileName;

  $arrDir = array_values(array_filter(scandir($path), function ($dir) use ($path) {
    return !($dir === '.' || $dir === '..' || is_file($path . '/' . $dir));
  }));

  $length = count($arrDir);
  for ($i = 0; $i < $length; $i++) {
    $result = findingFile($path . '/' . $arrDir[$i], $fileName);
    if ($result) return $result;
  }

  return false;
}

/**
 * Load csv to array$_FILES['pictureHead']['error']
 *
 * @param array - dictionary for search on the key. example: ['name' => 'Имя'].
 * @param string - csv filename with path
 * @param bool - if true that return one rang array
 *
 * @return mixed array or bool
 */
function loadCVS($dict, $filename, $one_rang = false) {
  global $main;
  $filename = file_exists($filename) ? $filename : $main->getCmsParam('PATH_CSV') . $filename;
  $result = [];

  if (!count($dict)) return loadFullCVS($filename);

  if (file_exists($filename) && ($handle = fopen($filename, "rt")) !== false) {
    if (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
      $keyIndex = [];

      $inCharset = 'UTF-8'; //mb_detect_encoding(, ['windows-1251', 'UTF-8'], true);

      foreach ($dict as $key => $word) {
        $bool = is_array($word);
        $keyWord = $bool ? $word[0] : $word;
        $i = findWord($keyWord, $data, $inCharset);
        if ($i !== false) {
          if ($bool) $keyIndex[$key] = [$i, $word[1]];
          else $keyIndex[$key] = $i;
        }
      }
      if ($one_rang) {

        foreach ($keyIndex as $item) {
          $addpos = function ($data) use ($item) { return $data[$item]; };
        }

      } else {

        $addpos = function ($data) use ($keyIndex, $inCharset) {
          $arr = [];
          foreach ($keyIndex as $key => $item) {
            if (is_array($item)) {
              $arr[$key] = trim(iconv($inCharset, 'UTF-8', $data[$item[0]]));
              $arr[$key] = convert($item[1], $arr[$key]);
            } else {
              $value = trim(iconv($inCharset, 'UTF-8', $data[$item]));
              $arr[$key] = preg_replace('/^d_/', '', $value);
            }
          }
          return $arr;
        };

      }

      while (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER)) !== false) {
        $result[] = $addpos($data);
      }
    }
    fclose($handle);
  } else {
    return false; //файла нет
  }

  return $result;
}

/**
 * Поиск в первых пяти строках начала таблиц
 *
 * @param $path
 * @return array|bool
 */
function loadFullCVS($path) {

  if (file_exists($path) && ($handle = fopen($path, "rt")) !== false) {
    $result = [];
    $emptyRow = 0;
    while ($emptyRow < 5) { // Пять пустрых строк характеристик считаем что больше нету
      if (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
        if (!mb_strlen(implode('', $data))) {
          $emptyRow++;
          continue;
        }
        if ($emptyRow > 0) $emptyRow = 0;

        $result[] = array_map(function ($cell) { return preg_replace('/^d_/', '', $cell);}, $data);
      } else $emptyRow++;
    }
    fclose($handle);
  } else return false;

  return $result;
}

/**
 * @param string $lang
 */
function setUserLocale($lang = 'ru_RU') {

  /*switch ($lang) {
    case 'ru_RU':
      putenv('LANG=ru_RU.UTF8');
      putenv('LANGUAGE=ru_RU.UTF8');
      setlocale (LC_ALL, $lang . '.UTF8');
      break;
    default:
      putenv('LC_ALL=' . $lang);
      putenv('LANG=' . $lang);
      putenv('LANGUAGE=' . $lang);
      setlocale (LC_ALL,"English", "en", "en_US.UTF8");
  }*/

  putenv('LANG=ru_RU.UTF8');
  putenv('LANGUAGE=ru_RU.UTF8');
  setlocale(LC_ALL, $lang . '.UTF8');

  //putenv('LC_MESSAGES='.$locale);
  //setlocale(LC_MESSAGES, $locale);

  bindtextdomain($lang, './lang');
  textdomain($lang);
}

/**
 * @param string $target
 */
function reDirect(string $target = '') {
  if ($target === '') {
    $target = $_SESSION['target'] ?? '';
    isset($_GET['orderId']) && $target .= '?orderId=' . $_GET['orderId'];
  }
  header('location: ' . SITE_PATH . $target); // Todo попробовать убрать
  die;
}

/**
 * get template from directory view
 * @param string $path whit out
 * @param array  $vars
 *
 * @return string
 */
function template(string $path = 'base', array $vars = []): string {
  $path .= '.php';
  extract($vars);
  ob_start();

  // Абсолютный путь файла
  if (file_exists($path)) {
    include $path;
  }
  // В корне сайта в public
  else if (file_exists(ABS_SITE_PATH . "public/views/$path")) {
    include ABS_SITE_PATH . "public/views/$path";
  }
  // в сms
  else if (file_exists(CORE . "views/$path")) {
    include CORE . "views/$path";
  } else echo 'Template not found: ' . $path;

  return ob_get_clean();
}

/**
 * @param $value {string}
 * @return string
 */
function translit($value): string {
  $converter = [
    'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
    'е' => 'e', 'ё' => 'e', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
    'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
    'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
    'у' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'c', 'ч' => 'ch',
    'ш' => 'sh', 'щ' => 'sch', 'ь' => '', 'ы' => 'y', 'ъ' => '',
    'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
  ];

  return strtr(mb_strtolower($value), $converter);
}
