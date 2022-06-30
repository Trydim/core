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
  private function checkAuth(): Main {
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
  private function applyAuth(string $target = ''): Main {
    if ($this->checkStatus('no')) {
      if ($target === 'login') {
        isset($_REQUEST['status']) && $this->setLoginStatus('error');
      } else {
        $_SESSION['target'] = $target;
        if (ONLY_LOGIN || $target !== '' || !PUBLIC_PAGE) $this->reDirect('login');
      }
    } else {
      if ($target === 'login' || ($target === 'public' && !PUBLIC_PAGE)) $this->reDirect($this->getSideMenu(true));
      if (!in_array($target, ['public', '404', 'js']) && !$this->availablePage($target)) $this->reDirect('404');
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

  /**
   * @return bool
   */
  public function isDealer(): bool {
    return $this->getCmsParam('isDealer');
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

  /**
   * add public hooks
   */
  private function setHooks() {
    require_once CORE . 'model/hooks.php';
    if (file_exists($this->hooksPath)) require_once $this->hooksPath;
  }

  /**
   * @param string $hookName
   * @param callable $callable
   */
  public function addHook(string $hookName, callable $callable) {
    if (empty($hookName)) die('Hook name can\'t be empty!');

    $this->hooks[$hookName] = $callable;
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
