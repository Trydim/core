<?php

class ArrayToXml {
  protected $document;
  protected $rootNode;

  protected $replaceSpacesByUnderScoresInKeyNames = true;

  protected $addXmlDeclaration = true;

  protected $numericTagNamePrefix = 'numeric_';

  protected $options = ['convertNullToXsiNil' => false, 'convertBoolToString' => false];

  public function __construct(
    array $array,
    $rootElement = '',
    bool $replaceSpacesByUnderScoresInKeyNames = true,
    $xmlEncoding = null,
    string $xmlVersion = '1.0',
    array $domProperties = [],
    $xmlStandalone = null,
    bool $addXmlDeclaration = true,
    $options = ['convertNullToXsiNil' => false, 'convertBoolToString' => false]
  ) {
    $this->document = new DOMDocument($xmlVersion, $xmlEncoding ?? '');

    if (!is_null($xmlStandalone)) {
      $this->document->xmlStandalone = $xmlStandalone;
    }

    if (!empty($domProperties)) {
      $this->setDomProperties($domProperties);
    }

    $this->addXmlDeclaration = $addXmlDeclaration;

    $this->options = array_merge($this->options, $options);

    $this->replaceSpacesByUnderScoresInKeyNames = $replaceSpacesByUnderScoresInKeyNames;

    if (!empty($array) && $this->isArrayAllKeySequential($array)) {
      throw new DOMException('Invalid Character Error');
    }

    $this->rootNode = $this->createRootElement($rootElement);

    $this->document->appendChild($this->rootNode);

    $this->convertElement($this->rootNode, $array);
  }

  public function setNumericTagNamePrefix(string $prefix): void {
    $this->numericTagNamePrefix = $prefix;
  }

  public static function convert(
    array $array,
    $rootElement = '',
    bool $replaceSpacesByUnderScoresInKeyNames = true,
    string $xmlEncoding = null,
    string $xmlVersion = '1.0',
    array $domProperties = [],
    bool $xmlStandalone = null,
    bool $addXmlDeclaration = true,
    array $options = ['convertNullToXsiNil' => false]
  ): string {
    $converter = new static(
      $array,
      $rootElement,
      $replaceSpacesByUnderScoresInKeyNames,
      $xmlEncoding,
      $xmlVersion,
      $domProperties,
      $xmlStandalone,
      $addXmlDeclaration,
      $options
    );

    return $converter->toXml();
  }

  public function toXml(): string {
    return $this->addXmlDeclaration
      ? $this->document->saveXML()
      : $this->document->saveXML($this->document->documentElement);
  }

  protected function ensureValidDomProperties(array $domProperties): void {
    foreach ($domProperties as $key => $value) {
      if (!property_exists($this->document, $key)) {
        throw new Exception("{$key} is not a valid property of DOMDocument");
      }
    }
  }

  public function setDomProperties(array $domProperties): self {
    $this->ensureValidDomProperties($domProperties);

    foreach ($domProperties as $key => $value) {
      $this->document->{$key} = $value;
    }

    return $this;
  }

  public function prettify(): self {
    $this->document->preserveWhiteSpace = false;
    $this->document->formatOutput = true;

    return $this;
  }

  public function dropXmlDeclaration(): self {
    $this->addXmlDeclaration = false;

    return $this;
  }

  public function addProcessingInstruction(string $target, string $data): self {
    $elements = $this->document->getElementsByTagName('*');

    $rootElement = $elements->count() > 0 ? $elements->item(0) : null;

    $processingInstruction = $this->document->createProcessingInstruction($target, $data);

    $this->document->insertBefore($processingInstruction, $rootElement);

    return $this;
  }

