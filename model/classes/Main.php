<?php

use JetBrains\PhpStorm\NoReturn;
use RedBeanPHP\RedException;

require __DIR__ . '/traits/MainTraits.php';
require __DIR__ . '/traits/MainAssets.php';

final class Main {
  use Authorization;
  use Assets;
  use Dictionary;
  use Hooks;
  use Utilities;

  const DEALER_MENU = ['dealers'];

  /**
   * @var array - global Cms param
   */
  const CMS_PARAM = [
    VC::PROJECT_TITLE => 'Project title',
    VC::ACCESS_MENU   => ['admindb', 'calendar', 'catalog', 'customers', 'dealers', 'fileManager', 'orders', 'statistic', 'users'],
    VC::SHARED_PATH   => 'shared/upload/',
    VC::ENCRYPT_ALGO  => 'aes-256-cbc',
  ];
  const SETTINGS_PATH = SHARE_PATH . 'settingSave.json';

  private static ?self $instance = null;

  private bool $hasDealers = false;
  private array $setting = [];
  private array $cmsParam = [];
  private array $controllerField = [
    VC::BASE_CSS_LINKS => [],
    VC::BASE_JS_LINKS => [],
  ];

  public array $dbTables = [];

  public bool $frontSettingInit = false;

  public \Dotenv\Dotenv $env;

  public readonly DbProxy $db;
  public readonly UrlGenerator $url;
  public readonly Dealer $dealer;
  public readonly Response $response;

  public bool $publicDealer = true;

  /**
   * Cloning is not available for singleton
   */
  private function __clone() {}

  /**
   * @throws RedException|ReflectionException
   */
  private function __construct(array $publicConfig, array $dbConfig) {
    $this->setCmsParam(array_merge(self::CMS_PARAM, $publicConfig));
    $this->setDealersMode();
    $this->setSettings(VC::DB_CONFIG, $dbConfig);

    $this->db       = new DbProxy(new DbMain($this));
    $this->url      = new UrlGenerator($this, $publicConfig);
    $this->response = new Response($this);
    $this->dealer   = new Dealer($this);
  }

  /**
   * @throws RedException|ReflectionException
   */
  public static function getInstance(array $cmsParam, array $dbConfig): self {
    if (self::$instance === null) {
      self::$instance = new self($cmsParam, $dbConfig);
    }
    return self::$instance;
  }

  public function afterConstDefine(): void
  {
    $this->initLocales()
         ->loadSetting()
         ->setHooks();
  }

  /**
   * @throws ReflectionException
   */
  public function beforeController(): void
  {
    if (OUTSIDE) return;

    if ($this->isDealer()) $this->setDealerParam();

    $this->checkAuth()
         ->setAccount()
         ->applyAuth();
  }

  // Environment variables
  //--------------------------------------------------------------------------------------------------------------------

  private function initEnvironment(): void
  {
    require_once CORE . 'libs/vendor/autoload.php';

    $this->env = Dotenv\Dotenv::createImmutable(ABS_SITE_PATH);
    $this->env->load();
  }

  public function getEnv(string $key, string $default = ''): mixed
  {
    if (empty($_ENV)) {
      $this->initEnvironment();
    }

    $result = $_ENV[$key] ?? $default;

    if ($result === 'true') return true;
    if ($result === 'false') return false;

    return $result;
  }

  // Cms Params
  //--------------------------------------------------------------------------------------------------------------------

  private function setDealersMode(): void
  {
    $accessMenu = $this->getCmsParam(VC::ACCESS_MENU, []);

    foreach ($accessMenu as $item) {
      if (is_array($item)) $item = $item['link'] ?? $item[0] ?? '';
      if ($item === 'dealers') {
        $this->hasDealers = true;
        return;
      }
    }

    $this->hasDealers = false;
  }

  /**
   * @throws ReflectionException
   */
  private function setDealerParam(): Main {
    // Remove access menu for dealer
    $filter = $this::DEALER_MENU;

    $this->setCmsParam(VC::ACCESS_MENU,
      array_filter($this->getCmsParam(VC::ACCESS_MENU),
        function ($item) use ($filter) {
          if (is_array($item)) $item = $item['link'] ?? $item[0];

          return !includes($filter, $item);
        }
      )
    );

    $this->setDealer($this->db->loadDealerById());

    return $this;
  }

  public function hasDealers(): bool
  {
    return $this->hasDealers;
  }

  public function setCmsParam(array|string $param, mixed $value = null): Main {
    if (is_array($param)) {
      array_walk($param, function ($item, $key) {
        $refVC = new ReflectionClass(VC::class);

        if ($key === VC::CSV_PATH) $item = ABS_SITE_PATH . $item;
        if ($refVC->hasConstant($key)) $key = $refVC->getConstant($key);
        $this->cmsParam[$key] = $item;
      });
    }

    else if ($value !== null) {
      $this->cmsParam[$param] = $value;
    }

    return $this;
  }

  public function getCmsParam(string $param, mixed $default = null): mixed
  {
    $param = explode('.', $param);

    if (count($param) === 1) {
      return $this->cmsParam[$param[0]] ?? $default;
    } else {
      return $this->cmsParam[$param[0]][$param[1]] ?? $default;
    }
  }

  public function isDealer(): bool
  {
    return $this->getCmsParam(VC::IS_DEALER);
  }

  public function getDealerId(): int|string
  {
    return $this->getCmsParam(VC::DEALER_ID) ?? 1;
  }

