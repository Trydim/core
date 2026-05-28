<?php

class MigrateDb {
  const DEAL_LOGIN = 'deal';
  const DEAL_PASS = '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS';
  const ORDER_STATUS = 'Order created';
  /**
   * @var string
   */
  private $prefix;

  //private string $charset = 'utf8mb4';

  /**
   * Resources dump files list
   * @var string[]
   */
  private array $resourceDumps = [];

  private Main $main;

  private DbProxy $db;

  private function preparePrefix(string $prefix): string {
    return str_replace('_', '', $prefix) . '_';
  }
  /**
   * set Table with Prefix
   * @param string $table
   * @return string
   */
  private function pf(string $table): string {
    return $this->prefix . str_replace($this->prefix, '', $table);
  }

  private function alterPrimaryKey(string $table, string $column = 'ID') {
    return $this->db->exec("ALTER TABLE `$table` ADD PRIMARY KEY (`$column`)");
  }
  private function alterKey(string $table, string $column = 'ID') {
    return $this->db->exec("ALTER TABLE `$table` ADD KEY `$column` (`$column`)");
  }
  private function alterUnique(string $table, string $column): int
  {
    return $this->db->exec("ALTER TABLE `$table` ADD UNIQUE(`$column`)");
  }
  private function alterPrimaryAi(string $table, string $column = 'ID') {
    return $this->db->exec("ALTER TABLE `$table` MODIFY `$column` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1");
  }

  public function __construct(Main $main) {
    $this->main = $main;

    $this->prefix = $this->preparePrefix($prefix);
    $this->db     = $main->db;
  }

  //  SIDES
  //--------------------------------------------------------------------------------------------------------------------

  public function checkResourceDump(string $dir = 'resource'): bool {
    $path = ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR;

    array_map(function (string $file) use ($path) {
      if (includes($file, '.sql')) {
        $this->resourceDumps[] = $path . $file;
      }
    }, scandir($path));

    return count($this->resourceDumps) > 0;
  }
  public function seedingResourceDump(): void
  {
    foreach ($this->resourceDumps AS $path) {
      $sql = file_get_contents($path);
      $sql = str_replace('$prefix', $this->prefix, $sql);
      $this->db::exec($sql);
    }
  }

  public function addAdmin(string $login, string $pass): void
  {
    $bean = $this->db::xdispense($this->pf('permission'));
    $bean->name = 'Администратор';
    $bean->properties = '{"menu":"","tags":"guard admin"}';
    $this->db->store($bean);

    $permId = $bean->getID();

    $bean = $this->db::xdispense($this->pf('users'));
    $bean->permission_id = $permId;
    $bean->login         = $login;
    $bean->password      = $pass;
    $bean->name          = $login;
    $this->db->store($bean);
  }

  /**
   * Update login after user migrate DB
   */
  public function updateAdmin(string $login, string $pass): void
  {
    if ($login === '' || $pass === '') return;

    $bean = $this->db::xdispense($this->pf('users'));
    $bean->id       = '1';
    $bean->login    = $login;
    $bean->password = $pass;
    $this->db->store($bean);
  }
  public function addStatus(array $rows) {
    $bean = $this->db::xdispense($this->pf('order_status'));

    if (count($rows)) {
      foreach ($rows AS $row) {
        foreach ($row AS $column => $value) {
          $bean->$column = $value;
        }
        $this->db->store($bean);
      }
    }

    $bean->name = $this::ORDER_STATUS;
    $this->db->store($bean);
  }
  public function addMoneyRate() {
    $rows = [
      [
        'code' => 'USD',
        'name' => 'United State Dollar',
        'short_name' => '$',
        'main' => 1,
      ],
      [
        'code' => 'EUR',
        'name' => 'Euro',
        'short_name' => '€',
      ],
      [
        'code' => 'RUB',
        'name' => 'Российский рубль',
        'short_name' => 'руб.',
        'scale' => 100,
      ],
      [
        'code' => 'BYN',
        'name' => 'Белорусский рубль',
        'short_name' => 'руб.',
      ],
    ];

    foreach ($rows AS $row) {
      $bean = $this->db::xdispense($this->pf('money'));
      foreach ($row AS $column => $value) {
        $bean->$column = $value;
      }
      $this->db->store($bean);
    }
  }

  public function drop(string $prefix, int $deep = 0) {
    if (strlen($prefix) < 4 || $deep === 3) return;

    $error = [];
    $tables = $this->db->getTables($prefix);
    // Safe condition
    if (count($tables) > 8) return;

    foreach ($tables as $prop) {
      $table = $prop['dbTable'];
      try {
        $this->db->exec("DROP TABLE `$table`");
      } catch (Exception $e) {
        $error[] = $e->getMessage();
      }
    }

    if (count($error)) $this->drop($prefix, $deep + 1);
  }
}
