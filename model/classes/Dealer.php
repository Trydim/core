<?php

class Dealer {
  const FOLDER = ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR;
  const RESOURCES = Dealer::FOLDER . 'resource' . DIRECTORY_SEPARATOR;

  private Main $main;

  private string $dealerDir;
  private string $dealerPath;

  /**
   * @var string
   */
  private $prefix;
  private MigrateDb $migrateDb;

  public function __construct($main) {
    $this->main = $main;
  }

  private function setParam(string $id, string $dbPrefix) {
    $this->dealerDir  = $this::FOLDER . $id;
    $this->dealerPath = $this->dealerDir . DIRECTORY_SEPARATOR;

    $this->prefix     = $dbPrefix;
  }
  private function createFolderDealers(): void
  {
    if (!is_dir($this::FOLDER)) {
      try {
        mkdir($this::FOLDER);
      } catch (\ErrorException $e) {
        throw new \RuntimeException('[Dealer:createFolderDealers]: Dealer folder not created!', 0, $e);
      }
    }
  }
  private function createFolder(): void
  {
    if (is_dir($this->dealerDir)) throw new \RuntimeException('[Dealer:createFolder]: Dealer folder exist!');

    try {
      mkdir($this->dealerDir);
    } catch (\Exception $e) {
      throw new \RuntimeException("[Dealer:createFolder]: $this->dealerDir folder not created", 0, $e);
    }
  }
  private function checkFolder(): bool {
    if (!is_dir($this->dealerDir)) throw new \RuntimeException("[Dealer:checkFolder]: $this->dealerDir folder does not exist!");

    return true;
  }
  private function copy(string $src, string $dst): void
  {
    $sep = DIRECTORY_SEPARATOR;
    $dir = opendir($src);

    if (!is_dir($dst)) mkdir($dst);
    while ($file = readdir($dir)) {
      if (in_array($file, ['.', '..'])) continue;

      if (is_dir($src . $sep . $file)) {
        $this->copy($src . $sep . $file, $dst . $sep . $file);
      } else {
        copy($src . $sep . $file, $dst . $sep . $file);
      }
    }
    closedir($dir);
  }
  private function copyFiles(array $folders = ['lang', 'public', 'shared']): void
  {
    try {
      foreach ($folders as $dir) {
        $this->copy($this::RESOURCES . $dir, $this->dealerPath . $dir);
      }
    } catch (\Exception $e) {
      throw new \RuntimeException('[Dealer:copyFiles]: Error copying resources', 0, $e);
    }
  }
  private function createConfig(array $params): void
  {
    $config = file_get_contents($this::RESOURCES . 'config.php');
    if (!$config) throw new \RuntimeException('[Dealer:createConfig]: Dealer configuration file does not exist!');

    $setParam = function ($paramName, $params) use (&$config) {
      $value = is_array($params) ? $params[$paramName] : $params;
      $config = str_replace('$' . $paramName, $value, $config);
    };

    $setParam('dealerName', $params);
    $setParam('prefix', $this->prefix);

    foreach (['dbHost', 'dbName', 'dbUsername', 'dbPass'] as $key) {
      $setParam($key, $params[VC::DB_CONFIG]);
    }

    file_put_contents($this->dealerPath . 'config.php', $config);
  }

  private function updateDb(array $param): void
  {
    $this->migrateDb = new MigrateDb($this->main, $param['prefix']);

    $this->migrateDb->createMoney();
    $this->migrateDb->createFiles();

    $this->migrateDb->createCustomers();
    $this->migrateDb->createPermission();
    $this->migrateDb->createUsers();
    $this->migrateDb->createOrderStatus();
    $this->migrateDb->createOrders();
    $this->migrateDb->createClientOrders();

    if ($this->migrateDb->checkResourceDump()) {
      $this->migrateDb->seedingResourceDump();
      $this->migrateDb->updateAdmin($param['login'], $param['pass']);
    } else {
      $this->migrateDb->addAdmin($param['login'], $param['pass']);
      $this->migrateDb->addStatus($param['status'] ?? []);
      $this->migrateDb->addMoneyRate($param['money'] ?? []);
    }
  }

  public function create(int|string $id, array $configParam, array $dbParam): void
  {
    $this->main->fireHook(VC::HOOKS_DEALERS_BEFORE_CREATE, $this, $configParam, $dbParam);

    $this->setParam($id, $dbParam['prefix']);
    $this->createFolderDealers();
    $this->createFolder();
    $this->copyFiles();
    $this->createConfig($configParam);

    $this->updateDb($dbParam);

    $this->main->fireHook(VC::HOOKS_DEALERS_AFTER_CREATE, $this);
  }

  public function update($id) {
    $this->setParam($id, '');
    if (!is_dir($this->dealerDir)) $this->createFolder();
    $this->copyFiles(['public']);

    return $id;
  }

  public function drop(string $id, string $prefix): int {
    if (is_dir($path = $this::FOLDER . $id)) {
      removeFolder($path);
    }

    // Drop all tables with prefix
    if ($prefix !== '') {
      $prefix = str_replace('_', '\_', $prefix);

      $this->migrateDb = new MigrateDb($this->main, $prefix);
      $this->migrateDb->drop($prefix);

      // Remove dealer
      return $this->main->db->deleteItem('dealers', [$id]);
    }

    return 0;
  }

  //
  //--------------------------------------------------------------------------------------------------------------------

  public function updateDatabase(array $selectedDealer, string $sqlText): array {
    $report = [
      'error' => [],
      'complete' => [],
    ];
    $sqlQueryList = explode('###', $sqlText);

    foreach ($this->main->db->loadDealers(false, false) as $dealer) {
      if (count($selectedDealer) && !in_array($dealer['id'], $selectedDealer)) continue;

      $prefix = $dealer['cmsParam']['prefix'];

      if (empty($prefix)) { $report['error'][] = "Error: prefix doesn't exist - " . $dealer['id']; continue; }

      foreach ($sqlQueryList as $sql) {
        $sql = str_replace('$prefix', $prefix, $sql);
        $result = $this->main->db->execQuery($sql);
      }

      if (is_finite($result)) $report['complete'][] = "Complete for dealer " . $dealer['id'] . ": " . $prefix;
    }

    return $report;
  }
}
