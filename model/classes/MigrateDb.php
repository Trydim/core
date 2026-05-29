<?php

class MigrateDb {
  const DEAL_LOGIN   = 'deal';
  const DEAL_PASS    = '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS';
  const ORDER_STATUS = 'Order created';
  /**
   * Resources dump files list
   * @var string[]
   */
  private array $resourceDumps = [];

  private Main $main;

  private DbProxy $db;

  public function __construct(Main $main) {
    $this->main = $main;
    $this->db   = $main->db;
  }

  private function getPermissionId(): int
  {
    $bean = $this->db::findOne('permission', ' properties LIKE "%admin%" ');
    $permId = $bean->getID();

    if ($permId === '0') {
      $bean = $this->db::findOne('permission');
      $permId = $bean->getID();

      // Создать пользователя админа если нету в БД
      if ($permId === '0') {
        $bean = $this->db::xdispense('permission');
        $bean->name       = 'admin';
        $bean->properties = '{"tags":"admin"}';
        $permId = $bean->getID();
      }
    }

    return $permId;
  }

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

  public function addAdmin(int $dealerId, string $login, string $pass): void
  {
    $bean = $this->db::xdispense('users');
    $bean->dealer_id     = $dealerId;
    $bean->permission_id = $this->getPermissionId();
    $bean->login         = $login;
    $bean->password      = $pass;
    $bean->name          = $login;
    $this->db->store($bean);
  }

  public function updateAdmin(int $id, string $login, string $pass): void
  {
    if ($login === '' || $pass === '') return;

    $bean = $this->db::xdispense('users');
    $bean->id        = $id;
    $bean->login     = $login;
    $bean->password  = $pass;
    $this->db->store($bean);
  }

  public function drop(): void
  {
    // По всем таблицам пройти и удалить
  }
}
