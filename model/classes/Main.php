<?php

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {

  /**
   * @var string[]
   */
  static $AVAILABLE_ACTION = ['loadCSV', 'saveVisitorOrder', 'openElement', 'loadOptions', 'loadProperties', 'loadProperty', 'loadFiles'];

  /**
   * @var string
   */
  private $status = 'no';

  /**
   * @var array
   */
  private $sideMenu = [];

  /**
   * @var object [admin, login, id, name]
   */
  private $user = [];

  private function setSideMenu() {
    if (USE_DATABASE) {
      $menuAccess = $this->getLogin('permission')['menu'] ?? '';
      $menuAccess = !empty($menuAccess) ? explode(',', $menuAccess) : false;
      $this->sideMenu = $menuAccess ?: $this->getCmsParam('ACCESS_MENU');
    } else {
      $filterMenu = ['orders', 'calendar', 'customers', 'users', 'statistic', 'catalog'];
      $this->sideMenu = array_filter($this->getCmsParam('ACCESS_MENU'), function ($m) use ($filterMenu) {
        return !in_array($m, $filterMenu);
      });
    }
    PUBLIC_PAGE && $this->sideMenu = array_merge([PUBLIC_PAGE], $this->sideMenu);
    $this->sideMenu[] = 'setting';
  }

  /**
   * @param $field
   * @return mixed
   */
  public function getLogin(string $field = 'login') {
    return $this->user[$field];
  }

  /**
   * @param array $user
   * @return $this|Main
   */
  public function setLogin(array $user): Main {
    $this->user['login'] = $_SESSION['login'];
    $this->user['name']  = $_SESSION['name'];
    $this->user['id']    = $_SESSION['id'];
    $this->user['onlyOne'] = $user['onlyOne'] ?? false;
    $this->user['permission'] = $user['permission'] ?? [];

    $this->user['admin'] = stripos($this->user['permission']['tags'] ?? '', 'admin') !== false;
    $this->setLoginStatus('ok');
    return $this;
  }

  /**
   * @param string $status
   *
   * @return bool
   */
  public function checkStatus(string $status = 'ok'): bool {
    return $this->status === $status;
  }

  /**
   * @param string $status
   * @return $this|Main
   */
  public function setLoginStatus(string $status): Main {
    $this->status = $status;
    return $this;
  }

  /**
   * Проверка пароля
   * @return $this|Main
   */
  public function checkAuth(): Main {
    $this->setLoginStatus('no');
    session_start();

    if (isset($_SESSION['hash']) && isset($_SESSION['PHPSESSID'])
        && $_SESSION['PHPSESSID'] === $_COOKIE['PHPSESSID']) {
      $user = $this->db->checkUserHash($_SESSION);
      $user && $this->setLogin($user);
    }

    return $this;
  }

  /**
   * Если отк. страница доступна без регистрации, то перейти
   * Если отк. стр-ца не доступна без регистрации, то перейти на login
   *
   *   Перейти на страницу входа(login) если нет регистрации и доступ к открытой странице закрыт
   * или нет регистрации и целевая страница не открыта
   * @param string $target
   * @return $this|Main
   */
  public function applyAuth(string $target = ''): Main {
    if ($this->checkStatus('no')) {
      if ($target === 'login') {
        isset($_REQUEST['status']) && $this->setLoginStatus('error');
      } else {
        $_SESSION['target'] = $target;
        if (ONLY_LOGIN || $target !== '' || !PUBLIC_PAGE) $this->reDirect('login');
      }
    } else {
      if ($target === 'login' || ($target === '' && !PUBLIC_PAGE)) $this->reDirect($this->getSideMenu(true));
      if (!in_array($target, ['', '404', 'js']) && !$this->availablePage($target)) $this->reDirect('404');
    }

    session_abort();
    return $this;
  }

  /** Нужна ли регистрация для действия
   * @param string $action
   * @return bool|Main
   */
  public function checkAction(string $action) {
    return in_array($action, $this::$AVAILABLE_ACTION) ? true : $this->checkAuth();
  }

  /**
   * get array of pages
   * @param bool $first
   * @return array|mixed
   */
  public function getSideMenu(bool $first = false) {
    return $first ? array_values($this->sideMenu)[0]
                  : $this->sideMenu;
  }

  /**
   * Check available page
   * @param string $page
   * @return bool
   */
  public function availablePage(string $page): bool {
    return in_array($page, $this->getSideMenu());
  }
}

/**
 * Trait Page
 * @package cms
 */
trait Page {
  /**
   * @var string - controller path
   */
  private $target;

  /**
   * @var array - controller
   */
  private $controllerField;

  /**
   * @return mixed
   */
  public function getTarget() {
    return $this->target;
  }

  /**
   * @param mixed $get
   */
  public function setTarget($get) {
    $this->target = (isset($get['targetPage']) && $get['targetPage'] !== '') ?
      str_replace('/', '', $get['targetPage']) : '/'; // HOME_PAGE
  }
}

/**
 * Trait dictionary
 * @package cms
 */
trait Dictionary {

  /**
   * @var string
   */
  private $dictionaryPath = ABS_SITE_PATH . 'lang/dictionary.php';

