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
  return $main->fireHook(VC::HOOKS_SAVE_ORDER, $number, $importantValue);
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
    $cssLink = $main->url->getUri(true) . ltrim($cssLink, '/');
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
    $jsLink = $main->url->getUri(true) . ltrim($jsLink, '/');
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
function csvTypeConvert($type, $value) {
  switch ($type) {
    default: return $value;
    case 'int': case 'integer': return intval($value);
    case 'float': case 'double': return floatval(str_replace(',', '.', $value));
  }
}

function convertToArray($value): array {
  if (is_array($value)) return $value;
  if (is_string($value)) {
    return array_map(function ($item) { return trim($item); }, explode(',', $value));
  }
  return [];
}

if (!function_exists('compareFiles')) {
  /**
   * @param string $file1
   * @param string $file2
   * @return bool
   */
  function compareFiles(string $file1, string $file2): bool {
    return file_exists($file1) && file_exists($file2)
      && md5_file($file1) === md5_file($file2);
  }
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
    $txt = $main->getDictionary();
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
    $txt = $main->getDbDictionary();
  }

  return $txt[$db][$str] ?? $str;
}


/**
 * Find index of Levelshtein
 *
 * @param string $input - when search?
 * @param array  $row   - what search? arr of string
 * @param bool   $index - if true return word, default return index position
 * @param bool   $strict -
 *
 * @return integer or string - int: return index of position keyword in array
 */
function findWord(string $input, array $row, bool $index = false, bool $strict = false) {
  $gc = false;
  $shortest = -1;
  $nearestWord = null;

  $input = mb_strtolower($input, 'UTF-8');
  $limit = iconv_strlen($input);
  $limit = $limit <= 3 ? $limit : ceil($limit / 2); // Pass level Limit

  foreach ($row as $key => $cell) {
    $word = trim(mb_strtolower($cell, 'UTF-8'));
    $lev = levenshtein($input, $word);

    if ($lev === 0) {
      $gc = $key;
      $nearestWord = $word;
      break;
    }
    if (!$strict && $lev < $limit && ($lev <= $shortest || $shortest < 0)) {
      $gc = $key;
      $shortest = $lev;
      $nearestWord = $word;
    }
  }

  if ($index) return $nearestWord;

  return $gc;
}

/**
 * Find key
 *
 * @param string[] $cell - when searching?
 * @param array $input - what search? array of keys
 *
 * @return string|bool - keys or false
 */
function findKey(array $cell, array $input) {
  $count = count($input); // now forever 1
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

  if (file_exists($filename)) return $filename;                    // Direct path
  $path = $main->getCmsParam(VC::CSV_PATH) . $filename;      // Dealer path
  if (file_exists($path)) return $path;
  $path = $main->getCmsParam(VC::CSV_MAIN_PATH) . $filename; // Main path
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
 * @param bool   $strict   - strict checking of column names
 *
 * @return array|string
 */
function loadCSV(array $dict, string $filename, bool $oneRang = false, bool $strict = false) {
  $filename = findCsvFile($filename);
  $result = [];

  if (!count($dict)) return loadFullCSV($filename);

  if (strlen($filename) && ($handle = fopen($filename, "rt")) !== false) {
    if (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
      $keyIndex = [];

      foreach ($dict as $key => $word) {
        if (is_numeric($key)) $key = $word;

        $isArr = is_array($word);
        $i = findWord($isArr ? $word[0] : $word, $data, false, $strict);

        if ($i !== false) $keyIndex[$key] = $isArr ? [$i, $word[1]] : $i;
      }

      if ($oneRang) {
        $item = end($keyIndex);
        $addPos = function ($data) use ($item) { return $data[$item]; };
      } else {

        $addPos = function ($data) use ($keyIndex) {
          $arr = [];
          foreach ($keyIndex as $key => $item) {
            $arr[$key] = is_array($item)
              ? csvTypeConvert($item[1], trim($data[$item[0]]))
              : preg_replace('/^d_/', '', trim($data[$item]));
          }
          return $arr;
        };

      }

      while (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER)) !== false) {
        $result[] = $addPos($data);
      }
    }
    fclose($handle);
  }
  else return 'File is not exist';

  return $result;
}

