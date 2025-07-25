<?php

class DealerMigrator
{
  const ORDER_MIGRATED_STATUS_ID = 16;
  private Main $main;
  private DbMain $db;
  private array $errors = [];
  private array $prefixMapping = [];
  private int $createdDealers = 0;
  private string $oldPrefix = '';
  private int $migratingDealerId;
  private array $managerIds = [];
  private array $oldCustomers = [];
  private array $dealer = [];


  /**
   * @param Main $main - экземпляр главного класса
   * @param int $migratingDealerId - ID дилера, откуда мигрируем
   * @param array $managerIds - массив ID менеджеров для миграции (если пустой - мигрируем всех)
   * @param array $excludeManagerIds - массив ID менеджеров которые исключаем из миграции
   * @throws Exception
   */
  public function __construct(Main $main, int $migratingDealerId, array $managerIds = [], array $excludeManagerIds = [1, 7])
  {
    try {
      $this->main = $main;
      $this->db = $main->getDB();
      $this->migratingDealerId = $migratingDealerId;

      // Удаляем исключаемые ID менеджеров которые перносить не нужно
      $this->managerIds = array_diff($managerIds, $excludeManagerIds);

      if (!$this->managerIds) {
        throw new Exception('managerIds is empty');
      }

      // Получаем все данные дилера
      $this->dealer = $this->getDealerData();
      $cmsParam = json_decode($this->dealer['cms_param'], true);
      $this->oldPrefix = $cmsParam['prefix'];

      if (!$this->oldPrefix) {
        throw new Exception('oldPrefix not found');
      }

    } catch (Exception $e) {
      $this->errors[] = "Constructor error: " . $e->getMessage();
      throw $e;
    }
  }

  /**
   * Получает все данные дилера из базы данных
   * @return array
   * @throws Exception
   */
  private function getDealerData(): array
  {
    try {
      $dealerData = $this->db->selectQuery('dealers', '*', "ID = {$this->migratingDealerId}");

      if (empty($dealerData[0])) {
        throw new Exception("Dealer with ID {$this->migratingDealerId} not found");
      }
      return $dealerData[0];
    } catch (Exception $e) {
      $this->errors[] = "getDealerData error: " . $e->getMessage();
      throw $e;
    }
  }


  private function migrateManagersToDealers(): void
  {
    try {
      $managers = $this->getActiveManagers();
      $legalEntities = $this->loadLegalEntities();

      foreach ($managers as $manager) {
        try {
          if ($this->isManagerMigrated($manager)) {
            $this->errors[] = "Manager {$manager['ID']} already migrated, skipping";
            continue;
          }

          $this->processManager($manager, $legalEntities);
        } catch (Exception $e) {
          $this->errors[] = "Error processing manager {$manager['ID']}: " . $e->getMessage();
          continue;
        }
      }

    } catch (Exception $e) {
      $this->errors[] = "migrateManagersToDealers error: " . $e->getMessage();
    }
  }

  /**
   * Проверяет, был ли менеджер уже мигрирован
   * @param array $manager
   * @return bool
   */
  private function isManagerMigrated(array $manager): bool
  {
    $customization = json_decode($manager['customization'] ?? '{}', true);
    return !empty($customization['migrated']['dealerId']);
  }


  /**
   * Получаем активных менеджеров (либо всех, либо только указанных в $this->managerIds)
   */
  private function getActiveManagers(): array
  {
    try {
      $usersTable = $this->oldPrefix . 'users';
      $where = 'activity=1';

      if (!empty($this->managerIds)) {
        $ids = implode(',', array_map('intval', $this->managerIds));
        $where .= " AND ID IN ({$ids})";
      }

      $managers = $this->db->selectQuery(
        $usersTable,
        ['ID', 'login', 'password', 'name', 'contacts', 'customization', 'hash'],
        $where
      );

      if (empty($managers)) {
        throw new Exception('No active managers found' .
          (!empty($this->managerIds) ? ' with specified IDs' : ''));
      }

      return $managers;
    } catch (Exception $e) {
      $this->errors[] = "getActiveManagers error: " . $e->getMessage();
      return [];
    }
  }