  public function initDictionary() {
    $mess = require $this->dictionaryPath;
    $mess = json_encode($mess);
    return $mess ? "<input type='hidden' id='dictionaryData' value='$mess'>" : '';
  }
}

/** Trait Cache */
trait Cache {

  private $updateTime = 1209600; // 2 Недели.
  /**
   * @var array
   */
  private $cvsVars = ['all'];
  /**
   * @var bool
   */
  private $needCsvCached = false;

  /**
   * @param string $file
   */
  private function checkEditTime(string $file) {
    $this->needCsvCached = time() - filemtime($file) > $this->updateTime;
  }

  public function setCsvVariable(array $vars) {
    $this->cvsVars = $vars;
    return $this;
  }

  /**
   * @param mixed ...$vars
   * @return bool if loaded, then return true
   */
  public function loadCsvCache(&...$vars) {
    if (file_exists(CSV_CACHE)) {
      $this->checkEditTime(CSV_CACHE);

      if (!$this->needCsvCached) {
        $data = json_decode(gzuncompress(file_get_contents(CSV_CACHE)), true);
        $this->setCsvVariable(array_keys($data));
        foreach (array_values($data) as $index => $var) {
          $vars[$index] = $var;
        }
        return true;
      }
    } else {
      $this->needCsvCached = true;
    }
    return false;
  }

  public function saveCsvCache(...$vars) {
    $data = [];
    foreach ($this->cvsVars as $index => $key) $data[$key] = $vars[$index];
    file_put_contents(CSV_CACHE, gzcompress(json_encode($data), 1));
  }

  public function loadPageCache() {
    /*
     const PAGE_CACHE_FILE = SHARE_PATH . 'pageCache.bin';
     if (file_exists(PAGE_CACHE_FILE)) {
      $this->checkEditTime(PAGE_CACHE_FILE);

      if (!$this->needCsvCached) {
        return json_decode(gzuncompress(file_get_contents(PAGE_CACHE_FILE)), true);
      }
    } else {
      $this->needCsvCached = true;
    }*/
    return false;
  }

  /**
   * @param {any} $data
   */
  public function savePageCache($data) {
    //if (gettype($data) === 'string')
    file_put_contents(CSV_CACHE, gzcompress(json_encode($data), 1));
  }

}

/**
 * Trait hooks
 * @package cms
 */
trait Hooks {
  private $hooksPath = ABS_SITE_PATH . 'public/hooks.php';
  private $hooks = [];

  public function addHook($hookName, $callable) {
    if (!is_string($hookName) || !is_callable($callable)) return;

    $this->hooks[$hookName] = $callable;
  }

  /**
   * add public hooks
   */
  public function setHooks() {
    require_once CORE . 'model/hooks.php';
    if (file_exists($this->hooksPath)) require_once $this->hooksPath;
  }

  /**
   * @param $hookName - string
   * @param $args - array
   * @return mixed
   */
  public function fireHook($hookName, ...$args) {
    if ($this->hookExists($hookName)) {
      $func = $this->hooks[$hookName];

      if (!isset($args) || !is_array($args)) $args = [];
      if (isset($func)) return $func(...$args);
    }
    return false;
  }

  public function hookExists($hookName) {
    return isset($this->hooks[$hookName]);
  }
}

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
  private $controllerParam;

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
    $this->checkDealer();
    $this->loadSetting();
    $this->setSettings('dbConfig', $dbConfig);
  }

  public function __get($value) {
    if ($value === 'url') {
      $this->url = new UrlGenerator('core/');
    }
    else if ($value === 'db') {
      $this->db = new Db($this->getSettings('dbConfig'));
      return $this->db;
    }
    else if ($value === 'dealer') {
      $this->dealer = new Dealer($this->db);
      return $this->dealer;
    }

    return $this->$value;
  }

  private function checkXml() {
    Xml::checkXml($this->dbTables);
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

  private function checkDealer() {
    $requestUri = $_SERVER['REQUEST_METHOD'] === 'GET' ? $_SERVER['REQUEST_URI'] : $_POST['REQUEST_URI'];
    $isDealer = includes($requestUri, DEALERS_PATH);

    if ($isDealer) {
      preg_match('/dealer(?:\/)(\d+)(?:\/)/', $requestUri, $match); // получить ID дилера

      if (!isset($match[1])) die('Dealer id not found!');

      $this->setCmsParam('dealerPath', DEALERS_PATH . $match[1] . '/')
           ->setCmsParam('dealerId', $match[1])
           ->setDealerParam();
    }

    $this->user['isDealer'] = $isDealer;
    $this->setCmsParam('isDealer', $isDealer);
  }

  public function isDealer() {
    return $this->user['isDealer'];
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
   */
  private function loadSetting() {
    $this->setting = getSettingFile();
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
   * Установка всех параметров для аккаунта
   * @return $this
   */
  public function setAccount(): Main {
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
  public function setControllerParam(...$args): Main {
    array_map(function ($arg) {
      $this->controllerParam = $arg;
    }, $args);

    return $this;
  }

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
    return $this->controllerParam[$key] ?: false;
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
    $uri = $this->isDealer() ? $this->url->getDealerUri() : $this->url->getFullUri();
    header('location: ' . $uri . $target);
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
}
