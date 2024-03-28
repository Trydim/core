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

  static function getXMLTemplate() {
    return <<<XML
<?xml version="1.0" encoding="UTF-8" ?>
<root></root>
XML;
  }

  static function setChown() {
    //exec ("find /path/to/folder -type f -exec chmod 0777 {} +"); - папки
    //exec ("find /path/to/folder -type d -exec chmod 0777 {} +"); - файлы
    //chown()
  }

  /**
   * @param string $csvPath
   */
  static function checkXml(string $csvPath) {
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
   * Поиск столбца ключей и описания
   * @param $csv
   * @return array
   */
  static function findKeyCell($csv) {
    $res = [];
    for ($i = 0; $i < 3; $i++) {
      foreach ($csv[$i] as $index => $cell) {
        if (preg_match('/(id)|(key)/i', $cell)) $res['index'] = $index;
        else if (preg_match('/(опис)|(desc)/ui', $cell)) $res['desc'] = $index;
      }
      if (count($res)) {
        $res['row'] = $i;
        break;
      }
    }
    return $res;
  }

  static function createXmlDefault($xmlFileName, $fileName) {
    $csv = loadCSV([], $fileName);

    if (count($csv) === 0) return ['error' => 'Csv table is empty!'];

    $xml = new SimpleXMLElement(self::getXMLTemplate());
    $param = [];

    $keyColumn = self::findKeyCell($csv);
    if (!$keyColumn) $xml->row = 'Конфигурация таблицы не доступна';
    $key  = $keyColumn['index'];
    $desc = $keyColumn['desc'] ?? false;

    foreach ($csv[$keyColumn['row']] as $c => $cell) $param[$c] = $cell;//str_replace(' ', '-', $cell);
    for (; $keyColumn['row'] > -1; $keyColumn['row']--) array_shift($csv);
    $csv = array_values(array_filter($csv, function ($item) use ($key) { return !empty($item[$key]); }));

    foreach ($csv as $r => $row) {
      $xml->addChild('rows');
      $xml->rows[$r]->addAttribute('id', $row[$key]);
      if ($desc) $xml->rows[$r]->addAttribute('description', $row[$desc]);
      $xml->rows[$r]->addChild('params');
      $params = &$xml->rows[$r]->params;

      foreach ($row as $c => $cell) {
        if ($c === $key || $c === $desc) continue;

        $params->addChild('param');
        $y = count($params->param) - 1;
        $params->param[$y]->addChild('key', $param[$c]);
        $params->param[$y]->addAttribute('type', 'string');
        //$params->param[$y]->addAttribute('currentValue', $cell); // Зачем?
      }
    }

    file_put_contents($xmlFileName, $xml->asXML());
    return [];
  }

  static function saveXml($dbTable, $data) {
    global $main;

    $xml = new SimpleXMLElement(self::getXMLTemplate());
    try {
      self::arrayToXml($data, $xml);
      $filePath = $main->getCmsParam(VC::CSV_PATH) . '../xml' . str_replace('csv', 'xml', $dbTable);
      file_put_contents($filePath, $xml->asXML());
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
