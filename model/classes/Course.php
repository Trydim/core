<?php

class Course {
  const REFRESH_INTERVAL = 36000;
  const LINK_PARAM = '';
  const DEFAULT_CURRENCY = 'RUS'; // Определить валюту по умолчанию по домену

  /**
   * @var string[]
   */
  private $source = [
    'RUS' => "http://www.cbr.ru/scripts/XML_daily.asp",
    'BYN' => "https://www.nbrb.by/services/xmlexrates.aspx",
  ];

  private $db;
  private $xml;
  private $dataFile;
  private $refreshTime;


  /**
   * @var array
   */
  public $rate;

  public function __construct(&$db, $dataFile = PATH_CSV . 'exchange_rate.bin') {
    if (is_object($db)) $this->getRateFromDb($db);
    else $this->getRateFromFile($dataFile);

    $this->refresh();
  }

  private function getMainCurrency() {
    $res = array_filter($this->rate, function ($c) { return boolval($c['main']); });
    return count($res) ? array_values($res)[0] : $this->rate[$this::DEFAULT_CURRENCY];
  }

  private function searchRate($code) {
    foreach ($this->xml as $c) {
      if (strval($c->CharCode) === $code) {
        return round((float) str_replace(",", ".", (string) $c->Value), 4);
      }
    }
    return false;
  }

  private function notNeedRefresh() {
    $time = time() - $this::REFRESH_INTERVAL;
    foreach ($this->rate as $currency) {
      if ($time > strtotime($currency['lastEditDate'])) return false;
    }
    return true;
  }

  private function getRateFromDb($db) {
    $this->db = $db;
    $this->rate = $db->getMoney();
  }

  private function getRateFromFile($dataFile) {
    $this->dataFile = $dataFile;
    if (file_exists($dataFile)) {
      $data = unserialize(file_get_contents($dataFile));
      $this->refreshTime = $data['refresh_time'];
      $this->rate = $data['curs'];
    }
  }

  private function setRateToDb() {
    $this->db->setMoney($this->rate);
  }

  private function setRateToFile() {
    file_put_contents($this->dataFile,
      serialize(["refresh_time" => time(), 'curs' => $this->rate]));
  }

  private function readFromCbr() {
    $mainCurrency = $this->getMainCurrency();

    $linkSource = $this->source[$mainCurrency['code']];

    if (!$this->xml = simplexml_load_file($linkSource . $this::LINK_PARAM)) return false;
    //$curs['date'] = strtotime($xml->attributes()->Date);

    foreach ($this->rate as $code => $currency) {
      if ($currency === $mainCurrency) continue;
      $value = $this->searchRate($code);
      if ($value) $this->rate[$code]['rate'] = $value;
    }
  }

  public function refresh() {
    if ($this->notNeedRefresh()) return $this;

    $this->readFromCbr();
    if (USE_DATABASE) $this->setRateToDb();
    else $this->setRateToFile();
    return $this;
  }

  public function getRate($fields = []) {
    return array_map(function ($c) {
      return [
        'id' => $c['code'],
        'value' => $c['rate']
      ];
    }, $this->rate);
  }
}
