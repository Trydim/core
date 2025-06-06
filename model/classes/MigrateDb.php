<?php

class MigrateDb {
  const DEAL_LOGIN = 'deal';
  const DEAL_PASS = '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS';
  const ORDER_STATUS = 'order created';
  /**
   * @var string
   */
  private $prefix = '';

  /**
   * @var string
   */
  private $charset = 'utf8mb4';

  /**
   * Resources dump files list
   * @var string[]
   */
  private $resourceDumps = [];

  /**
   * @var Main
   */
  private $main;

  /**
   * @var Db
   */
  private $db;



  /**
   * @param string $prefix
   * @return string
   */
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
  private function alterUnique(string $table, string $column) {
    return $this->db->exec("ALTER TABLE `$table` ADD UNIQUE(`$column`)");
  }
  private function alterPrimaryAi(string $table, string $column = 'ID') {
    return $this->db->exec("ALTER TABLE `$table` MODIFY `$column` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1");
  }

  /**
   * @param Main $main
   * @param string $prefix
   */
  public function __construct(Main $main, string $prefix) {
    $this->main = $main;

    $this->prefix = $this->preparePrefix($prefix ?? $this->prefix);
    $this->db     = $main->db;
  }

  /*--------------------------------------------------------------------------------------------------------------------
    CATALOG
  --------------------------------------------------------------------------------------------------------------------*/

