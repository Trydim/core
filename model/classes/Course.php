<?php

class Course {
  const REFRESH_INTERVAL = 36000;
  const LINK_PARAM = '';
  const DEFAULT_CURRENCY = 'RUS'; // Определить валюту по умолчанию по домену

  /**
   * @var string[]
   */
  private $source = [
    'RUS' => "https://www.cbr.ru/scripts/XML_daily.asp",
    'BYN' => "https://www.nbrb.by/services/xmlexrates.aspx",
  ];

  private $db;
  private $xml;
  private $dataFile;
  private $sourceKey;


  /**
   * @var array
   */
  public $rate;

  /**
   * @param        $db
   * @param array  $refreshParam
   * @param string $dataFile
   */
  public function __construct(array $refreshParam, &$db,  string $dataFile = COURSE_CACHE) {
    $this->sourceKey = $refreshParam['serverRefresh'] ?: $this::DEFAULT_CURRENCY;

    if (is_object($db)) $this->getRateFromDb($db);
    else $this->getRateFromFile($dataFile);

    ($refreshParam['autoRefresh'] ?? true) && $this->refresh();
  }

  private function checkTableMoney() {
    // проверить есть ли в Таблице базовая валюта
  }

  /** Не нужна, наверное */
  private function getMainCurrency() {
    $res = array_filter($this->rate, function ($c) { return boolval($c['main']); });
    if (count($res)) return array_values($res)[0];

    return $this->rate[self::DEFAULT_CURRENCY] ?? array_values($this->rate)[0];
  }

  /**
   * @param string $code
   * @return array|false
   */
  private function searchRate(string $code) {
    foreach ($this->xml as $c) {
      if (strval($c->CharCode) === $code) {
        $scale = strval($c->Scale ? $c->Scale : $c->Nominal);
        $rate = strval($c->Value ? $c->Value : $c->Rate);
        return [
          'scale' => floatval(str_replace(",", ".", $scale)),
          'rate'  => round(floatval(str_replace(",", ".", $rate)), 4),
        ];
      }
    }
    return false;
  }

  private function notNeedRefresh(): bool {
    $time = time() - $this::REFRESH_INTERVAL;
    foreach ($this->rate as $currency) {
      if ($time > strtotime($currency['lastEditDate'])) return false;
    }
    return true;
  }

  private function getRateFromDb($db) {
    $this->db = $db;
    if (DEBUG) $this->checkTableMoney();
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

  private function readFromCbr(): void {
    //$mainCurrency = $this->getMainCurrency();
    //$linkSource = $this->source[$mainCurrency['code']] ?? false; Не правильно привязываться к главной валюте банк обновления.

    if (!$this->xml = simplexml_load_file($this->source[$this->sourceKey] . $this::LINK_PARAM)) return;

    foreach ($this->rate as $code => $currency) {
      /*if ($currency === $mainCurrency) {
        $this->rate[$code]['scale'] = 1;
        $this->rate[$code]['rate'] = 1;
        continue;
      }
      */

      $value = $this->searchRate($code);
      if ($value) {
        $this->rate[$code]['scale'] = $value['scale'];
        $this->rate[$code]['rate'] = $value['rate'];
      }
    }
  }

  public function refresh(): Course {
    if ($this->notNeedRefresh()) return $this;

    $this->readFromCbr();
    if (USE_DATABASE) $this->setRateToDb();
    else $this->setRateToFile();
    return $this;
  }

  public function getRate(): array {
    return array_map(function ($c) {
      return [
        'id' => $c['code'],
        'value' => $c['rate'] ?? 1,
      ];
    }, $this->rate);
  }
}
