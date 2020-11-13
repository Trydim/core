<?php

/**
 * @param $var
 * @param int $die
 */
function de($var, $die = 1) {
	echo '<pre>';
	var_dump($var);
	echo '</pre>';
	if($die) die();
}

/**
 * Check have error
 * @param $var
 *
 * @return bool - true if error no
 */
function checkError($var) {
	return !( (is_array($var) && count($var)) || (is_string($var) && mb_strlen($var)) );
}

/**
 *
 * @param $tmpFile
 *
 * @return string path to file name
 */
function checkTemplate($tmpFile) {
  if (file_exists(ABS_SITE_PATH . 'public/views/' . "$tmpFile.php")) {
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
 * @return mixed|string
 */
function getTargetPage($get) {
	return (isset($get['targetPage']) && $get['targetPage'] !== '') ? str_replace('/', '', $get['targetPage']) : 'home';
}

/**
 * get template from directory view
 * @param string $path whit out
 * @param array $vars
 *
 * @return string
 */
function template($path = 'base', $vars = []) {
	extract($vars);
	ob_start();
  if (file_exists(ABS_SITE_PATH . 'public/views/' . "$path.php")) {
    include(ABS_SITE_PATH . 'public/views/' . "$path.php");
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
	$input        = mb_strtolower($input, 'UTF-8');
	$shortest     = -1;
	$gc           = false;
	$nearest_word = null;
	$limit        = getLimitLevenshtein($input); // Порог прохождения
	foreach ($cell as $key => $item) {
		$word = trim(mb_strtolower(iconv($inCharset, 'UTF-8', $item), 'UTF-8'));
		$lev  = levenshtein($input, $word);
		if ($lev === 0) {
			$gc           = $key;
			$nearest_word = $word;
			break;
		}
		if ($lev < $limit && ($lev <= $shortest || $shortest < 0)) {
			$gc           = $key;
			$shortest     = $lev;
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
	$filename = str_replace('/', '//', 'csv/' . $filename);
  $result = [];

	if (($handle = fopen($filename, "r")) !== false) {
		if (($data = fgetcsv($handle, 1000, ";"))) {
			$keyIndex = [];

      $inCharset = 'UTF-8'; //mb_detect_encoding(, ['windows-1251', 'UTF-8'], true);

			foreach ($dict as $key => $word) {
				$bool = is_array($word);
				$keyWord = $bool ? $word[0] : $word;
				$i = findword($keyWord, $data, $inCharset);
				if ($i !== false) {
					if($bool) $keyIndex[$key] = [$i, $word[1]];
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
						} else $arr[$key] = trim(iconv($inCharset, 'UTF-8', $data[$item]));
					}
					return $arr;
				};

			}

			while (($data = fgetcsv($handle, 1000, ";")) !== false) {
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
		case 'int': case 'integer': return floor((integer) $value);
		case 'float': case 'double': return floatval(str_replace(',', '.', $value));
	}
	return $value;
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

  // TODO разобраться
  //putenv('LC_MESSAGES='.$locale);
  //setlocale(LC_MESSAGES, $locale);

  bindtextdomain($lang, './lang');
  textdomain( $lang );
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