  /**
   * @throws Exception
   */
  private function loadLegalEntities(): array
  {
    try {
      $csvPath = ABS_SITE_PATH . "/dealer/{$this->migratingDealerId}/shared/csv/c_01_legal_entity_list.csv";
      $csvData = loadCSV(['id', 'name'], $csvPath);

      if (!is_array($csvData)) {
        throw new Exception('Failed to load legal entities: ' . $csvData);
      }

      $legalEntities = [];
      foreach ($csvData as $row) {
        if (isset($row['id'], $row['name'])) {
          $legalEntities[$row['id']] = $row['name'];
        }
      }
      return $legalEntities;
    } catch (Exception $e) {
      $this->errors[] = "loadLegalEntities error: " . $e->getMessage();
      throw $e;
    }
  }

  private function processManager($manager, $legalEntities): void
  {
    try {
      $contacts = json_decode($manager['contacts'] ?? '{}', true);

      $dealerNames = $this->resolveDealerNames($contacts['legal_value'], $legalEntities, $manager);

      if (!$dealerNames) {
        $this->errors[] = "Cannot resolve dealer name for manager {$manager['ID']}";
        return;
      }
      $dealerName = implode(',', $dealerNames);

      $dbPrefix = $this->generateUniquePrefix($dealerName);
      $dealerId = $this->createDealer($manager, $dealerName, $dbPrefix);
      $this->createDealerStructure($dealerId, $dealerNames, $dbPrefix, $manager);
      $this->createDefaultUser($dbPrefix, $manager);
      $this->markManagerAsMigrated($manager, $dealerId);

      $this->prefixMapping[$manager['ID']] = [
        'old_prefix' => $this->oldPrefix,
        'new_prefix' => $dbPrefix,
        'dealer_id' => $dealerId,
        'manager_id' => $manager['ID'],
        'dealer_name' => $dealerName,
        'timestamp' => date('Y-m-d H:i:s')
      ];

      $this->createdDealers++;

    } catch (Exception $e) {
      $this->errors[] = "Manager {$manager['ID']}: " . $e->getMessage();
    }
  }

  private function markManagerAsMigrated($manager, $dealerId): void
  {

    $usersTable = $this->oldPrefix . 'users';
    $customization = json_decode($manager['customization'] ?? '{}', true);

    $customization['migrated'] = [
      'dealerId' => $dealerId,
      'timestamp' => time()
    ];

    $deactivatedPass = password_hash('mig789', PASSWORD_BCRYPT);

    $param = [
      $manager['ID'] => [
        'activity' => 0, //деактивируем менеджера
        'customization' => json_encode($customization, JSON_HEX_APOS | JSON_HEX_QUOT),
        'password' => $deactivatedPass, //сбрасываем пароль
        'hash' =>  $deactivatedPass, //сбрасываем хэш
      ]
    ];

    $columns = $this->db->getColumnsTable($usersTable);
    $result = $this->db->insert($columns, $usersTable, $param, true);

    if (!empty($result['error'])) {
      $this->errors[] = 'Failed to mark manager as migrated: ' . json_encode($result['error']);
    }

  }

  private function resolveDealerNames($legalValue, $legalEntities, $manager): array
  {
    if (!$legalValue) {
      return [$manager['name']];
    }

    $dealerNames = [];

    if (is_array($legalValue)) {
      foreach ($legalValue as $v) {
        if (isset($legalEntities[$v])) {
          $dealerNames[] = $legalEntities[$v];
        } else {
          $this->errors[] = "Legal value {$v} not found for manager {$manager['ID']}";
        }
      }
    } else {
      if (isset($legalEntities[$legalValue])) {
        $dealerNames[] = $legalEntities[$legalValue];
      } else {
        $this->errors[] = "Legal value {$legalValue} not found for manager {$manager['ID']}";
      }
    }

    return !empty($dealerNames) ? $dealerNames : [$manager['name']];
  }

