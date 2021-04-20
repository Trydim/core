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
  static $xml;

  static function getXMLTemplate(): string {
    return <<<XML
<?xml version="1.0" encoding="UTF-8" ?>
<root></root>
XML;
  }

  static function setChown() {
    //exec ("find /path/to/folder -type f -exec chmod 0777 {} +");  - папки
    //exec ("find /path/to/folder -type d -exec chmod 0777 {} +"); - файлы
    //chown()
  }

  static function checkXml($cvs) {
    $path = scandir(PATH_CSV);
    if ((count($path) - 2) / 2 === count($cvs)) return;

    foreach ($cvs as $file) {
      $file = pathinfo($file['fileName'], PATHINFO_FILENAME) . '.xml';
      if (!file_exists(PATH_CSV . $file)) {
        file_put_contents(PATH_CSV . $file, self::getXMLTemplate());
      }
    }
  }

  // Поиск столбца ключей и описания
  static function findKeyCell($csv): array {
    $res = [];
    for ($i = 0; $i < 3; $i++) {
      foreach ($csv[$i] as $index => $cell) {
        if (stripos($cell, 'key') !== false || stripos($cell, 'id') !== false) $res['index'] = $index;
        else if (mb_stripos($cell, 'описа') !== false || stripos($cell, 'desc') !== false) $res['desc'] = $index;
      }
      if (count($res)) {
        $res['row'] = $i;
        break;
      }
    }
    return $res;
  }

  static function createXmlDefault($fileName) {
    $csv = loadCVS([], $fileName . '.csv');
    if (count($csv)) {
      $xml = new SimpleXMLElement(self::getXMLTemplate());
      $param = [];

      $keyColumn = self::findKeyCell($csv);
      if (!$keyColumn) $xml->row = 'Конфигурация таблицы не доступна';
      $key = $keyColumn['index'];
      $desc = isset($keyColumn['desc']) ? $keyColumn['desc'] : false;

      foreach ($csv[$keyColumn['row']] as $c => $cell) $param[$c] = $cell;//str_replace(' ', '-', $cell);
      for (; $keyColumn['row'] > -1; $keyColumn['row']--) array_shift($csv);
      $csv = array_values(array_filter($csv, function ($item) use ($key) { return !empty($item[$key]); }));

      foreach ($csv as $r => $row) {
        $xml->addChild('row');
        $xml->row[$r]->addAttribute('id', $row[$key]);
        if ($desc) $xml->row[$r]->addChild('description', $row[$desc]);
        $xml->row[$r]->addChild('params');
        $params = &$xml->row[$r]->params;
        foreach ($row as $c => $cell) {
          if ($c === $key || $c === $desc) continue;
          $params->addChild('param');
          $y = count($params->param) - 1;
          $params->param[$y]->addAttribute('type', 'string');
          $params->param[$y]->addAttribute('currentValue', $cell);
          $params->param[$y]->addChild('key', $param[$c]);
        }
      }

      file_put_contents(PATH_CSV . $fileName . '.xml', $xml->asXML());
    }
  }

  static function saveXml($fileName, $data) {
    $xml = new SimpleXMLElement(self::getXMLTemplate());
    try {
      self::arrayToXml($data, $xml);
      file_put_contents(PATH_CSV . $fileName . '.xml', $xml->asXML());
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

  static function arrayToXml($data, &$xml) {
    foreach ($data as $key => $value) {
      if (is_array($value)) {

        if ($key === '@attributes'/*|| $key === '@value' || $key === '@cdata'*/) {
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
