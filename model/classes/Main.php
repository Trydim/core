<?php

require __DIR__ . '/traits/MainTraits.php';

final class Main {
  use Authorization;
  use Dictionary;
  use Cache;
  use Hooks;

  /**
   * @const array
   */
  const DEALER_MENU = ['dealers'];

  /**
   * @var array - global Cms param
   */
  const CMS_PARAM = [
    'PROJECT_TITLE' => 'Project title',
    'PATH_LEGEND'   => 'public/views/legend.php',
    'ACCESS_MENU'   => ['admindb', 'calendar', 'catalog', 'customers', 'dealers', 'fileManager', 'orders', 'statistic', 'users'],
    'MAIN_CSV'      => SHARE_PATH . 'csv/',
    'PATH_CSV'      => SHARE_PATH . 'csv/',
  ];

  /**
   * @var array
   */
  private $setting = [];

  /**
   * @var CmsParam
   */
  private $cmsParam;

  /**
   * @var array
   */
  private $controllerField;

  /**
   * @var array
   */
  public $dbTables = [];

  /**
   * @var boolean
   */
  public $frontSettingInit = false;

  /**
   * Main constructor.
   * @param array $cmsParam
   * @param array $dbConfig
   */
  public function __construct(array $cmsParam, array $dbConfig) {
    $this->cmsParam = [];

    $this->setCmsParam(array_merge($this::CMS_PARAM, $cmsParam));
    $this->setSettings('dbConfig', $dbConfig);
  }
  public function __get($value) {
    if ($value === 'url') {
      $this->url = new UrlGenerator($this, 'core/');
    }
    else if ($value === 'db') {
      $this->db = new Db($this);
      return $this->db;
    }
    else if ($value === 'dealer') {
      $this->dealer = new Dealer($this->db);
      return $this->dealer;
    }

    return $this->$value;
  }
  public function afterConstDefine() {
    $this->loadSetting()
      ->setHooks();
  }
  public function beforeController() {
    if ($this->url->getRoute() === '404') return;

    if (!OUTSIDE) {
      $this->checkAuth()
        ->setAccount()
        ->applyAuth();
    }

    $this->isDealer() && $this->setDealerParam();
  }

  /* ---------------------------------------------------------------------------------------------------------------------
    cms Params
  ----------------------------------------------------------------------------------------------------------------------*/

  private function setDealerParam(): Main {
    // Remove access menu for dealer
    $filter = $this::DEALER_MENU;

    $this->setCmsParam('ACCESS_MENU',
      array_filter($this->getCmsParam('ACCESS_MENU'),
        function ($item) use ($filter) {
          return !includes($filter, $item);
        }
      )
    );

    return $this;
  }

  /**
   * setCmsSetting from config
   * @param string[]|string $param
   * @param $value
   *
   * @return Main
   */
  public function setCmsParam($param, $value = null): Main {
    if (is_array($param)) {
      array_walk($param, function ($item, $key) {
        if ($key === 'PATH_CSV') $item = ABS_SITE_PATH . $item;

        $this->cmsParam[$key] = $item;
      });
    }

    else if ($value !== null) {
      $this->cmsParam[$param] = $value;
    }

    return $this;
  }

  /**
   *
   * @param string $param
   * @return mixed|string|null
   */
  public function getCmsParam(string $param) {
    return $this->cmsParam[$param] ?? null;
  }

  /* ---------------------------------------------------------------------------------------------------------------------
    Settings
  ----------------------------------------------------------------------------------------------------------------------*/

  /**
   * Load setting from file
   *
   * @return Main
   */
  private function loadSetting(): Main {
    $this->setting = array_merge($this->setting, getSettingFile());
    return $this;
  }
  private function checkXml() {
    Xml::checkXml($this->dbTables);
  }
  /**
   * Установка всех параметров для аккаунта
   * @return $this
   */
  private function setAccount(): Main {
    if ($this->checkStatus()) {
      // Меню
      $this->setSideMenu();

      if ($this->availablePage('admindb')) {
        $dbTables = [];
        if (USE_DATABASE) {
          if (CHANGE_DATABASE) {
            $dbTables = array_merge($dbTables, $this->db->getTables());
          } else if ($this->availablePage('catalog')) {
            $props = array_merge([[
              'dbTable' => 'codes',
              'name' => gTxtDB('codes', 'codes')
            ]], $this->db->getTables('prop'));

            $props = array_map(function ($prop) {
              $setting = $this->getSettings('optionProperties')[$prop['dbTable']] ?? false;
              $setting && $setting['name'] && $prop['name'] = $setting['name'];
              return $prop;
            }, $props);
            $dbTables = array_merge($dbTables, ['z_prop' => $props]);
          }
        }
        $this->dbTables = array_merge($dbTables, $this->db->scanDirCsv($this->getCmsParam('PATH_CSV')));
        //$this->checkXml();

        if (USE_CONTENT_EDITOR) {
          $this->dbTables[] = [
            'fileName' => 'content-js',
            'name' => gTxt('Content editor'),
          ];
        }
      }
    }
    return $this;
  }