  private function generateUniquePrefix($dealerName)
  {
    $urlPrefix = strtolower(preg_replace('/[^a-zA-Z]/i', '', translit($dealerName)));
    $dbPrefix = substr($urlPrefix, 0, 3) . '_';

    $haveDealers = $this->db->selectQuery('dealers', 'cms_param');
    if (count($haveDealers)) {
      do {
        $findDealer = array_filter($haveDealers, function ($param) use ($dbPrefix) {
          $param = json_decode($param, true);
          return ($param['dbPrefix'] ?? $param['prefix'] ?? false) === $dbPrefix;
        });

        if (count($findDealer)) {
          $dbPrefix = substr($dbPrefix, 0, 3) . substr(uniqid(), -3, 3) . '_';
        }
      } while (count($findDealer));
    }

    return $dbPrefix;
  }

  /**
   * @throws \RedBeanPHP\RedException\SQL
   * @throws Exception
   */
  private function createDealer($manager, $dealerName, $dbPrefix)
  {
    try {
      $contacts = json_decode($manager['contacts'] ?? '{}', true);

      $param = [
        'name' => $dealerName,
        'cms_param' => json_encode([
          'urlPrefix' => strtolower(preg_replace('/[^a-zA-Z]/i', '', translit($dealerName))),
          'prefix' => $dbPrefix,
        ]),
        'contacts' => json_encode($this->dealer['contacts']),
        'activity' => 1,
        'settings' => $this->dealer['settings'],
      ];

      $columns = $this->db->getColumnsTable('dealers');

      if (empty($columns)) {
        throw new Exception('Failed to get dealers table columns');
      }

      $id = $this->db->getLastID('dealers', ['name' => 'tmp']);
      $insertResult = $this->db->insert($columns, 'dealers', [$id => $param], true);

      if (!$insertResult) {
        throw new Exception("Failed to insert dealer for manager {$manager['ID']}");
      }

      return $id;
    } catch (Exception $e) {
      $this->errors[] = "createDealer error for manager {$manager['ID']}: " . $e->getMessage();
    }
  }

  /**
   * @throws Exception
   */
  private function createDealerStructure($dealerId, $dealerNames, $dbPrefix, $manager): void
  {
    try {
      $dealerName = implode(',', $dealerNames);

      $login = 'admin';
      $pass = password_hash('admin789', PASSWORD_BCRYPT);

      $this->main->dealer->create($dealerId, [
        'dealerName' => $dealerName,
        'dbConfig' => $this->main->getSettings(VC::DB_CONFIG),
      ], [
        'prefix' => $dbPrefix,
        'login' => $login,
        'pass' => $pass
      ]);

      //Пересоздаем список юридических лиц
      $entityList = [['id', 'name', 'value', 'commission', 'margin']];

      foreach ($dealerNames as $i => $dealerName) {
        $entityList[] = [$i + 1, $dealerName, '', '', ''];
      }
      $csvEntityPath = ABS_SITE_PATH . "dealer/{$dealerId}/shared/csv/c_01_legal_entity_list.csv";

      $fileContent = '';

      foreach ($entityList as $v) {
        $fileContent .= implode(CSV_DELIMITER, $v) . PHP_EOL;
      }
      if ($fileContent) {
        file_put_contents($csvEntityPath, $fileContent);
      }

      //копируем settingSave.json
      $sourcePath = ABS_SITE_PATH . "dealer/{$this->migratingDealerId}/shared/settingSave.json";
      $destinationPath = ABS_SITE_PATH . "dealer/{$dealerId}/shared/settingSave.json";

      if (!copy($sourcePath, $destinationPath)) {
        $this->errors[] = "Failed to copy file from settingSave.json";
      }

      //Пересоздаем таблицы
      $this->migrateTables($dbPrefix);

    } catch (Exception $e) {
      $this->errors[] = "createDealerStructure error for dealer {$dealerId}: " . $e->getMessage();
    }
  }

