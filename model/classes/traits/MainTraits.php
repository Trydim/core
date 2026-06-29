<?php

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {
  static array $AVAILABLE_ACTION = [
    'saveVisitorOrder', 'loadProperties', 'loadProperty', 'loadFiles', 'loadDealersProperties'
  ];
  /**
   * Anytime and anyone available pages
   */
  static array $AVAILABLE_PAGE = ['login', '404'];

  private string $status = 'no';

  /**
   * Menus with params (links, icons and other)
   */
  private array $sideMenu = [];

  /**
   * Menus link only
   */
  private array $sideLinkMenu = [];

  private array $user = [];

  private function setUser(string $key, $value): Main
  {
    if ($value === null) {
      unset($this->user[$key]);
    } else {
      $this->user[$key] = $value;
    }

    return $this;
  }

  public function setLogin(array $user): Main
  {
    foreach (['id', 'login', 'name', 'onlyOne'] as $key) {
      $this->setUser($key, $user[$key]);
    }

    $this->setUser('contacts', $user['contacts'] ?? [])
         ->setUser('permission', $user['permissionValue'] ?? [])
         ->setUser('customization', $user['customization'] ?? [])
         ->setUser('isAdmin', str_contains($user['permissionValue']['tags'] ?? '', 'admin'))
         ->setLoginStatus('ok');

    return $this;
  }

  public function setDealer(array $dealer): Main
  {
    $this->user['dealer'] = $dealer;

    return $this;
  }

  public function setLoginStatus(string $status): Main
  {
    $this->status = $status;
    return $this;
  }

  /**
   * @param 'id'|'login'|'name'|'contacts'|'onlyOne'|'isAdmin'|'permission'|'customization'|string $field
   * @return mixed
   * @throws ReflectionException
   */
  public function getLogin(string $field = 'login'): mixed
  {
    if (!isset($this->user['id'])) $this->checkAuth();
    if ($field === 'all') return $this->user;
    return $this->user[$field] ?? null;
  }

  public function checkStatus(string $status = 'ok'): bool
  {
    return $this->status === $status;
  }

  private function haveHeaderAuthorization(): bool
  {
    $login = $this->url->server->get('PHP_AUTH_USER');
    $password = $this->url->server->get('PHP_AUTH_PW');

    if (!empty($login) && !empty($password)) {
      $_SESSION['login']    = $login;
      $_SESSION['password'] = $password;
      return true;
    }
    return false;
  }

  /**
   * Проверка пароля
   * @throws ReflectionException
   */
  private function checkAuth(): Main
  {
    // Restore session id (set in auth.php)
    $id = $this->url->request->get('save');
    if ($id) session_id($_COOKIE['PHPSESSID'] = $id);
    if (session_status() === PHP_SESSION_NONE) session_start();

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
   * Если открытая страница доступна без регистрации, то перейти
   * Если открытая страница не доступна без регистрации, то перейти на login
   *
   *   Перейти на страницу входа(login) если нет регистрации и доступ к открытой странице закрыт
   * или нет регистрации и целевая страница не открыта
   */
  private function applyAuth(): Main
  {
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

  private function getSideLinkMenu(): array
  {
    if (count($this->sideLinkMenu) === 0) {
      $this->sideLinkMenu = array_map(function ($item) {
        return is_array($item) ? ($item['label'] ?? $item['link'] ?? $item[0]) : $item;
      }, $this->sideMenu);
    }

    return $this->sideLinkMenu;
  }

  /**
   * Checking if authorization is required for the action
   */
  public function checkAction(string $action): bool
  {
    $result = in_array($action, $this::$AVAILABLE_ACTION) || $this->checkAuth()->checkStatus();

    if ($result === false) {
      $headers = apache_request_headers();
      $result = ($headers['Authorization'] ?? false) === $this->getCmsParam('TOKEN');
    }

    return $result;
  }

  private function setSideMenu(): void
  {
    if ($this->checkStatus('no')) {
      $this->sideMenu = $this->getCmsParam(VC::ACCESS_MENU);
      PUBLIC_PAGE && $this->sideMenu[] = PUBLIC_PAGE;
      return;
    }

    $menuAccess = '';

    if (USE_DATABASE) {
      $menuAccess = $this->getLogin('permission')['menu'] ?? '';
      $menuAccess = !empty($menuAccess) ? explode(',', $menuAccess) : false;
      $this->sideMenu = $menuAccess ?: $this->getCmsParam(VC::ACCESS_MENU);
    } else {
      $filterMenu = ['calendar', 'catalog', 'customers', 'orders', 'statistic', 'users'];
      $this->sideMenu = array_filter($this->getCmsParam(VC::ACCESS_MENU), function ($m) use ($filterMenu) {
        return !in_array($m, $filterMenu);
      });
    }

    if (empty($menuAccess) && PUBLIC_PAGE) array_unshift($this->sideMenu, PUBLIC_PAGE);

    // Setting allowed for all
    $this->sideMenu[] = 'setting';

    // Set AdminDb tree menu
    if ($this->availablePage('admindb')) {
      $dbTables = [];
      if ($this->availablePage('dealers')) {
        $props = $this->db->getTables('prop');
        $dbTables = array_merge($dbTables, ['z_prop' => $props]);
      }
      $this->dbTables = array_merge($dbTables, $this->db->scanDirCsv($this->getCmsParam(VC::CSV_PATH)));

      if ($this->getSettings(VC::USE_CONTENT_EDITOR)) {
        $this->dbTables[] = [
          'fileName' => 'content-js',
          'name'     => 'Content editor',
        ];
      }
    }
  }

  /**
   * Get array of pages
   */
  public function getSideMenu(bool $first = false, bool $withParam = false): string|array
  {
    $sideMenu = $withParam ? $this->sideMenu : $this->getSideLinkMenu();

    return $first ? array_values($sideMenu)[0] : $sideMenu;
  }

  /**
   * Check available page
   */
  public function availablePage(string $page): bool
  {
    return in_array($page, $this::$AVAILABLE_PAGE) || in_array($page, $this->getSideMenu());
  }
}

/**
 * Trait dictionary
 * @package cms
 */
trait Dictionary
{
  /**
   * Array of available locales
   * @var array
   */
  private array $localesList = [];

  /**
   * @var string - Директория хранения пользовательских переводов.
   */
  private string $DICTIONARY_PATH_FILES = SHARE_PATH . 'lang/';

  /**
   * @var string - Директория используемых переводов
   */
  private string $dictionaryPath = '';

  /**
   * @var string - Директория используемх переводов колонок БД
   */
  private string $dbDictionaryPath = '';

  /**
   * @var string - Используемый язык, по умолчанию равен базовому
   */
  private string $targetLocale = '';

  /** @var array<array{name: string, code: string}> $availableLanguages */
  private array $availableLanguages;

  /**
   * @var array<string, string> Словарь переводов: ключ => значение
   */
  private array $dictionary = [];

  /**
   * @var array<string, array<string, string>> Переводы по таблицам базы данных: [таблица][ключ] => значение
   */
  private array $dbDictionary = [];

  /**
   * @var string Константа, если язык не установлен по умолчанию в config.php
   */
  public static string $BASE_LANG = 'ru';

  /**
   * If locales is not need, use base lang
   */
  private function initLocales(): Main {
    $lang = '';
    $currentLang = $_COOKIE['lang'] ?? '';
    $useLocales  = $this->getCmsParam(VC::LOCALES);

    if ($useLocales) {
      $this->localesList = $this->db->loadLocales();
      $lang = $currentLang;
    }

    if ($lang) {
      // Check available locales
      $availableLocales = array_column($this->getAvailableLanguages(), 'code');

      if (count($availableLocales)) $lang = in_array($lang, $availableLocales) ? $lang : $availableLocales[0];
    } else {
      $lang = $this->getCmsParam(VC::LOCALES_BASE_LANG, $this::$BASE_LANG);
    }

    $this->setLocale($lang);

    if ($useLocales && $currentLang !== $lang) setcookie('lang', $lang, time() + (3600 * 24 * 3600), '/');

    return $this;
  }

  /**
   * Загрузка переводов из CSV-файлов
   *
   * @return array<string, string>
   */
  private function loadCSVDictionary(): array
  {
    $csvPaths = $this->db->scanDirCsv($this->DICTIONARY_PATH_FILES);

    if (count($csvPaths) === 0) return [];

    $csvParam = [
      'id' => 'id',
      'value' => $this->targetLocale,
    ];

    $csvChunks = [];

    foreach ($csvPaths as $csv) {
      $csvPath = ABS_SITE_PATH . $this->DICTIONARY_PATH_FILES . $csv['fileName'];
      $csvData = loadCSV($csvParam, $csvPath);

      if (is_array($csvData)) {
        $csvChunks[] = $csvData;
      }
    }

    $csvAllData = array_merge([], ...$csvChunks);

    if (!empty($csvAllData)) {
      $csvDictionary = array_column($csvAllData, 'value', 'id');
    }

    return $csvDictionary ?? [];
  }

  /**
   * @return array<string, string>
   */
  private function loadDictionaryFiles(string $dictionaryDir): array
  {
    $dictionary = [];
    $files = glob($dictionaryDir . DIRECTORY_SEPARATOR . '*.php') ?: [];

    foreach ($files as $file) {
      if (basename($file) === 'dbDictionary.php') continue;

      $fileDictionary = include $file;
      if (is_array($fileDictionary)) {
        $dictionary = array_merge($dictionary, $fileDictionary);
      }
    }

    return $dictionary;
  }

  /**
   * Загружает и объединяет базовый словарь, словарь дилера и csv словари
   *
   * @return array<string, string>
   */
  private function loadAllDictionary(): array
  {
    // Загрузка базового словаря
    $dictionary = $this->loadDictionaryFiles(ABS_SITE_PATH . $this->dictionaryPath);

    // Добавление словаря дилера (если это дилер и словарь существует)
    if ($this->isDealer()) {
      $dealerDictionary = $this->loadDictionaryFiles($this->url->getPath(true) . $this->dictionaryPath);
      $dictionary = array_merge($dictionary, $dealerDictionary);
    }

    // Загрузка кастомных словарей администратора из CSV (приоритет директории дилера)
    $csvDictionary = $this->loadCSVDictionary();

    if ($csvDictionary) {
      $dictionary = array_merge($dictionary, $csvDictionary);
    }

    return $dictionary;
  }

  /**
   * Загрузка словаря для БД
   *
   * @return array<string, array<string, string>>
   */
  private function loadDbDictionary(): array
  {
    $dictionary = [];

    // Загрузка базового словаря для баз данных
    $baseDictPath = ABS_SITE_PATH . $this->dbDictionaryPath;
    if (file_exists($baseDictPath)) {
      $dictionary = include $baseDictPath;
    }
    // Добавление словаря дилера для баз данных  (если это дилер и словарь существует)
    if ($this->isDealer()) {
      $dealerPath = $this->url->getPath(true) . $this->dbDictionaryPath;
      $dealerDict = file_exists($dealerPath) ? include $dealerPath : [];
      // Приоритет у дилерского перевода
      $dictionary = array_replace_recursive($dictionary, $dealerDict);
    }

    return $dictionary;
  }

  /**
   * Инициализирует локализацию системы, вызывается при вызове любого метода получения свойсв класса
   *
   * Метод выполняет следующие задачи:
   * 1. Загружает базовые настройки локализации из конфигурации CMS
   * 2. Определяет целевой язык (из куки или настроек по умолчанию) или язык из заказа
   * 3. Загружает словари переводов:
   *    - Базовый словарь из PHP-файла
   *    - Специфичные переводы для дилеров (если есть)
   *    - Переводы для базы данных
   *    - Дополнительные переводы из CSV-файлов
   *
   * Если словарь уже был инициализирован ранее, метод завершается без повторной инициализации.
   *
   * Результаты работы сохраняются в свойствах класса:
   * - $dictionary - основной словарь переводов
   * - $dbDictionary - словарь переводов для базы данных
   * - $targetLocale - целевой язык перевода
   * - $availableLanguages - доступные языки
   */
  private function loadDictionary(): void
  {
    if ($this->dictionary) return;

    $this->dictionaryPath   = "lang/{$this->targetLocale}";
    $this->dbDictionaryPath = "lang/{$this->targetLocale}/dbDictionary.php";

    $this->dictionary   = $this->loadAllDictionary();
    $this->dbDictionary = $this->loadDbDictionary();
  }

  /**
   * Принудительно устанавливает целевой язык,
   * нужно вызывать до инициализации словарей (нужно при отображении заказа, pdf, excel)
   *
   * @param string|'ru'|'en' $locale
   * @return Main
   */
  public function setLocale(string $locale = ''): Main
  {
    $this->targetLocale = $locale === '' ? $this->getCmsParam(VC::LOCALES_BASE_LANG, $this::$BASE_LANG)
                                         : $locale;

    if ($_COOKIE['lang'] ?? '' !== $this->targetLocale) {
      setcookie('lang', $this->targetLocale, time() + (3600 * 24 * 3600), '/');
    }

    return $this;
  }

  /**
   * Функция для использования словаря на фронтенде
   */
  public function initDictionary(): string
  {
    $this->loadDictionary();

    return $this->getFrontContent('dictionaryData', $this->dictionary);
  }

  /**
   * @return array<string, string> возвращает массив словаря
   */
  public function getDictionary(): array
  {
    $this->loadDictionary();
    return $this->dictionary;
  }

  /**
   * @return array<string, array<string, string>> возвращает массив словаря баз данных
   */
  public function getDbDictionary(): array
  {
    $this->loadDictionary();
    return $this->dbDictionary;
  }

  /**
   * @return string возвращает целевой язык, по умолчанию $BASE_LANG = 'ru'
   */
  public function getTargetLang(): string
  {
    if ($this->targetLocale === '') {
      $this->loadDictionary();
    }

    return $this->targetLocale;
  }

  /**
   * Надо 3 варианта:
   * Когда управляем доступными языками через страницу управления языками (страницы пока нет) загружаем все доступные.
   * Когда управляем доступными языками для дилера через страницу дилеры, загружаем также все?
   * Когда вход под дилером, загружать только доступные ему
   *
   * @return array возвращает доступные языки
   */
  public function getAvailableLanguages(): array
  {
    $result = $this->localesList;

    if ($this->isDealer()) {
      $dealer = $this->setDealerParam()->getLogin(VC::USER_DEALER);
      $dealerLocales = array_column($dealer['settings']['locales'] ?? [], 'id');

      // If dealer locales empty then available all locales
      if (count($dealerLocales)) {
        $result = array_filter($result, function ($item) use ($dealerLocales) {
          return in_array($item['id'], $dealerLocales);
        });
      }
    }

    return array_values($result);
  }
}

/**
 * Trait hooks
 * @package cms
 */
trait Hooks
{
  private string $hooksPath = ABS_SITE_PATH . 'public/hooks.php';
  private array $hooks = [];

  /**
   * add public hooks
   */
  private function setHooks(): void
  {
    require_once CORE . 'model/hooks.php';
    if (file_exists($this->hooksPath)) require_once $this->hooksPath;
  }

  public function addHook(string $hookName, callable $callable): void
  {
    if (empty($hookName)) die('Hook name can\'t be empty!');

    $this->hooks[$hookName] = $callable;
  }

  public function fireHook($hookName, ...$args): mixed
  {
    if ($this->hookExists($hookName)) {
      $func = $this->hooks[$hookName];

      if (!isset($args)) $args = [];
      if (isset($func)) return $func(...$args);
    }
    return false;
  }

  public function hookExists($hookName): bool
  {
    return isset($this->hooks[$hookName]);
  }
}

/**
 * Trait Page
 * @package cms
 */
trait Utilities
{
  public function getFrontContent(string $id, mixed $data): string
  {
    $data = json_encode($data, JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    return "<input type='hidden' id='$id' value='$data'>";
  }

  public function isSafari(): bool
  {
    return boolValue(
      preg_match(
        "/^((?!chrome|android).)*safari/",
        strtolower($this->url->server->get('HTTP_USER_AGENT')))
    );
  }

  public function encrypt(string $value): string
  {
    $ca = $this->getCmsParam(VC::ENCRYPT_ALGO);
    $key = $this->getCmsParam(VC::ENCRYPT_KEY) ?? 'eKey';

    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($ca));
    $encrypted = openssl_encrypt($value, $ca, $key, 0, $iv);
    $encrypted = substr($encrypted, 0, -1) . substr(uniqid(), 7);
    return base64_encode($encrypted . '::' . $iv);
  }

  public function decrypt(string $param): string
  {
    $ca = $this->getCmsParam(VC::ENCRYPT_ALGO);
    $key = $this->getCmsParam(VC::ENCRYPT_KEY) ?? 'eKey';

    list($encryptedData, $iv) = explode('::', base64_decode($param));
    $encryptedData = substr($encryptedData, 0, -6) . '=';
    $token = openssl_decrypt($encryptedData, $ca, $key, 0, $iv);

    return $token ?: '';
  }
}