  protected function convertElement($element, $value) {
    if ($value instanceof Closure) {
      $value = $value();
    }

    $sequential = $this->isArrayAllKeySequential($value);

    if (!is_array($value)) {
      $value = htmlspecialchars($value ?? '');

      $value = $this->removeControlCharacters($value);

      $element->nodeValue = $value;

      return;
    }

    foreach ($value as $key => $data) {
      if (!$sequential) {
        if (($key === '_attributes') || ($key === '@attributes')) {
          $this->addAttributes($element, $data);
        } elseif ((($key === '_value') || ($key === '@value')) && is_string($data)) {
          $element->nodeValue = htmlspecialchars($data);
        } elseif ((($key === '_cdata') || ($key === '@cdata')) && is_string($data)) {
          $element->appendChild($this->document->createCDATASection($data));
        } elseif ((($key === '_mixed') || ($key === '@mixed')) && is_string($data)) {
          $fragment = $this->document->createDocumentFragment();
          $fragment->appendXML($data);
          $element->appendChild($fragment);
        } elseif ($key === '__numeric') {
          $this->addNumericNode($element, $data);
        } elseif (str_starts_with($key, '__custom:')) {
          $this->addNode($element, str_replace('\:', ':', preg_split('/(?<!\\\):/', $key)[1]), $data);
        } else {
          $this->addNode($element, $key, $data);
        }
      } elseif (is_array($data)) {
        $this->addCollectionNode($element, $data);
      } else {
        $this->addSequentialNode($element, $data);
      }
    }
  }

  protected function addNumericNode($element, $value): void {
    foreach ($value as $key => $item) {
      $this->convertElement($element, [$this->numericTagNamePrefix . $key => $item]);
    }
  }

  protected function addNode($element, string $key, $value): void {
    if ($this->replaceSpacesByUnderScoresInKeyNames) {
      $key = str_replace(' ', '_', $key);
    }

    $child = $this->document->createElement($key);

    $this->addNodeTypeAttribute($child, $value);

    $element->appendChild($child);

    $value = $this->convertNodeValue($value);

    $this->convertElement($child, $value);
  }

  protected function convertNodeValue($value) {
    if ($this->options['convertBoolToString'] && is_bool($value)) {
      $value = $value ? 'true' : 'false';
    }

    return $value;
  }

  protected function addNodeTypeAttribute($element, $value): void {
    if ($this->options['convertNullToXsiNil'] && is_null($value)) {
      if (!$this->rootNode->hasAttribute('xmlns:xsi')) {
        $this->rootNode->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
      }

      $element->setAttribute('xsi:nil', 'true');
    }
  }

  protected function addCollectionNode($element, $value): void {
    if ($element->childNodes->length === 0 && $element->attributes->length === 0) {
      $this->convertElement($element, $value);

      return;
    }

    $child = $this->document->createElement($element->tagName);
    $element->parentNode->appendChild($child);
    $this->convertElement($child, $value);
  }

  protected function addSequentialNode($element, $value): void {
    if (empty($element->nodeValue) && !is_numeric($element->nodeValue)) {
      $element->nodeValue = htmlspecialchars($value);

      return;
    }

    $child = $this->document->createElement($element->tagName);
    $child->nodeValue = htmlspecialchars($value);
    $element->parentNode->appendChild($child);
  }

  protected function isArrayAllKeySequential($value): bool {
    if (!is_array($value)) {
      return false;
    }

    if (count($value) <= 0) {
      return true;
    }

    if (key($value) === '__numeric') {
      return false;
    }

    return array_unique(array_map('is_int', array_keys($value))) === [true];
  }

  protected function addAttributes($element, array $data): void {
    foreach ($data as $attrKey => $attrVal) {
      $element->setAttribute($attrKey, $attrVal ?? '');
    }
  }

  protected function createRootElement($rootElement) {
    if (is_string($rootElement)) {
      $rootElementName = $rootElement ?: 'root';

      return $this->document->createElement($rootElementName);
    }

    $rootElementName = $rootElement['rootElementName'] ?? 'root';

    $element = $this->document->createElement($rootElementName);

    foreach ($rootElement as $key => $value) {
      if ($key !== '_attributes' && $key !== '@attributes') {
        continue;
      }

      $this->addAttributes($element, $rootElement[$key]);
    }

    return $element;
  }

  protected function removeControlCharacters(string $value): string {
    return preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
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
        $xRow->attributes()->id = $row[0/*$index*/];
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

    try {
      file_put_contents($xmlPath, ArrayToXml::convert($data));
    } catch (Exception $e) {
      return $e->getMessage();
    }
    return false;
  }
}