  // Settings
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Load setting from file
   */
  private function loadSetting(): Main
  {
    $setting = [];

    $settingPath = $this->url->getBasePath(true) . self::SETTINGS_PATH;
    if (file_exists($settingPath)) {
      $setting = json_decode(file_get_contents($settingPath), true);
    }

    if ($this->isDealer()) {
      $settingPath = $this->url->getPath(true) . self::SETTINGS_PATH;
      if (file_exists($settingPath)) {
        $dealSetting = json_decode(file_get_contents($settingPath), true);
        $setting = array_merge($setting, $dealSetting);
      }
    }

    $this->setting = array_merge($this->setting, $setting);
    return $this;
  }

  /**
   * Установка всех параметров для аккаунта
   */
  private function setAccount(): Main {
    $this->setSideMenu();

    return $this;
  }

  public function setSettings(string $key, mixed $value): Main {
    $this->setting[$key] = $value;

    return $this;
  }

  /**
   * Save cms setting to file
   */
  public function saveSettings(): void
  {
    $content = $this->setting;

    unset($content['permission'], $content[VC::DB_CONFIG]);

    file_put_contents($this->url->getPath(true) . self::SETTINGS_PATH, json_encode($content));
  }

  /**
   * Get one setting or array if it has.
   *
   * @param 'json'|'managerFields'|'mailTarget'|'mailTargetCopy'|'mailSubject'|'mailFromName'|'optionProperties'|string $key
   * @param bool $front If true, returns ready-to-use HTML input
   * @return mixed
   */
  public function getSettings(string $key = '', bool $front = false): mixed
  {
    $data = $this->setting[$key] ?? null;
    if ($front) {
      $data = $this->setting;
      unset($data[VC::DB_CONFIG]);
    }

    $jsonData = $key === 'json' || $front ? json_encode($data ?: $this->setting, JSON_HEX_APOS | JSON_HEX_QUOT) : '';

    if ($front) {
      $this->frontSettingInit = true;
      return "<input type='hidden' id='dataSettings' value='$jsonData'>";
    }
    else if ($key === 'json') return $jsonData;

    return empty($key) ? $this->setting : ($this->setting[$key] ?? null);
  }

  public function setControllerField(mixed &$field): Main {
    foreach ($field as $key => $value) {
      $current = $this->controllerField[$key] ?? null;

      if (isset($current)) {
        if (is_array($current) && is_array($value)) {
          $this->controllerField[$key] = array_merge($current, $value);
        } else {
          $this->controllerField[$key] .= $value;
        }
      } else {
        $this->controllerField[$key] = $value;
      }
    }

    return $this;
  }

  /**
   * @param 'before'|'after'|string $position
   * 'before' - prepend to the beginning (string or array)
   * 'after'  - append to the end (string or array)
   */
  public function addControllerField(string $key, mixed $value, string $position = 'after'): Main {
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

  public function getControllerField($key = '', $default = null): mixed {
    return empty($key) ? $this->controllerField : ($this->controllerField[$key] ?? $default);
  }

  /**
   * @Danger
   */
  public function setControllerViewField(string $path): void
  {
    $main = $this;
    $field =& $this->controllerField;
    ob_start();
    if (file_exists($path)) require $path;
    $templateContent = ob_get_clean();
    $this->controllerField['content'] = $field['content'] ?? (empty($templateContent) ? $this->url->getRoute() . ' default content.' : $templateContent);
  }

  public function initDefaultController(): Main {
    $target = $this->url->getRoute();

    $field = [
      'main'        => $this,
      'pageTitle'   => $this->getCmsParam(VC::PROJECT_TITLE) . ' ' . gTxt(ucfirst($target)),
      'headContent' => '',

      'pageHeader' => null,
      'sideLeft'   => null,
      'sideRight'  => null,
      'pageFooter' => null,
      'footerContent'     => null,
      'footerContentBase' => null,
    ];

    $this->setControllerField($field)->fireHook($target . 'Template', $field);
    $this->setControllerViewField($this->url->getRoutePath());
    $this->response->setContent(template(OUTSIDE ? '_outside' : 'base',  $this->getControllerField()));
    return $this;
  }

  public function getBaseTable(): array { return $this->dbTables; }

  public function getDB(): DbProxy { return $this->db; }

  #[NoReturn]
  public function reDirect(string $target = ''): void
  {
    if ($target === '') {
      $target = $_SESSION['target'] ?? '';
      isset($_GET['orderId']) && $target .= '?orderId=' . $_GET['orderId'];
    }
    header('Location: ' . $this->url->getUri() . $target, true, 303);
    die;
  }

  public function getCourse(string $dataId = 'dataRate', bool $justRate = false): string {
    $rateParam = [
      VC::RATE_AUTO_REFRESH => $this->getSettings(VC::RATE_AUTO_REFRESH),
      VC::RATE_SERVER_REFRESH => $this->getSettings(VC::RATE_SERVER_REFRESH),
    ];
    $rate = new Course($rateParam, $this->db);
    $rate = $justRate ? array_map(function ($rate) { return $rate['rate']; }, $rate->rate) : $rate->rate;
    return $this->getFrontContent($dataId, $rate);
  }

  public function publicMain(): Main {
    $this->publicDealer = false;
    $this->setCmsParam('dealCsvPath', $this->getCmsParam(VC::CSV_PATH));
    $this->setCmsParam(VC::CSV_PATH, $this->getCmsParam(VC::CSV_MAIN_PATH));

    return $this;
  }

  public function publicDealer(): Main {
    if ($this->isDealer()) {
      $this->publicDealer = true;
      $this->setCmsParam(VC::CSV_PATH, $this->getCmsParam('dealCsvPath'));
    }

    return $this;
  }
}