  public function migrateTables($dbPrefix)
  {
    $migrateDb = new MigrateDb($this->main, $dbPrefix);

    // Таблицы
    $oldStatusTable = $this->oldPrefix . 'order_status';
    $newStatusTable = $dbPrefix . 'order_status';
    $ordersTable = $dbPrefix . 'orders';

    // Отключаем проверку внешних ключей
    $this->db->exec("SET FOREIGN_KEY_CHECKS = 0");

    try {
      // удаляем таблицы
      $this->db->exec("DROP TABLE IF EXISTS `$ordersTable`");
      $this->db->exec("DROP TABLE IF EXISTS `$newStatusTable`");

      // Создаем таблицы заново
      $migrateDb->createOrderStatus();
      $migrateDb->createOrders();

      // Получаем данные из старой таблицы с сортировкой по оригинальному ID
      $oldRows = $this->db->selectQuery($oldStatusTable, '*');
      // $columns = $this->db->getColumnsTable($oldStatusTable);

      //сохраняем ID
      foreach ($oldRows as $row) {

        $this->db->exec(
          "INSERT INTO `$newStatusTable` 
                (ID, code, name, sort, required) 
                VALUES (?, ?, ?, ?, ?)",
          [
            $row['ID'],
            $row['code'],
            $row['name'],
            $row['sort'],
            $row['required']
          ]
        );
      }

      // 2. Миграция таблицы permission
      $oldPermissionTable = $this->oldPrefix . 'permission';
      $newPermissionTable = $dbPrefix . 'permission';
      $usersTable = $dbPrefix . 'users';

      // Удаляем и создаем таблицы заново
      // $this->db->exec("DROP TABLE IF EXISTS `$usersTable`");
      $this->db->exec("DROP TABLE IF EXISTS `$newPermissionTable`");

      $migrateDb->createPermission();
      // $migrateDb->createUsers();

      // Переносим данные с сохранением ID
      $permissionRows = $this->db->selectQuery($oldPermissionTable, '*');
      foreach ($permissionRows as $row) {
        $this->db->exec(
          "INSERT INTO `$newPermissionTable` 
                (ID, name, properties) 
                VALUES (?, ?, ?)",
          [
            $row['ID'],
            $row['name'],
            $row['properties']
          ]
        );
      }

      // Устанавливаем AUTO_INCREMENT для обеих таблиц
      /*   $maxStatusId = $this->db->getCell("SELECT MAX(ID) FROM `$newStatusTable`");
         $this->db->exec("ALTER TABLE `$newStatusTable` AUTO_INCREMENT = " . ($maxStatusId + 1));

         $maxPermissionId = $this->db->getCell("SELECT MAX(ID) FROM `$newPermissionTable`");
         $this->db->exec("ALTER TABLE `$newPermissionTable` AUTO_INCREMENT = " . ($maxPermissionId + 1));*/

    } finally {
      // Включаем проверку внешних ключей обратно
      $this->db->exec("SET FOREIGN_KEY_CHECKS = 1");
    }
  }


  /**
   * @throws Exception
   */
  private function createDefaultUser($dbPrefix, $manager): void
  {
    try {
      $defaultLogin = $manager['login'] ?? 'manager_' . $manager['ID'];
      $defaultPass = $manager['password'] ?? password_hash('temp123', PASSWORD_BCRYPT);

      $defaultUser = $this->db->selectQuery($dbPrefix . 'users', 'ID', "login = '{$defaultLogin}'");

      if (empty($defaultUser)) {
        $defaultColumns = $this->db->getColumnsTable($dbPrefix . 'users');

        if (empty($defaultColumns)) {
          throw new Exception("Failed to get users table columns for prefix {$dbPrefix}");
        }

        $contacts = json_decode($manager['contacts'], true);
        $contacts['legal_value'] = "1";

        $defaultData = [
          'login' => $defaultLogin,
          'password' => $defaultPass,
          'name' => $manager['name'],
          'permission_id' => 1,
          'activity' => 1,
          'contacts' => json_encode($contacts),
          'customization' => $manager['customization'],
          'hash' => $defaultPass,
        ];

        $this->db->insert($defaultColumns, $dbPrefix . 'users', ['0' => $defaultData]);

      }
    } catch (Exception $e) {
      $this->errors[] = "createDefaultUser error for dealer login = {$defaultLogin}: " . $e->getMessage();
    }
  }


