<?php

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {

  /**
   * @var string[]
   */
  static $AVAILABLE_ACTION = [
    'loadTable', 'saveVisitorOrder', 'openElement', 'loadOptions', 'loadProperties', 'loadProperty', 'loadFiles', 'loadDealersProperties'
  ];
  /**
   * @var string[] anytime and anyone available pages
   */
  static $AVAILABLE_PAGE = ['login', '404'];

  /**
   * @var string
   */
  private $status = 'no';

  /**
   * @var array - Menus with params (links, icons and other)
   */
  private $sideMenu = [];

  /**
   * @var array - Menus link only
   */
  private $sideLinkMenu = [];

  /**
   * @var object []
   */
  private $user = [];

  /**
   * @param array $user
   * @return $this|Main
   */
  public function setLogin(array $user): Main {
    $this->user['id']    = $user['id'];
    $this->user['login'] = $user['login'];
    $this->user['name']  = $user['name'];
    $this->user['contacts'] = $user['contacts'] ?? [];
    $this->user['onlyOne']  = $user['onlyOne'];
    $this->user['permission']    = $user['permissionValue'] ?? [];
    $this->user['customization'] = $user['customization'] ?? [];

    $this->user['isAdmin'] = stripos($this->user['permission']['tags'] ?? '', 'admin') !== false;
    $this->setLoginStatus('ok');
    return $this;
  }

  /**
   * @param array $dealer
   * @return Main
   */
  public function setDealer(array $dealer): Main {
    $this->user['dealer'] = $dealer;

    return $this;
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
   * @param string $field - id, login, name, contacts, onlyOne, isAdmin, contacts, permission, customization
   * @return object|object[]|null
   */
  public function getLogin(string $field = 'login') {
    if ($field === 'id' && !isset($this->user[$field])) $this->checkAuth();
    if ($field === 'all') return $this->user;
    return $this->user[$field] ?? null;
  }

  /**
   * @param string $status
   *
   * @return bool
   */
  public function checkStatus(string $status = 'ok'): bool {
    return $this->status === $status;
  }

  private function haveHeaderAuthorization(): bool {
    $login    = $this->url->server->get('PHP_AUTH_USER');
    $password = $this->url->server->get('PHP_AUTH_PW');

    if (!empty($login) && !empty($password)) {
      $_SESSION['login']     = $login;
      $_SESSION['password']  = $password;
      return true;
    }
    return false;
  }
  /**
   * Проверка пароля
   * @return $this|Main
   */
  private function checkAuth(): Main {
    // Restore session id (set in auth.php)
    $id = $this->url->request->get('save');
    if ($id) session_id($_COOKIE['PHPSESSID'] = $id);
    !isset($_SESSION) && session_start();

    if ( (isset($_SESSION['hash']) && ($_SESSION['PHPSESSID'] ?? '') === $_COOKIE['PHPSESSID'])
         ||
         $this->haveHeaderAuthorization()
    ) {
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
   *
   * @return $this|Main
   */
  private function applyAuth(): Main {
    $route = $this->url->getRoute();

    if ($this->checkStatus('no')) {
      if ($route === 'login') {
        isset($_REQUEST['status']) && $this->setLoginStatus('error');
      } else {
        $_SESSION['target'] = $route !== '404' ? $route : '';
        if ($this->getCmsParam(VC::ONLY_LOGIN) || $route !== 'public' || !PUBLIC_PAGE) $this->reDirect('login');
      }
    } else {
      if ($route === 'login' || ($route === 'public' && !PUBLIC_PAGE)) $this->reDirect($this->getSideMenu(true));
      if (!in_array($route, ['public', '404', 'js']) && !$this->availablePage($route)) $this->reDirect('404');
    }

    session_abort();
    return $this;
  }

  private function getSideLinkMenu(): array {
    if (count($this->sideLinkMenu) === 0) {
      $this->sideLinkMenu = array_map(function ($item) {
        return is_array($item) ? $item['link'] : $item;
      }, $this->sideMenu);
    }

    return $this->sideLinkMenu;
  }

  /**
   * Checking if authorization is required for the action
   * @param string $action
   * @return bool
   */
  public function checkAction(string $action): bool {
    $result = in_array($action, $this::$AVAILABLE_ACTION) || $this->checkAuth()->checkStatus();

    if ($result === false) {
      $headers = apache_request_headers();
      $result = ($headers['Authorization'] ?? false) === $this->getCmsParam('TOKEN');
    }

    return $result;
  }

  private function setSideMenu() {
    if ($this->checkStatus('no')) {
      $this->sideMenu = $this->getCmsParam('ACCESS_MENU');
      PUBLIC_PAGE && $this->sideMenu[] = PUBLIC_PAGE;
      return;
    }

    $menuAccess = '';

    if (USE_DATABASE) {
      $menuAccess = $this->getLogin('permission')['menu'] ?? '';
      $menuAccess = !empty($menuAccess) ? explode(',', $menuAccess) : false;
      $this->sideMenu = $menuAccess ?: $this->getCmsParam('ACCESS_MENU');
    } else {
      $filterMenu = ['calendar', 'catalog', 'customers', 'orders', 'statistic', 'users'];
      $this->sideMenu = array_filter($this->getCmsParam('ACCESS_MENU'), function ($m) use ($filterMenu) {
        return !in_array($m, $filterMenu);
      });
    }

    if (empty($menuAccess) && PUBLIC_PAGE) {
      $this->sideMenu = array_merge([PUBLIC_PAGE], $this->sideMenu);
    }

    // Setting allowed for all
    $this->sideMenu[] = 'setting';

    // Set AdminDb tree menu
    if ($this->availablePage('admindb')) {
      $dbTables = [];
      if (USE_DATABASE) {
        if (CHANGE_DATABASE) {
          $dbTables = array_merge($dbTables, $this->db->getTables());
        } else if ($this->availablePage('catalog') || $this->availablePage('dealers')) {
          $props = array_merge(
            [['dbTable' => 'codes', 'name'=> gTxt('codes')]],
            $this->db->getTables('prop')
          );

          $props = array_map(function ($prop) {
            $setting = $this->getSettings(VC::OPTION_PROPERTIES)[$prop['dbTable']] ?? false;
            $setting && $setting['name'] && $prop['name'] = $setting['name'];
            return $prop;
          }, $props);
          $dbTables = array_merge($dbTables, ['z_prop' => $props]);
        }
      }
      $this->dbTables = array_merge($dbTables, $this->db->scanDirCsv($this->getCmsParam(VC::CSV_PATH)));

      if (USE_CONTENT_EDITOR) {
        $this->dbTables[] = [
          'fileName' => 'content-js',
          'name'     => gTxt('Content editor'),
        ];
      }
    }
  }

  /**
   * get array of pages
   * @param bool $first
   * @param bool $withParam
   * @return array|mixed
   */
  public function getSideMenu(bool $first = false, bool $withParam = false) {
    $sideMenu = $withParam ? $this->sideMenu : $this->getSideLinkMenu();

    return $first ? array_values($sideMenu)[0] : $sideMenu;
  }

  /**
   * Check available page
   * @param string $page
   * @return bool
   */
  public function availablePage(string $page): bool {
    return in_array($page, $this::$AVAILABLE_PAGE) || in_array($page, $this->getSideMenu());
  }

  /**
   * @return bool
   */
  public function isDealer(): bool {
    return $this->getCmsParam('isDealer');
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

  public function initDictionary(): string {
    $mess = require $this->dictionaryPath;
    $mess = json_encode($mess);
    return $mess ? "<input type='hidden' id='dictionaryData' value='$mess'>" : '';
  }
}

/** Trait Cache */
trait Cache {
  /**
   * @var array - const
   */
  private $CACHE = [
    'KEY_FILE_NAME' => 'csvCache.key',
    'FILE_NAME' => 'csvCache.bin',
  ];

  /**
   * @var string
   */
  private $cacheKey;

  /**
   * @var array
   */
  private $cacheVars = ['all'];

  private function getCacheDir(): string {
    /*if ($this->publicDealer && $this->url->getRoute() === 'public') {
      $cachePath = $this->url->getPath(true);
    } else {
      $cachePath = $this->url->getBasePath(true);
    }*/

    return $this->url->getPath(true) . SHARE_PATH;
  }

  /**
   * Return path for cache, different for dealer and main.
   * @return string
   */
  private function getCachePath(): string {
    return $this->getCacheDir() . $this->cacheKey . $this->CACHE['FILE_NAME'];
  }

  private function getCacheKeyPath(): string {
    return $this->getCmsParam(VC::CSV_PATH) . $this->cacheKey . $this->CACHE['KEY_FILE_NAME'];
  }

  private function cacheIsActual(string $cachePath): bool {
    return abs(filemtime($this->getCacheKeyPath()) - filemtime($cachePath)) < 10;
  }

  public function setCsvVariable(array $vars): Main {
    $this->cacheVars = $vars;
    return $this;
  }

  public function setCacheKey(string $key): Main {
    $this->cacheKey = $key;
    return $this;
  }

  /**
   * @param string $cacheKey
   * @param mixed  ...$vars
   * @return bool
   */
  public function loadCsvCache(string $cacheKey, &...$vars): bool {
    $this->setCacheKey($cacheKey);
    $cachePath = $this->getCachePath();

    if (!DEBUG && file_exists($cachePath) && $this->cacheIsActual($cachePath)) {
      $data = json_decode(gzuncompress(file_get_contents($cachePath)), true);
      $this->setCsvVariable(array_keys($data));
      foreach (array_values($data) as $index => $var) {
        $vars[$index] = $var;
      }
      return true;
    }
    return false;
  }

  /**
   * @param string $cacheKey
   * @param        ...$vars
   */
  public function saveCsvCache(string $cacheKey, ...$vars) {
    $data = [];
    $this->setCacheKey($cacheKey);

    foreach ($this->cacheVars as $index => $key) $data[$key] = $vars[$index];
    file_put_contents($this->getCachePath(), gzcompress(json_encode($data), 1));
    //file_put_contents($this->getCacheKeyPath(), uniqid());
  }

  public function deleteCsvCache() {
    $cacheDir = scandir($this->getCacheDir());

    foreach ($cacheDir as $path) {
      if (includes($path, $this->CACHE['FILE_NAME']) && file_exists($path)) unlink($path);
    }
  }

  public function loadPageCache(): bool {
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
    file_put_contents($this->cachePath(), gzcompress(json_encode($data), 1));
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

      if (!isset($args)) $args = [];
      if (isset($func)) return $func(...$args);
    }
    return false;
  }

  public function hookExists($hookName): bool {
    return isset($this->hooks[$hookName]);
  }
}

/**
 * Trait Page
 * @package cms
 */
trait Utilities {

  /**
   * @param string $id
   * @param mixed $data
   * @return string
   */
  public function getFrontContent(string $id, $data): string {
    $data = json_encode($data, JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    return "<input type='hidden' id='$id' value='$data'>";
  }

  /**
   * @return bool
   */
  public function isSafari(): bool {
    return boolValue(
      preg_match(
        "/^((?!chrome|android).)*safari/",
        strtolower($this->url->server->get('HTTP_USER_AGENT')))
    );
  }

  public function encrypt(string $value): string {
    $ca = $this->getCmsParam(VC::ENCRYPT_ALGO);
    $key = $this->getCmsParam(VC::ENCRYPT_KEY) ?? 'eKey';

    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($ca));
    $encrypted = openssl_encrypt($value, $ca, $key, 0, $iv);
    $encrypted = substr($encrypted, 0, -1) . substr(uniqid(), 7);
    return base64_encode($encrypted . '::' . $iv);
  }

  public function decrypt(string $param): string {
    $ca = $this->getCmsParam(VC::ENCRYPT_ALGO);
    $key = $this->getCmsParam(VC::ENCRYPT_KEY) ?? 'eKey';

    list($encryptedData, $iv) = explode('::', base64_decode($param));
    $encryptedData = substr($encryptedData, 0, -6) . '=';
    $token = openssl_decrypt($encryptedData, $ca, $key, 0, $iv);

    return $token ?: '';
  }
}
