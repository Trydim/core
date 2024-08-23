<?php

use RedBeanPHP\RedException;

require __DIR__ . '/traits/MainTraits.php';

final class Main {
  use Authorization;
  use Dictionary;
  use Cache;
  use Hooks;
  use Utilities;

  /**
   * @const array
   */
  const DEALER_MENU = ['dealers'];

  /**
   * @var array - global Cms param
   */
  const CMS_PARAM = [
    'PROJECT_TITLE' => 'Project title',
    'ACCESS_MENU'   => ['admindb', 'calendar', 'catalog', 'customers', 'dealers', 'fileManager', 'orders', 'statistic', 'users'],
  ];

  const SETTINGS_PATH = SHARE_PATH . 'settingSave.json';

  /**
   * @var array
   */
  private $setting = [];

  /**
   * @var array
   */
  private $cmsParam = [];

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
   * @var UrlGenerator
   */
  public $url;

  /**
   * @var Dealer
   */
  public $dealer;

  /**
   * @var Response
   */
  public $response;


  /**
   * Main constructor.
   * @param array $cmsParam
   * @param array $dbConfig
   */
  public function __construct(array $cmsParam, array $dbConfig) {
    $this->setCmsParam(array_merge($this::CMS_PARAM, $cmsParam));
    $this->setSettings(VC::DB_CONFIG, $dbConfig);

    $this->url    = new UrlGenerator($this, 'core/');
    $this->response = new Response($this);
    $this->dealer   = new Dealer($this);
  }

  /**
   * @param string $value
   * @return DbMain|Dealer|UrlGenerator|Response
   * @throws RedException
   */
  public function __get(string $value) {
    if ($value === 'db') {
      $this->db = new DbMain($this);
    }

    return $this->$value;
  }
  public function afterConstDefine() {
    $this->loadSetting()
         ->setHooks();
  }
  public function beforeController() {
    if (OUTSIDE) return;

    if ($this->isDealer()) $this->setDealerParam();

    $this->checkAuth()
      ->setAccount()
      ->applyAuth();
  }

  /* -------------------------------------------------------------------------------------------------------------------
    Request
  --------------------------------------------------------------------------------------------------------------------*/
  /*public function getRequest($key) {
    $this->url->request->
  }*/
  /* -------------------------------------------------------------------------------------------------------------------
    Cms Params
  --------------------------------------------------------------------------------------------------------------------*/

