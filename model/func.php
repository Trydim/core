<?php

/**
 * @param string $class
 */
function cmsAutoloader(string $class) {
  $path = str_replace('\\', DIRECTORY_SEPARATOR, __DIR__ . '/classes/' . $class . '.php');
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
 *
 * @param string $cssLink
 * @return Main|bool - false or Main object
 */
function addCssLink(string $cssLink) {
  global $main;

  if ($main instanceof Main) {
    $cssLink = str_replace('//', '/', $main->url->getUri() . $cssLink);
    return $main->addControllerField('cssLinks', $cssLink);
  }

  return false;
}

/**
 * alias for $main->addControllerField('jsLinks')
 *
 * @param string $jsLink
 * @param mixed $position [optional] <p>
 * head - in head <p>
 * before - before all script, after cms libs<p>
 * last - before end body <p>
 * @return Main|bool - false or Main object
 */
function addJsLink(string $jsLink, string $position = 'last') {
  global $main;

  if ($main instanceof Main) {
    $jsLink = str_replace('//', '/', $main->url->getPath() . $jsLink);
    return $main->addControllerField('jsLinks', $jsLink, $position);
  }

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

function convertToArray($value): array {
  if (is_array($value)) return $value;
  if (is_string($value)) {
    return array_map(function ($item) { return trim($item); }, explode(',', $value));
  }
  return [];
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
 * @return bool
 */
function isSafari() {
  global $main;
  return $main->isSafari();
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
  $sep = DIRECTORY_SEPARATOR;
  $path = $path ?? ABS_SITE_PATH . SHARE_PATH;

  if (!is_dir($path)) return false;
  if (file_exists($path . $sep . $fileName)) return $path . $sep . $fileName;

  $arrDir = array_values(array_filter(scandir($path), function ($dir) use ($path, $sep) {
    return !($dir === '.' || $dir === '..' || is_file($path . $sep . $dir));
  }));

  $length = count($arrDir);
  for ($i = 0; $i < $length; $i++) {
    $result = findingFile($path . $sep . $arrDir[$i], $fileName);
    if ($result) return $result;
  }

  return false;
}

/**
 * Determines whether a string can be considered JSON or not.
 *
 * @param string $value value to determine json of.
 *
 * @return boolean
 */
function isJSON(string $value) {
  return (
    is_string($value) &&
    is_array(json_decode($value, true)) &&
    (json_last_error() == JSON_ERROR_NONE)
  );
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
function loadCSV($dict, $filename, $one_rang = false) {
  global $main;
  $filename = file_exists($filename) ? $filename : $main->getCmsParam('csvPath') . $filename;
  $result = [];

  if (!count($dict)) return loadFullCSV($filename);

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
function loadFullCSV($path) {

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
 * get template from directory view
 * @param string $path whit out
 * @param array  $vars
 *
 * @return string
 */
function template(string $path = 'base', array $vars = []): string {
  global $main;
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

/**
 * @param string $url
 * @param array $config - 'method', 'json', 'json_assoc'
 * @param array<string, string> $params - assoc array
 * @return string
 */
function httpRequest(string $url, array $config = [], array $params = []): string {
  $curlConfig = [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
  ];

  if (strtolower($config['method'] ?? 'get') === 'get') {
    $curlConfig[CURLOPT_HTTPGET] = true;
    $curlConfig[CURLOPT_URL] .= '?' . http_build_query($params);
  } else {
    $curlConfig[CURLOPT_PORT] = true;
    $curlConfig[CURLOPT_POSTFIELDS] = http_build_query($params);
  }

  $myCurl = curl_init();
  curl_setopt_array($myCurl, $curlConfig);
  $response = curl_exec($myCurl);
  curl_close($myCurl);

  if (($config['json'] ?? '') === 'json') {
    try {
      return json_decode($response, $config['json_assoc'] ?? true);
    } catch (Exception $e) {
      return die('Json error: ' . $e->getMessage());
    }
  }

  return $response;
}

function imageResize($resource, $width, $height, $saveRatio = false) {
  $rWidth = imagesx($resource);
  $rHeight = imagesy($resource);

  if ($saveRatio) {
    if ($width < $height) {
      $ratio = $width / $rWidth;
      $height = ceil($rHeight * $ratio);
    } else {
      $ratio = $height / $rHeight;
      $width = ceil($rWidth * $ratio);
    }
  }

  $destination = imagecreatetruecolor($width, $height);
  $backgroundColor = imagecolorallocate($destination, 255, 255, 255);
  imagefill($destination, 0, 0, $backgroundColor);
  imagefilledrectangle($destination, 0, 0, $width, $height, $backgroundColor);
  imagecopyresized($destination, $resource, 0, 0, 0, 0, $width, $height, $rWidth, $rHeight);
  return $destination;
}

function createImageFile($file, $ext = null) {
  switch ($ext ?? pathinfo($file, PATHINFO_EXTENSION)) {
    default:
    case 'jpg': case 'jpeg': case 'image/jpeg':
      return imagecreatefromjpeg($file);
    case 'png': case 'image/png':
      return imagecreatefrompng($file);
    case 'webp': case 'image/webp':
      return imagecreatefromwebp($file);
  }
}

/**---------------------------------------------------------------------------------------------------------------------
 * PHP8 polyfills
 *--------------------------------------------------------------------------------------------------------------------*/

if (!function_exists('str_starts_with')) {
  function str_starts_with(string $haystack, string $needle): bool {
    return strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}