  private function copyOrders($managerId): int
  {
    $copiedOrders = 0;
    $columns = $this->db->getColumnsTable($this->oldPrefix . 'orders');

    try {
      if (!isset($this->prefixMapping[$managerId])) {
        throw new Exception("Manager {$managerId} not found in mapping");
      }

      $mapping = &$this->prefixMapping[$managerId];
      $dbPrefix = $mapping['new_prefix'];
      $newDealerId = $mapping['dealer_id'];
      $oldTable = $this->oldPrefix . 'orders';
      $newTable = $dbPrefix . 'orders';

      // Выбираем только те заказы, которые еще не мигрированы
      $orders = $this->db->selectQuery($oldTable, '*', "user_id = {$managerId} AND status_id != 16");
      $mapping['copied_order_ids'] = [];
      // Отключаем проверку внешних ключей
      $this->db->exec("SET FOREIGN_KEY_CHECKS = 0");

      foreach ($orders as $order) {
        try {
          $newOrder = $this->prepareOrderData($order, $dbPrefix, $newDealerId);
          //  Копируем заказ в новую таблицу
          //  $this->db->insert($columns, $newTable, ['0' => $newOrder]);

          $this->db->exec(
            "INSERT INTO `$newTable` (" . implode(', ', array_keys($newOrder)) . ") 
                 VALUES (" . str_repeat('?, ', count($newOrder) - 1) . "?)",
            array_values($newOrder)
          );

          // Обновляем статус у старого заказа
          // status code=migrated, ID=16,
          $this->db->exec("UPDATE `$oldTable` SET status_id = 16 WHERE ID = ?", [$order['ID']]);

          $mapping['copied_order_ids'][] = $newOrder['ID'];
          $copiedOrders++;
        } catch (Exception $e) {
          $this->errors[] = "Order {$order['ID']} copy failed: " . $e->getMessage();
          continue;
        }
      }

      // Включаем проверку внешних ключей обратно
      $this->db->exec("SET FOREIGN_KEY_CHECKS = 1");

      return $copiedOrders;
    } catch (Exception $e) {
      $this->errors[] = "copyOrders error for manager {$managerId}: " . $e->getMessage();
      return $copiedOrders;
    }
  }

  /**
   * @throws Exception
   */
  private function prepareOrderData($order, $dbPrefix, $newDealerId): array
  {

    try {
      $newOrder = [
        'ID' => $order['ID'],
        'create_date' => $order['create_date'],
        'last_edit_date' => $order['last_edit_date'],
        'user_id' => 2, //Всегда второй послезователь после админа
        'customer_id' => $this->getCustomerId((int)$order['customer_id'], $dbPrefix),
        'total' => $order['total'],
        'important_value' => $this->preparedImportantValue($newDealerId, $order),
        'status_id' => $order['status_id'],
        'save_value' => $order['save_value'],
        'report_value' => $order['report_value']
      ];

      return $newOrder;
    } catch (Exception $e) {
      $this->errors[] = "prepareOrderData error for order {$order['ID']}: " . $e->getMessage();
      throw $e;
    }
  }

  private function preparedImportantValue($newDealerId, $order)
  {
    $importantValue = json_decode($order['important_value'], true) ?? [];

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception("Invalid JSON in important_value");
    }