  private function setDealerParam(): Main {
    // Remove access menu for dealer
    $filter = $this::DEALER_MENU;

    $this->setCmsParam('ACCESS_MENU',
      array_filter($this->getCmsParam('ACCESS_MENU'),
        function ($item) use ($filter) {
          if (is_array($item)) $item = $item['link'];

          return !includes($filter, $item);
        }
      )
    );

    $this->setDealer($this->db->loadDealerById());

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
        if ($key === VC::CSV_PATH) $item = ABS_SITE_PATH . $item;

        $this->cmsParam[$key] = $item;
      });
    }

    else if ($value !== null) {
      $this->cmsParam[$param] = $value;
    }

    return $this;
  }

  /**
   * @param string $param
   * @return mixed|string|null
   */
  public function getCmsParam(string $param) {
    $param = explode('.', $param);

    if (count($param) === 1) {
      return $this->cmsParam[$param[0]] ?? null;
    } else {
      return $this->cmsParam[$param[0]][$param[1]] ?? null;
    }
  }

  /* -------------------------------------------------------------------------------------------------------------------
    Settings
  --------------------------------------------------------------------------------------------------------------------*/

  /**
   * Load setting from file
   *
   * @return Main
   */
  private function loadSetting(): Main {
    $setting = [];
    $settingPath = $this->url->getPath(true) . self::SETTINGS_PATH;

    if (file_exists($settingPath)) {
      $setting = json_decode(file_get_contents($settingPath), true);
    }

    $settingPath = $this->url->getBasePath(true) . self::SETTINGS_PATH;
    if ($this->isDealer() && file_exists($settingPath)) {
      $mainSetting = json_decode(file_get_contents($settingPath), true);
      $setting[VC::OPTION_PROPERTIES] = $mainSetting[VC::OPTION_PROPERTIES] ?? [];
      $setting[VC::DEALER_PROPERTIES] = $mainSetting[VC::DEALER_PROPERTIES] ?? [];
    }

    $this->setting = array_merge($this->setting, $setting);
    return $this;
  }

  /**
   * Установка всех параметров для аккаунта
   * @return $this
   */
  private function setAccount(): Main {
    $this->setSideMenu();

    return $this;
  }

  /**
   * @param string $key
   * @param mixed $value
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

    unset($content['permission'], $content[VC::DB_CONFIG]);

    file_put_contents($this->url->getPath(true) . self::SETTINGS_PATH, json_encode($content));
  }

  /**
   * Get one setting or array if it has
   * @param string $key [
   * 'json' - return json, <p>
   * 'managerFields' - return managers custom fields, <p>
   * 'mailTarget' - <p>
   * 'mailTargetCopy' - <p>
   * 'mailSubject' - <p>
   * 'mailFromName' - <p>
   * 'optionProperties' - <p>
   * @param boolean $front if true - ready html input
   * @return mixed
   */
  public function getSettings(string $key = '', bool $front = false) {
    $data = $this->setting[$key] ?? null;
    if ($front) {
      $data = $this->setting;
      unset($data[VC::DB_CONFIG]);
    }

    $jsonData = $key === 'json' || $front ? json_encode($data ?: $this->setting) : '';

    if ($front) {
      $this->frontSettingInit = true;
      return "<input type='hidden' id='dataSettings' value='$jsonData'>";
    }
    else if ($key === 'json') return $jsonData;

    return empty($key) ? $this->setting : ($this->setting[$key] ?? null);
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
   * @param string $key
   * @param mixed $value
   * @param mixed $position [optional] <br>
   * before - if string - prepend to the beginning. if array - prepend elements to the beginning of an array<br>
   * after - if string - append to the end. if array - append elements to the end of an array<br>
   * @return $this
   */
  public function addControllerField(string $key, $value, string $position = 'after'): Main {
    if (isset($this->controllerField[$key])) {
      $field =& $this->controllerField[$key];

      if (is_string($field)) {
        if ($position === 'before') $field = $value . $field;
        else $field .= $value;
      }
      else if (is_array($field)) {
        if ($position === 'before') array_unshift($field, $value);
        else $field[] = $value;
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
   *
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

  public function getControllerField(): array { return $this->controllerField; }

  //public function getControllerParam(string $key) { return $this->controllerParam[$key] ?: false; }

  public function initDefaultController(): Main {
    $main = $this;
    $isGlobal = false;
    $target = $this->url->getRoute();

    $field = [
      'main'        => $this,
      'pageTitle'   => gTxt($target),
      'headContent' => '',
      'cssLinks'    => [],
      'jsLinks'     => [],

      'pageHeader' => null,
      'sideLeft'   => null,
      'sideRight'  => null,
      'pageFooter' => null,
      'footerContent'     => null,
      'footerContentBase' => null,

      'global'   => null,
    ];

    $this->setControllerField($field)->fireHook($target . 'Template', $field);
    ob_start();
    include $this->url->getRoutePath();
    $templateContent = ob_get_clean();
    $field['content'] = $field['content'] ?? (empty($templateContent) ? $target . ' default content.' : $templateContent);
    if ($isGlobal) $field['global'] = $field['content'];

    $this->response->setContent(template(OUTSIDE ? '_outside' : 'base', $field));
    return $this;
  }

  public function getBaseTable(): array { return $this->dbTables; }

  public function getDB(): DbMain { return $this->db; }

  public function reDirect(string $target = '') {
    if ($target === '') {
      $target = $_SESSION['target'] ?? '';
      isset($_GET['orderId']) && $target .= '?orderId=' . $_GET['orderId'];
    }
    header('Location: ' . $this->url->getUri() . $target, true, 303);
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
      VC::AUTO_REFRESH   => $this->getSettings(VC::AUTO_REFRESH),
      VC::SERVER_REFRESH => $this->getSettings(VC::SERVER_REFRESH),
    ];
    $rate = new Course($rateParam, $this->db);
    $rate = $justRate ? array_map(function ($rate) { return $rate['rate']; }, $rate->rate) : $rate->rate;
    $rate = json_encode($rate);
    return "<input type='hidden' id='$dataId' value='$rate'>";
  }

  /**
   * @var bool
   */
  public $publicDealer = true;

  public function publicMain() {
    $this->publicDealer = false;
    $this->setCmsParam('dealCsvPath', $this->getCmsParam(VC::CSV_PATH));
    $this->setCmsParam(VC::CSV_PATH, $this->getCmsParam(VC::CSV_MAIN_PATH));
  }

  public function publicDealer() {
    if ($this->isDealer()) {
      $this->publicDealer = true;
      $this->setCmsParam(VC::CSV_PATH, $this->getCmsParam('dealCsvPath'));
    }
  }
}
