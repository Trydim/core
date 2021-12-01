<?php

/**
 * @param $var
 * @param int $die
 */
function de($var, $die = 1) {
  echo '<pre>';
  var_dump($var);
  echo '</pre>';
  if ($die) die();
}

/**
 *
 * @param $number
 * @param $reportVal
 * @return false|string
 */
function addCpNumber($number, $reportVal) {
  $reportVal = doHook('addCpNumber', $number, $reportVal);
  return gzcompress($reportVal, 9);
}

/**
 * Check if there is an error
 * Deep search for all error messages and return as an array
 * @param array $result
 *
 * @return array - ['...', '...']
 */
function checkError(array $result): array {
  $error = [];
  $findError = function ($findError, $var) use (&$error) {
    if (is_array($var)) {
      if (isset($var['error'])) {
        if (empty($var['error'])) unset($var['error']);
        else $error[] = $var['error'];
      }

      foreach ($var as $item) {
        $findError($findError, $item);
      }
    }
  };

  $findError($findError, $result);
  return $error;
}

/**
 * @param $target
 * @return string
 */
function checkAccess($target): string {
  if (PUBLIC_PAGE && in_array($target, [PUBLIC_PAGE, 'public', ''])) return 'public';
  global $main;
  if (in_array($target, $main->getSideMenu())) return $target;
  if ($main->checkStatus('no') || $main->checkStatus('error')) return 'login';
  reDirect(false, $main->getSideMenu(true));
  die;
}

/**
 * @param $status - auth status
 * @param string $target
 */
function reDirect($status, string $target = '') {
  if (!$target) {
    if ($status) $target = HOME_PAGE;
    else {
      if (isset($_SESSION['target']) && $_SESSION['target']) $target = 'login';
      else $target = ONLY_LOGIN ? 'login' : 'public';
    }
  }
  //unset($_GET['targetPage']);
  if ($target === 'public' && isset($_GET['orderId'])) $target .= '?orderId=' . $_GET['orderId']; // TODO уточнить откуда такая загрузка
  header('location: ' . SITE_PATH . $target);
  die;
}

/**
 *
 * @param $tmpFile
 *
 * @return string path to file name
 */
function checkTemplate($tmpFile): string {
  if ($tmpFile === 'public' && PUBLIC_PAGE
      && file_exists(ABS_SITE_PATH . 'public/views/' . PUBLIC_PAGE . ".php")) {
    return ABS_SITE_PATH . 'public/views/' . "$tmpFile.php";
  } else if (file_exists(VIEW . "$tmpFile.php")) {
    return VIEW . "$tmpFile.php";
  } else if (file_exists(VIEW . $tmpFile . "/$tmpFile.php")) {
    return VIEW . $tmpFile . "/$tmpFile.php";
  } else {
    return VIEW . '404.php';
  }
}

/**
 * @param $get
 *
 * @return array|string|string[]
 */
function getTargetPage($get) {
  return isset($get['targetPage']) ? str_replace('/', '', $get['targetPage'])
    : (OUTSIDE ? 'public' : '');
}

/**
 * get template from directory view
 * @param string $path whit out
 * @param array $vars
 *
 * @return string
 */
