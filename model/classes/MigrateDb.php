<?php

class MigrateDb {
  const DEAL_LOGIN   = 'deal';
  const DEAL_PASS    = '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS';
  const ORDER_STATUS = 'Order created';

  //private string $charset = 'utf8mb4';

  /**
   * Resources dump files list
   * @var string[]
   */
  private array $resourceDumps = [];

  private Main $main;

  private DbProxy $db;

  private function alterPrimaryKey(string $table, string $column = 'id'): int
  {
    return $this->db->exec("ALTER TABLE `$table` ADD PRIMARY KEY (`$column`)");
  }
  private function alterKey(string $table, string $column = 'id'): int
  {
    return $this->db->exec("ALTER TABLE `$table` ADD KEY `$column` (`$column`)");
  }
  private function alterUnique(string $table, string $column): int
  {
    return $this->db->exec("ALTER TABLE `$table` ADD UNIQUE(`$column`)");
  }
  private function alterPrimaryAi(string $table, string $column = 'id'): int {
    return $this->db->exec("ALTER TABLE `$table` MODIFY `$column` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1");
  }

  public function __construct(Main $main) {
    $this->main = $main;
    $this->db   = $main->db;
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
      $this->db::exec($sql);
    }
  }

  public function addAdmin(string $login, string $pass): void
  {
    $bean = $this->db::xdispense('permission');
    $permId = $bean->getID();

    $bean = $this->db::xdispense('users');
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

    $bean = $this->db::xdispense('users');
    $bean->id       = '1';
    $bean->login    = $login;
    $bean->password = $pass;
    $this->db->store($bean);
  }



  public function drop(): void
  {
    // По всем таблицам пройти и удалить
  }
}