/**
 * @param string $path
 * @return array
 */
function loadFullCSV(string $path): array {
  if ($path !== '' && ($handle = fopen($path, "rt")) !== false) {
    $result = [];

    while (($data = fgetcsv($handle, CSV_STRING_LENGTH, CSV_DELIMITER))) {
      $result[] = array_map(function ($cell) {
        return preg_replace('/^d_/', '', $cell);
      }, $data);
    }
    fclose($handle);
  } else $result['error'] = 'File is not exist';

  return $result;
}

/**
 * Remove folder recursive
 * @param string $dir
 * @return bool
 */
if (!function_exists('removeFolder')) {
  /**
   * @param string $dir
   * @return bool
   */
  function removeFolder(string $dir): bool {
    if (!is_dir($dir)) return false;

    $files = array_diff(scandir($dir), ['.', '..']);

    foreach ($files as $file) {
      if (is_dir("$dir/$file")) removeFolder("$dir/$file");
      else unlink("$dir/$file");
    }

    return rmdir($dir);
  }
}

/**
 * @param string $lang
 */
function setUserLocale(string $lang = 'ru_RU') {
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

  if (file_exists($path)) include $path; // Absolute path
  else if (file_exists(ABS_SITE_PATH . "public/views/$path")) include ABS_SITE_PATH . "public/views/$path"; // In root public
  else if (file_exists(CORE . "views/$path")) include CORE . "views/$path"; // In core
  else echo 'Template not found: ' . $path;

  return ob_get_clean();
}

/**
 * @param string $value
 * @return string
 */
function translit(string $value): string {
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
 * @param array $config - 'method', 'json' => true (as default) or any, 'json_assoc', 'login', 'password', 'contentType', 'timeout'
 * @param string|array<string, string> $params - assoc array
 * @return string|array
 */
function httpRequest(string $url, array $config = [], $params = []) {
  $myCurl = curl_init();

  $curlConfig = [
    CURLOPT_URL => $url,
    CURLOPT_SSL_VERIFYPEER => false, // Добавить: Определять есть ли ssl
    CURLOPT_SSL_VERIFYHOST => false, // Добавить: Определять есть ли ssl
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [],
    CURLOPT_TIMEOUT => $config['timeout'] ?? 45,
  ];

  if (isset($config['login']) && isset($config['password'])) {
    $curlConfig[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
    $curlConfig[CURLOPT_USERPWD]  = $config['login'] . ':' . $config['password'];
  }

  if (strtolower($config['method'] ?? 'get') === 'get') {
    $curlConfig[CURLOPT_HTTPGET] = true;
    $curlConfig[CURLOPT_URL] .= '?' . http_build_query($params);
  } else {
    $curlConfig[CURLOPT_HTTPGET] = false;
    $curlConfig[CURLOPT_POST] = true;
    $curlConfig[CURLOPT_HTTPHEADER][] = 'Content-Type: ' . ($config['contentType'] ?? 'application/json; charset=utf-8');
    $curlConfig[CURLOPT_HTTPHEADER][] = 'Content-Length: ' . strlen(is_string($params) ? $params : json_encode($params));
    $curlConfig[CURLOPT_POSTFIELDS]   = $params;
  }

  curl_setopt_array($myCurl, $curlConfig);
  $response = curl_exec($myCurl);

  if ($error = $response === false) {
    $response = [
      'code' => curl_getinfo($myCurl, CURLINFO_HTTP_CODE),
      'error' => curl_error($myCurl),
    ];
  }

  curl_close($myCurl);

  if ($error === false && ($config['json'] ?? true) === true) {
    $res = json_decode($response, $config['json_assoc'] ?? true);

    return json_last_error() === JSON_ERROR_NONE ? $res : 'Json error: ' . $response;
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