function template(string $path = 'base', array $vars = []): string {
  extract($vars);
  ob_start();
  if (file_exists(ABS_SITE_PATH . 'public/views/' . "$path.php")) {
    include(ABS_SITE_PATH . 'public/views/' . "$path.php");
  } else if (file_exists(ABS_SITE_PATH . VIEW . "$path.php")) { // TODO два раза с нижним условием?
    include(ABS_SITE_PATH . VIEW . "$path.php");
  } else if (file_exists(VIEW . "$path.php")) {
    include(VIEW . "$path.php");
  }

  return ob_get_clean();
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
function findword($input, $cell, $inCharset = 'windows-1251', $index = false) {
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
function findkey($cell, $input) {
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
 * Load csv to array$_FILES['pictureHead']['error']
 *
 * @param array - dictionary for search on the key. example: ['name' => 'Имя'].
 * @param string - csv filename with path
 * @param bool - if true that return one rang array
 *
 * @return mixed array or bool
 */
function loadCVS($dict, $filename, $one_rang = false) {
  $filename = PATH_CSV . $filename;
  $result = [];

  if (!count($dict)) return loadFullCVS($filename);

  if (file_exists($filename) && ($handle = fopen($filename, "r")) !== false) {
    if (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
      $keyIndex = [];

      $inCharset = 'UTF-8'; //mb_detect_encoding(, ['windows-1251', 'UTF-8'], true);

      foreach ($dict as $key => $word) {
        $bool = is_array($word);
        $keyWord = $bool ? $word[0] : $word;
        $i = findword($keyWord, $data, $inCharset);
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

  if (file_exists($path) && ($handle = fopen($path, "r")) !== false) {
    $result = [];
    $emptyRow = 0;
    while ($emptyRow < 5) { // Пять пустрых строк характеристик считаем что больше нету
      if (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
        if (!mb_strlen(implode('', $data))) {
          $emptyRow++;
          continue;
        }
        if ($emptyRow > 0) $emptyRow = 0;

        $result[] = $data;
      } else $emptyRow++;
    }
    fclose($handle);
  } else return false;

  return $result;
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

  //$locale = ABS_SITE_PATH . SITE_PATH . "lang";

  putenv('LANG=ru_RU.UTF8');
  putenv('LANGUAGE=ru_RU.UTF8');
  setlocale(LC_ALL, $lang . '.UTF8');

  //putenv('LC_MESSAGES='.$locale);
  //setlocale(LC_MESSAGES, $locale);

  bindtextdomain($lang, './lang');
  textdomain($lang);
}

function gTxt($str) {
  static $txt;
  if (!$txt) {
    $mess = [];
    include ABS_SITE_PATH . 'lang/dictionary.php';
    $txt = $mess;
  }
  return isset($txt[$str]) ? $txt[$str] : $str;
}

function gTxtDB($db, $str) {
  static $txt;
  if (!$txt) {
    $mess = [];
    include ABS_SITE_PATH . 'lang/dbDictionary.php';
    $txt = $mess;
  }
  return isset($txt[$db][$str]) ? $txt[$db][$str] : $str;
}

/**
 * Alias for $main->addAction();
 * @param $hookName - string
 * @param $callable - func
 */
function addHook($hookName, $callable) {
  global $main;
  if ($main instanceof cms\Main) $main->addAction($hookName, $callable);
}

/**
 * Alias for $main->execAction();
 * @param $hookName - string
 * @param $args - array
 * @return mixed
 */
function doHook($hookName, ...$args) {
  global $main;
  if ($main instanceof cms\Main) return $main->execAction($hookName, ...$args);
  return false;
}

function getPageAsString($data, $wrapId = 'wrapCalcNode') {
  $html = "<div class=\"shadow-calc\" id=\"shadow-calc\"><shadow-calc></shadow-calc></div>";
  $html .= "<div id=\"$wrapId\" style='display:none;'>" . $data['cssLinksArr'];
  $html .= $data['globalWindowJsValue'];
  $html .= $data['content'];
  $html .= $data['jsLinksArr'];
  $html .= $data['footerContent'] . '</div>';

  return $html;
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

function setSettingFile($content) {
  is_array($content) && $content = json_encode($content);
  file_put_contents(SETTINGS_PATH, $content);
}

/**
 * @param $value {string}
 * @return string
 */
function translit($value) {
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

/**
 * @param $dir {string} - path without slash on the end
 * @param $fileName {string} - only file name without slash
 * @return false|string
 */
function findingFile($dir, $fileName) {
  $absolutePath = $_SERVER['DOCUMENT_ROOT'] . $dir;
  if (file_exists($absolutePath . '/' . $fileName)) return $dir . '/' . $fileName;

  $arrDir = array_values(array_filter(scandir($absolutePath), function ($dir) use ($absolutePath) {
    return !($dir === '.' || $dir === '..' || is_file($absolutePath . '/' . $dir));
  }));

  $length = count($arrDir);
  for ($i = 0; $i < $length; $i++) {
    $result = findingFile($dir . '/' . $arrDir[$i], $fileName);
    if ($result) return $result;
  }

  return false;
}