    $importantValue['dealerId'] = $newDealerId;

    if (isset($data['dealerKey'])) {
      $importantValue['dealerKey'] = $newDealerId .  ($importantValue['cpNumber'] ?? $order['ID']);
    }

    return json_encode($importantValue);
  }


  /**
   * @throws Exception
   */
  public function getCustomerId($oldCustomerId, $dbPrefix): int
  {
    //Загружаем и кэшируем по id старых клиентов
    if (!$this->oldCustomers) {
      $this->oldCustomers = [];

      $oldCustomers = $this->db->selectQuery($this->oldPrefix . 'customers', '*');

      foreach ($oldCustomers as $oldCustomer) {
        $id = $oldCustomer['ID'];
        unset($oldCustomer['ID']); // Удаляем поле ID из объекта
        $this->oldCustomers[$id] = $oldCustomer;
      }
    }

    $customerParam = $this->oldCustomers[$oldCustomerId];

    $customerData = $this->db->selectQuery(
      $dbPrefix . 'customers',
      '*',
      "name = {$this->db::getPDO()->quote($customerParam['name'])} AND contacts = {$this->db::getPDO()->quote($customerParam['contacts'])} LIMIT 1"
    );

    if (isset($customerData[0]) && $customerData[0]) {
      return (int)$customerData[0]['ID'];
    } else {
      $columns = $this->db->getColumnsTable($this->oldPrefix . 'customers');
      $result = $this->db->insert($columns, $dbPrefix . 'customers', [0 => $customerParam]);

      if ($result[$dbPrefix . 'customersId']) {
        return (int)$result[$dbPrefix . 'customersId'];
      }
    }

    throw new Exception('Failed to create a new customer');
  }

  /**
   * @throws Exception
   */
  private function migrateAllOrders(): int
  {
    $totalCopied = 0;

    foreach ($this->prefixMapping as $managerId => $mapping) {
      try {
        $copied = $this->copyOrders($managerId);
        $totalCopied += $copied;
        $this->prefixMapping[$managerId]['orders_copied'] = $copied;
      } catch (Exception $e) {
        $this->errors[] = "Order migration failed for manager {$managerId}: " . $e->getMessage();
        continue;
      }
    }


    return $totalCopied;
  }

  /**
   * @throws Exception
   */
  private function saveMigratedLog(): void
  {
    $mappingFile = ABS_SITE_PATH . '/dealer/manager_migrated_log' . date('Ymd_His') . '.json';
    $saveResult = file_put_contents($mappingFile, json_encode([
      'metadata' => [
        'created_at' => date('Y-m-d H:i:s'),
        'created_dealers' => $this->createdDealers,
        'errors_count' => count($this->errors),
        'migrating_dealer_id' => $this->migratingDealerId,
        'old_prefix' => $this->oldPrefix
      ],
      'mapping' => $this->prefixMapping,
      'errors' => $this->errors
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if (!$saveResult) {
      $this->errors[] = 'Failed to manager_migrated_log file';
    }

  }

  public function getResultMessage(): string
  {
    $resultMessage = "Successfully created {$this->createdDealers} dealers from managers.";
    if (!empty($this->errors)) {
      $resultMessage .= "\nEncountered " . count($this->errors) . " errors:\n" . implode("\n", $this->errors);
    }

    return $resultMessage;
  }

  /**
   * Основной метод миграции, который обрабатывает как дилеров, так и заказы
   * @return string
   * @throws Exception
   */

  public function migrate(): string
  {

    try {
      $this->migrateManagersToDealers();
      $totalCopied = $this->migrateAllOrders();
      $result = $this->getResultMessage();
      $result .= "\nCopied {$totalCopied} orders to new dealers";
    } catch (Exception $e) {
      $this->errors[] = 'Migration failed: ' . $e->getMessage();
      $result = $this->getResultMessage();
    }

    $this->saveMigratedLog();
    return $result;
  }

}