  public function createCodes() {
    $table = $this->pf('codes');
    $sql = "CREATE TABLE $table (
      `symbol_code` varchar(255) NOT NULL,
      `name` varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table, 'symbol_code');
    !$error && $error = $this->alterUnique($table, 'symbol_code');
    return $error;
  }
  public function createSection() {
    $table = $this->pf('section');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `parent_ID` int(10) UNSIGNED NOT NULL DEFAULT 0,
      `code` varchar(255) NOT NULL,
      `name` varchar(255) NOT NULL,
      `active` int(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterKey($table, 'parent_ID');
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createElements() {
    $table = $this->pf('elements');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `element_type_code` varchar(255) NOT NULL,
      `section_parent_id` int(10) UNSIGNED NOT NULL,
      `name` varchar(255) NOT NULL DEFAULT 'noname',
      `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      `activity` int(1) NOT NULL DEFAULT 1,
      `sort` int(11) NOT NULL DEFAULT 100
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterKey($table, 'element_type_code');
    !$error && $error = $this->alterKey($table, 'section_parent_id');
    !$error && $error = $this->alterPrimaryAi($table);

    if (!$error) {
      $sql = "ALTER TABLE `$table`
        ADD CONSTRAINT `elements_ibfk_3` FOREIGN KEY (`element_type_code`) REFERENCES `codes` (`symbol_code`),
        ADD CONSTRAINT `elements_ibfk_4` FOREIGN KEY (`section_parent_id`) REFERENCES `section` (`ID`) ON DELETE CASCADE;
      ";
      $error = $this->db->exec($sql);
    }

    return $error;
  }
  public function createMoney() {
    $table = $this->pf('money');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `code` varchar(10) NOT NULL,
      `name` varchar(100) NOT NULL,
      `short_name` varchar(5) NOT NULL,
      `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      `scale` int(11) NOT NULL DEFAULT 1,
      `rate` decimal(10,4) NOT NULL DEFAULT 1.0000,
      `main` int(1) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createUnits() {
    $table = $this->pf('units');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `name` varchar(255) NOT NULL,
      `short_name` varchar(10) NOT NULL,
      `activity` int(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createOptionsElements() {
    $table = $this->pf('options_elements');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `element_id` int(10) UNSIGNED NOT NULL,
      `money_input_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
      `money_output_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
      `unit_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
      `images_ids` varchar(255) DEFAULT NULL,
      `name` varchar(255) NOT NULL DEFAULT 'not name option',
      `properties` varchar(1000) DEFAULT NULL,
      `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      `activity` int(1) NOT NULL DEFAULT 1,
      `sort` int(10) NOT NULL DEFAULT 100,
      `input_price` decimal(10,4) NOT NULL DEFAULT 1.0000,
      `output_percent` double NOT NULL DEFAULT 1,
      `output_price` decimal(10,4) NOT NULL DEFAULT 1.0000
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterKey($table, 'element_id');
    !$error && $error = $this->alterKey($table, 'money_input_id');
    !$error && $error = $this->alterKey($table, 'unit_id');
    !$error && $error = $this->alterKey($table, 'money_output_id');
    !$error && $error = $this->alterPrimaryAi($table);

    if (!$error) {
      $sql = "ALTER TABLE `$table`
        ADD CONSTRAINT `options_elements_ibfk_1` FOREIGN KEY (`element_id`) REFERENCES `elements` (`ID`) ON DELETE CASCADE,
        ADD CONSTRAINT `options_elements_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`ID`),
        ADD CONSTRAINT `options_elements_ibfk_3` FOREIGN KEY (`money_input_id`) REFERENCES `money` (`ID`),
        ADD CONSTRAINT `options_elements_ibfk_4` FOREIGN KEY (`money_output_id`) REFERENCES `money` (`ID`);
      ";
      $error = $this->db->exec($sql);
    }

    return $error;
  }

  /*--------------------------------------------------------------------------------------------------------------------
    USERS + ORDERS
  --------------------------------------------------------------------------------------------------------------------*/

  public function createPermission() {
    $table = $this->pf('permission');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `name` varchar(50) NOT NULL,
      `properties` varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterUnique($table, 'name');
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createUsers() {
    $table = $this->pf('users');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `permission_id` int(10) UNSIGNED NOT NULL,
      `login` varchar(100) NOT NULL,
      `password` varchar(60) NOT NULL,
      `name` varchar(255) DEFAULT NULL,
      `contacts` varchar(1000) DEFAULT NULL,
      `register_date` timestamp NOT NULL DEFAULT current_timestamp(),
      `activity` int(1) NOT NULL DEFAULT 1,
      `customization` varchar(1000) DEFAULT '{}',
      `hash` varchar(60) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterKey($table, 'permission_id');
    !$error && $error = $this->alterPrimaryAi($table);

    if (!$error) {
      $refTable = $this->pf('permission');
      $sql = "ALTER TABLE `$table`
        ADD CONSTRAINT `$table\_$refTable` FOREIGN KEY (`permission_id`) REFERENCES `$refTable` (`ID`);
      ";
      $error = $this->db->exec($sql);
    }

    return $error;
  }
  public function createCustomers() {
    $table = $this->pf('customers');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `name` varchar(255) NOT NULL DEFAULT 'NoName',
      `ITN` varchar(15) DEFAULT NULL,
      `contacts` varchar(255) DEFAULT '{}'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createOrderStatus() {
    $table = $this->pf('order_status');
    $sql = "CREATE TABLE $table (
      `ID` int(2) UNSIGNED NOT NULL,
      `code` varchar(50) NULL DEFAULT NULL,
      `name` varchar(50) NOT NULL,
      `sort` int(4) DEFAULT 50 NULL,
      `required` int(1) DEFAULT 0 NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createOrders() {
    $table = $this->pf('orders');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
      `last_edit_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      `user_id` int(10) UNSIGNED DEFAULT NULL,
      `customer_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
      `total` float DEFAULT 0,
      `important_value` varchar(255) NOT NULL DEFAULT '{}',
      `status_id` int(2) UNSIGNED NOT NULL DEFAULT 1,
      `save_value` varchar(500) NOT NULL DEFAULT '{}',
      `report_value` mediumblob DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterKey($table, 'user_id');
    !$error && $error = $this->alterKey($table, 'status_id');
    !$error && $error = $this->alterKey($table, 'customer_id');
    !$error && $error = $this->alterPrimaryAi($table);

    if (!$error) {
      $refTable = $this->pf('users');
      $refTable1 = $this->pf('order_status');
      $refTable2 = $this->pf('customers');
      $sql = "ALTER TABLE `$table`
        ADD CONSTRAINT `$table\_$refTable` FOREIGN KEY (`user_id`) REFERENCES `$refTable` (`ID`),
        ADD CONSTRAINT `$table\_$refTable1` FOREIGN KEY (`status_id`) REFERENCES `$refTable1` (`ID`),
        ADD CONSTRAINT `$table\_$refTable2` FOREIGN KEY (`customer_id`) REFERENCES `$refTable2` (`ID`);
      ";
      $error = $this->db->exec($sql);
    }

    return $error;
  }

  /*--------------------------------------------------------------------------------------------------------------------
    OTHERS
  --------------------------------------------------------------------------------------------------------------------*/

  public function createClientOrders() {
    $table = $this->pf('client_orders');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `create_date` timestamp NULL DEFAULT current_timestamp(),
      `save_value` varchar(500) DEFAULT '{}',
      `important_value` varchar(255) DEFAULT '{}',
      `report_value` mediumblob DEFAULT NULL,
      `total` float DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }
  public function createFiles() {
    $table = $this->pf('files');
    $sql = "CREATE TABLE $table (
      `ID` int(10) UNSIGNED NOT NULL,
      `name` varchar(255) DEFAULT 'noName',
      `path` varchar(255) NOT NULL,
      `format` varchar(10) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $error = $this->db->exec($sql);
    !$error && $error = $this->alterPrimaryKey($table);
    !$error && $error = $this->alterPrimaryAi($table);
    return $error;
  }

  /*--------------------------------------------------------------------------------------------------------------------
    SIDES
  --------------------------------------------------------------------------------------------------------------------*/

  public function checkResourceDump(string $dir = 'resource'): bool {
    $path = ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR;

    array_map(function (string $file) use ($path) {
      if (includes($file, '.sql')) {
        $this->resourceDumps[] = $path . $file;
      }
    }, scandir($path));

    return count($this->resourceDumps) > 0;
  }
  public function seedingResourceDump() {
    foreach ($this->resourceDumps AS $path) {
      $sql = file_get_contents($path);
      $sql = str_replace('$prefix', $this->prefix, $sql);
      $this->db::exec($sql);
    }
  }

  public function addAdmin(string $login, string $pass) {
    $bean = $this->db::xdispense($this->pf('permission'));
    $bean->name = 'Администратор';
    $bean->properties = '{"menu":"","tags":"guard admin"}';
    $this->db->store($bean);

    $permId = $bean->getID();

    $bean = $this->db::xdispense($this->pf('users'));
    $bean->permission_id = $permId;
    $bean->login         = $login ?? $this::DEAL_LOGIN;
    $bean->password      = $pass ?? $this::DEAL_PASS;
    $bean->name          = $login ?? $this::DEAL_LOGIN;
    $this->db->store($bean);
  }

  /**
   * Update login after user migrate DB
   */
  public function updateAdmin(string $login, string $pass) {
    if ($login === '' || $pass === '') return;

    $bean = $this->db::xdispense($this->pf('users'));
    $bean->id       = '1';
    $bean->login    = $login ?? $this::DEAL_LOGIN;
    $bean->password = $pass ?? $this::DEAL_PASS;
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

  public function drop($prefix, int $deep = 0) {
    if ($deep === 3) return;

    $error = [];
    $tables = $this->db->getTables($prefix);

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
