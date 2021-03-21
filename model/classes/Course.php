<?php

class Course {
  const REFRESH_INTERVAL = 36000;
  private $dataFile;
  private $source = "http://www.cbr.ru/scripts/XML_daily.asp";
  //private $source = "https://www.nbrb.by/services/xmlexrates.aspx";
  private $refreshTime;
  public  $curs;

  public function __construct($dataFile = PATH_CSV . 'exchange_rate.xml') {
    $this->dataFile = $dataFile;

    if (file_exists($dataFile)) {
      $data = unserialize(file_get_contents($dataFile));
      $this->refreshTime = $data['refresh_time'];
      $this->curs = $data['curs'];
    }
    return $this->refresh();
  }

  public function refresh() {
    if ((time() - $this::REFRESH_INTERVAL) < $this->refreshTime) return true;
    if (isset($this->cursNew['date']) && $this->cursNew['date'] >= $this->get_timestamp(date("d.m.y"))) return true;

    $data = $this->readFromCbr();
    if (is_array($data)) {
      $this->curs = $data;
      file_put_contents($this->dataFile,
        serialize(["refresh_time" => time(),
          'curs' => $data]));
    }
    return $this;
  }

  private function readFromCbr() {
    $param = '';
    //$param = "?date_req=" . date("d/m/Y");

    if (!$xml = simplexml_load_file($this->source . $param)) return false;
    $curs['date'] = self::get_timestamp($xml->attributes()->Date);
    foreach ($xml->Valute as $m) {
      if ($m->CharCode == "USD" || $m->CharCode == "EUR") {
        $value = (float) str_replace(",", ".", (string) $m->Value);
        $curs[ (string) $m->CharCode ] = round( $value, 4);
      }
      if (count($curs) === 3) break;
    }
    return $curs;
  }

  public static function get_timestamp($date) {
    list($d, $m, $y) = explode('.', $date);
    return mktime(0, 0, 0, $m, $d, $y);
  }
}