  /**
   * @param string $key
   * @param $value
   * @return $this
   */
  public function setSettings(string $key, $value): Main {
    $this->setting[$key] = $value;
    return $this;
  }

  /**
   * Save cms setting to file
   */
  public function saveSettings() {
    $content = $this->setting;
    unset($content['permission']);
    file_put_contents(SETTINGS_PATH, json_encode($content));
  }

  /**
   * Get one setting or array if have
   * @param string $key [
   * 'json' - return json, <p>
   * 'managerFields' - return managers custom fields, <p>
   * 'mailTarget' - <p>
   * 'mailTargetCopy' - <p>
   * 'mailSubject' - <p>
   * 'mailFromName' - <p>
   * 'optionProperties' - <p>
   * @param boolean $front if true - ready html input ]
   * @return mixed
   */
  public function getSettings(string $key = '', bool $front = false) {
    $data = $this->setting[$key] ?? null;
    $jsonData = $key === 'json' || $front ? json_encode($data ?: $this->setting) : '';

    if ($front) {
      $this->frontSettingInit = true;
      return "<input type='hidden' id='dataSettings' value='$jsonData'>";
    }
    else if ($key === 'json') return $jsonData;

    return empty($key) ? $this->setting : $this->setting[$key] ?? null;
  }

  /**
   * @param mixed $field
   * @return Main
   */
  public function setControllerField(&$field): Main {
    $this->controllerField =& $field;
    return $this;
  }

  /**
   * @param mixed ...$args
   * @return Main
   */
  public function setControllerParam(...$args): Main {}

  /**
   * @param string $key
   * @param mixed $value
   * @param mixed $position [optional] <p>
   * head - in head <p>
   * before - before all script, after cms libs<p>
   * last - before end body <p>
   * @return $this
   */
  public function addControllerField(string $key, $value, string $position = 'last'): Main {
    if (isset($this->controllerField[$key])) {
      $field =& $this->controllerField[$key];

      if (is_array($field)) {
        if ($position === 'head') array_unshift($field, $value);
        else if ($position === 'before') array_unshift($field, $value);
        if ($position === 'last') $field[] = $value;
      }
      else if (is_object($field)) $field->$key = $value;

    } else {
      $this->controllerField[$key] = $value;
    }
    return $this;
  }

  /*
   * @param string $key
   * @param mixed $value
   * @return $this
   *!/
  public function addControllerField(string $key, $value): Main {
    if (!isset($this->controllerParam['field'])) $this->controllerParam['field'] = [];

    if (isset($this->controllerParam['field'][$key])) {
      $field =& $this->controllerParam['field'][$key];

      if (is_array($field)) $field[] = $value;
      else if (is_object($field)) $field->$key = $value;

    } else {
      $this->controllerParam['field'][$key] = $value;
    }
    return $this;
  }*/

  public function getControllerField(): array {
    return $this->controllerField;
  }

  public function getControllerParam(string $key) {
    //return $this->controllerParam[$key] ?: false;
  }

  public function getBaseTable(): array {
    return $this->dbTables;
  }

  public function getDB(): Db {
    return $this->db;
  }

  public function reDirect(string $target = '') {
    if ($target === '') {
      $target = $_SESSION['target'] ?? '';
      isset($_GET['orderId']) && $target .= '?orderId=' . $_GET['orderId'];
    }
    header('location: ' . $this->url->getUri() . $target);
    die;
  }

  /**
   * @param string $dataId
   * @param bool   $justRate
   * @return string
   * @default $dataId = 'dataRate'
   * @default $justRate = false
   */
  public function getCourse(string $dataId = 'dataRate', bool $justRate = false): string {
    $rateParam = [
      'autoRefresh' => $this->getSettings('autoRefresh'),
      'serverRefresh' => $this->getSettings('serverRefresh'),
    ];
    $rate = new Course($rateParam, $this->db);
    $rate = $justRate ? array_map(function ($rate) { return $rate['rate']; }, $rate->rate) : $rate->rate;
    $rate = json_encode($rate);
    return "<input type='hidden' id='$dataId' value='$rate'>";
  }

  /**
   * @var bool
   */
  public $dealer = false;
  /**
   * @var string
   */
  private $dealCsvPath = '';

  public function publicMain() {
    $this->dealer = false;
    $this->dealCsvPath = $this->getCmsParam('PATH_CSV');
    $this->setCmsParam('PATH_CSV', $this->getCmsParam('MAIN_CSV'));
  }

  public function publicDealer() {
    if ($this->isDealer()) {
      $this->dealer = true;
      $this->setCmsParam('PATH_CSV', $this->dealCsvPath);
    }
  }
}
