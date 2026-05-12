<?php

#[AllowDynamicProperties]
class Course {
  const COURSE_CACHE     = ABS_SITE_PATH . SHARE_PATH . 'courseCache.bin';
  const REFRESH_INTERVAL = 36000;
  const LINK_PARAM       = '';
  const DEFAULT_CURRENCY = 'RUS'; // Определить валюту по умолчанию по домену

  private array $source = [
    'RUS' => "https://www.cbr.ru/scripts/XML_daily.asp",
    'BYN' => "https://www.nbrb.by/services/xmlexrates.aspx",
  ];

  private DbProxy $db;

  private $xml;
  private string $dataFile;
  private mixed $sourceKey;
  public array $rate;

  public function __construct(array $refreshParam, &$db,  string $dataFile = '') {
    $dataFile = empty($dataFile) ? $this::COURSE_CACHE : $dataFile;
    $this->sourceKey = $refreshParam[VC::RATE_SERVER_REFRESH] ?: $this::DEFAULT_CURRENCY;

    if (is_object($db)) $this->getRateFromDb($db);
    else $this->getRateFromFile($dataFile);

    if ($refreshParam[VC::RATE_AUTO_REFRESH] ?? true) $this->refresh();
  }

  private function checkTableMoney(): void {
    // проверить есть ли в Таблице базовая валюта
  }

  /** Не нужна, наверное */
  private function getMainCurrency(): mixed {
    $res = array_filter($this->rate, function ($c) { return boolval($c['main']); });
    if (count($res)) return array_values($res)[0];

    return $this->rate[self::DEFAULT_CURRENCY] ?? array_values($this->rate)[0];
  }

  private function searchRate(string $code): false|array
  {
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

  private function getRateFromDb(DbProxy $db): void
  {
    $this->db = $db;
    if (DEBUG) $this->checkTableMoney();
    $this->rate = $db->getMoney();
  }

  private function getRateFromFile(string $dataFile): void
  {
    $this->dataFile = $dataFile;
    if (file_exists($dataFile)) {
      $data = unserialize(file_get_contents($dataFile));
      $this->refreshTime = $data['refresh_time'];
      $this->rate = $data['curs'];
    }
  }

  /**
   * @throws \RedBeanPHP\RedException\SQL
   */
  private function setRateToDb(): void
  {
    $this->db->setMoney($this->rate);
  }

  private function setRateToFile(): void
  {
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
      }*/

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
