<?php

class Array2XML {
  /**
   * Check if the tag name or attribute name contains illegal characters
   * Ref: http://www.w3.org/TR/xml/#sec-common-syn.
   *
   * @param string $tag
   *
   * @return bool
   */
  private static function isValidTagName($tag) {
    $pattern = '/^[a-z_]+[a-z0-9\:\-\.\_]*[^:]*$/i';

    return preg_match($pattern, $tag, $matches) && $matches[0] == $tag;
  }
}

class Xml {
  //private static $main;

  static $xml;

  static function getXMLTemplate(): string {
    return '<?xml version="1.0" encoding="UTF-8" ?><root></root>';
  }

  static function setChown() {
    //exec ("find /path/to/folder -type f -exec chmod 0777 {} +"); - папки
    //exec ("find /path/to/folder -type d -exec chmod 0777 {} +"); - файлы
    //chown()
  }

  /**
   * @param string $csvPath
   */
  static function createStartXml(string $csvPath) {
    $rootDir = ABS_SITE_PATH . SHARE_PATH;
    $xmlDir  = $rootDir . 'xml/';
    $xmlPath = str_replace('.csv', '.xml', $csvPath);

    $link = $rootDir;
    foreach (explode('/', dirname('xml/' . $csvPath)) as $dir) {
      $link .= $dir . '/';
      if (!file_exists($link)) mkdir($link);
    }

    if (!file_exists($xmlDir . $xmlPath)) file_put_contents($xmlDir . $xmlPath, self::getXMLTemplate());
  }

  /**
   * Поиск столбца ключей
   * @param array $csv
   * @return int
   */
  static function findKeyCell($csv) {
    foreach ($csv[0] as $index => $cell) {
      if (preg_match('/(id)|(key)/i', $cell)) return $index;
    }

    return 0;
  }

  static function updateXmlDefault(string $xmlPath, string $csvPath) {
    $csv = loadCSV([], $csvPath);
    if (count($csv) === 0) return ['error' => 'Csv table is empty!'];

    $xml = new SimpleXMLElement(file_get_contents($xmlPath));
    $currentXml = $xml->asXML();
    // Check rows, columns count
    //$rowsCount    = count($csv);
    //$columnsCount = count($csv[0]);
    /*if ((int) $xml->attributes()->rows === $rowsCount
      && (int) $xml->attributes()->columns === $columnsCount) {
      return $xml;
    }

    $xml->addAttribute('rows', $rowsCount);
    $xml->addAttribute('columns', $columnsCount);
    */

    $param = [];
    foreach ($csv[0] as $c => $cell) $param[$c] = $cell;

    $csv = array_values(array_filter($csv, function ($item) { return !empty(implode('', $item)); }));

    foreach ($csv as $r => $row) {
      // В нулевой строке общие параметры
      //if ($r === 0 && !isset())

      //
      if (!isset($xml->children()->rows) || !isset($xml->children()->rows[$r])) {
        $xml->addChild('rows');
        //$xml->rows[$r]->addAttribute('index', $r);
      }

      $xRow = &$xml->rows[$r];

      // Если ид не совпадает значит новая строка
      // Искать такой ид в других строках (кроме первой)
      // переместить все параметры
      // Если новая строка, раздать параметры из шапки по умолчанию а не строки.
      if ((string) $xRow->attributes()->id !== $row[0/*$index*/]) {
        $xml->rows[$r]->addAttribute('id', $row[0/*$index*/]);
      }

      if (!isset($xRow->children()->params)) $xRow->addChild('params');
      $xParams = &$xRow->params;

      foreach ($row as $c => $cell) {
        if (!isset($xParams->children()->param)) $xParams->addChild('param');
        $xParam = &$xParams->param[$c];

        if (!isset($xParam->attributes()->key) || (string) $xParam->attributes()->key !== $param[$c]) $xParam->addAttribute('key', $param[$c]);
        // Для всех строк "по умолчанию" наследование от шапки
        if (!isset($xParam->attributes()->type)) $xParam->addAttribute('type', $r === 0 ? 'string' : 'inherit');
      }

      // Удалить лишние параметры/колонки

    }

    // Если нет измений не сохранять
    if ($currentXml !== $xml->asXML()) file_put_contents($xmlPath, $xml->asXML());
    return $xml;
  }

  static function syncXmlFile(string $csvPath) {
    $xmlPath = ABS_SITE_PATH . SHARE_PATH . 'xml' . str_replace('.csv', '.xml', $csvPath);

    // Check file
    if (!file_exists($xmlPath)) self::createStartXml(substr($csvPath, 1));

    return self::updateXmlDefault($xmlPath, $csvPath);
  }

  static function saveXml(string $csvPath, array $data) {
    $xmlPath = ABS_SITE_PATH . SHARE_PATH . 'xml' . str_replace('.csv', '.xml', $csvPath);

    $xml = new SimpleXMLElement(self::getXMLTemplate());
    try {
      self::arrayToXml($data, $xml);
      file_put_contents($xmlPath, $xml->asXML());
    } catch (Exception $e) {
      return $e->getMessage();
    }
    return false;
  }

  /**
   * Get string representation of boolean value.
   *
   * @param mixed $v
   *
   * @return string
   */
  static function bool2str($v) {
    $v = $v === true ? 'true' : $v;
    $v = $v === false ? 'false' : $v;
    return $v;
  }

  static function arrayToXml($data, $xml) {
    foreach ($data as $key => $value) {
      if (is_array($value)) {
        if ($key === '@attributes') {
          foreach ($value as $attrKey => $attrValue) {
            $xml->addAttribute($attrKey, self::bool2str($attrValue));
          }
          continue;
        }

        if (is_numeric($key)) $key = 'i' . $key;

        $subNode = $xml->addChild($key);
        self::arrayToXml($value, $subNode);
      } else {
        $xml->addChild("$key", htmlspecialchars("$value"));
      }
    }
  }
}
