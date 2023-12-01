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
 * @param string $importantValue - as json
 * @return false|string
 */
function addCpNumber($number, string $importantValue) {
  global $main;
  return $main->fireHook('addCpNumber', $number, $importantValue);
}

/**
 * alias for $main->addControllerField('cssLinks')
 *
 * @param string $cssLink - from index.php directory
 * @return Main|bool - false or Main object
 */
function addCssLink(string $cssLink) {
  global $main;

  if ($main instanceof Main) {
    $cssLink = $main->url->getUri() . ltrim($cssLink, '/');
    return $main->addControllerField(VC::BASE_CSS_LINKS, $cssLink);
  }

  return false;
}

/**
 * alias for $main->addControllerField('jsLinks')
 *
 * @param string $jsLink - from index.php directory
 * @param ?mixed $position [optional] <p>
 * before - if string - prepend to the beginning. if array - prepend elements to the beginning of an array<br>
 * after - if string - append to the end. if array - append elements to the end of an array<br>
 * @return Main|bool - false or Main object
 */
function addJsLink(string $jsLink, string $position = 'after') {
  global $main;

  if ($main instanceof Main) {
    $jsLink = $main->url->getUri() . ltrim($jsLink, '/');
    return $main->addControllerField(VC::BASE_JS_LINKS, $jsLink, $position);
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

if (!function_exists('de')) {
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
}

if (!function_exists('def')) {
  /**
   * @param $var
   * @param bool $die
   */
  function def($var, bool $die = true) {
    if (is_array($var) || is_object($var)) $var = json_encode($var);
    file_put_contents(ABS_SITE_PATH . 'shared/debug.json', $var);
    if ($die) die();
  }
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

function getPageAsString($data): string {
  $id = 'wrapCalcNode' . uniqid();
  $initJs = $data['initJs'];
  unset($data['initJs']);

  $html = "<div id='$id'><script>window.node = '#$id';";
  $html .= 'window.data = ' . json_encode($data) . '</script>';
  $html .= '<script>' . $initJs . '</script></div>';

  return $html;
}

/**
 * translate text
 * @param string $str
 * @return string
 */
function gTxt(string $str): string {
  global $main;
  static $txt;
  if (!$txt) {
    $txt = include ABS_SITE_PATH . 'lang/dictionary.php';

    if ($main->isDealer()) {
      $path = $main->url->getPath(true) . 'lang/dictionary.php';
      $dTxt = file_exists($path) ? include $path : [];
      $txt = array_replace($txt, $dTxt);
    }
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
  global $main;
  static $txt;
  if (!$txt) {
    $txt = include ABS_SITE_PATH . 'lang/dbDictionary.php';

    if ($main->isDealer()) {
      $path = $main->url->getPath(true) . 'lang/dbDictionary.php';
      $dTxt = file_exists($path) ? include $path : [];
      $txt = array_replace($txt, $dTxt);
    }
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
 * Find csv file
 * @param string $filename
 * @return string
 */
function findCsvFile(string $filename): string {
  global $main;

  // Direct path
  if (file_exists($filename)) return $filename;
  // Dealer path
  $path = $main->getCmsParam(VC::CSV_PATH) . $filename;
  if (file_exists($path)) return $path;
  // Main path
  $path = $main->getCmsParam(VC::CSV_PATH) . $filename;
  if (file_exists($path)) return $path;

  return '';
}

/**
 * Determines whether a string can be considered JSON or not.
 *
 * @param string $value value to determine json of.
 *
 * @return boolean
 */
function isJSON(string $value): bool {
  return (
    is_array(json_decode($value, true)) &&
    (json_last_error() == JSON_ERROR_NONE)
  );
}

/**
 * Load csv to array$_FILES['pictureHead']['error']
 *
 * @param array  $dict     - dictionary for search on the key. example: ['name' => 'Имя'].
 * @param string $filename - csv filename with path
 * @param bool   $oneRang  - if true that return one rang array
 *
 * @return array|bool
 */
function loadCSV(array $dict, string $filename, bool $oneRang = false) {
  global $main;
  $filename = file_exists($filename) ? $filename : $main->getCmsParam(VC::CSV_PATH) . $filename;
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
      if ($oneRang) {

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
    return 'File is not exist';
  }

  return $result;
}

/**
 * Поиск в первых пяти строках начала таблиц
 *
 * @param string $path
 * @return array|bool
 */
function loadFullCSV(string $path) {
  if ($path !== '' && ($handle = fopen($path, "rt")) !== false) {
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
  } else return 'File is not exist';

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
 * @param array $config - 'method', 'json' => true (as default) or any, 'json_assoc', 'auth', 'contentType'
 * @param string|array<string, string> $params - assoc array
 * @return string|array
 */
function httpRequest(string $url, array $config = [], $params = []) {
  $myCurl = curl_init();

  $curlConfig = [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [],
  ];

  if (isset($config['auth'])) {
    $curlConfig[CURLOPT_HTTPHEADER][] = 'Authorization:' . $config['auth'];
  }

  if (strtolower($config['method'] ?? 'get') === 'get') {
    $curlConfig[CURLOPT_HTTPGET] = true;
    $curlConfig[CURLOPT_URL] .= '?' . http_build_query($params);
  } else {
    $curlConfig[CURLOPT_HTTPGET] = false;
    $curlConfig[CURLOPT_POST] = true;
    $curlConfig[CURLOPT_HTTPHEADER][] = 'Content-Type: ' . ($config['contentType'] ?? 'application/json; charset=utf-8');
    $curlConfig[CURLOPT_POSTFIELDS]   = $params;
  }

  curl_setopt_array($myCurl, $curlConfig);
  $response = curl_exec($myCurl);

  if ($response === false) return curl_error($myCurl);

  curl_close($myCurl);

  if (($config['json'] ?? true) === true) {
    $res   = json_decode($response, $config['json_assoc'] ?? true);
    $error = json_last_error();
    return $error === 0 ? $res : 'Json error: ' . $response;
  }

  return $response;
}

/**---------------------------------------------------------------------------------------------------------------------
 * PHP8 polyfills
 *--------------------------------------------------------------------------------------------------------------------*/

if (!function_exists('str_starts_with')) {
  function str_starts_with(string $haystack, string $needle): bool {
    return strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}

if (!function_exists('trigger_deprecation')) {
  /**
   * Triggers a silenced deprecation notice.
   *
   * @param string $package The name of the Composer package that is triggering the deprecation
   * @param string $version The version of the package that introduced the deprecation
   * @param string $message The message of the deprecation
   * @param mixed  ...$args Values to insert in the message using printf() formatting
   *
   * @author Nicolas Grekas <p@tchwork.com>
   */
  function trigger_deprecation(string $package, string $version, string $message, ...$args): void
  {
    @trigger_error(($package || $version ? "Since $package $version: " : '').($args ? vsprintf($message, $args) : $message), E_USER_DEPRECATED);
  }
}

if (!function_exists('get_debug_type')) {
  function get_debug_type($value): string {
    switch (true) {
      case null === $value: return 'null';
      case is_bool($value): return 'bool';
      case is_string($value): return 'string';
      case is_array($value): return 'array';
      case is_int($value): return 'int';
      case is_float($value): return 'float';
      case is_object($value): break;
      case $value instanceof __PHP_Incomplete_Class: return '__PHP_Incomplete_Class';
      default:
        if (null === $type = @get_resource_type($value)) return 'unknown';

        if ($type === 'Unknown') $type = 'closed';

        return "resource ($type)";
    }

    $class = get_class($value);

    if (false === strpos($class, '@')) return $class;

    return (get_parent_class($class) ?: key(class_implements($class)) ?: 'class') . '@anonymous';
  }
}
