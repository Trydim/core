<?php

use RedBeanPHP\RedException\SQL;

trait DbOrders
{
  abstract protected function getDealerId(): int|string;

  private function getOrdersDbColumns(string $field): string
  {
    switch ($field) {
      default: return $field;
      case 'id': return 'O.id';
      case 'userName': return 'U.name';
      case 'customerName': return 'C.name';
      case 'statusId': return 'S.id';
      case 'status': return 'S.name';
    }
  }

  private function getBaseOrdersQuery(bool $includeValues = false): string
  {
    return "SELECT O.id AS 'id',
            create_date AS 'createDate', last_edit_date AS 'lastEditDate',
            U.id AS 'userId', U.name AS 'userName',
            C.id AS 'customerId', C.name AS 'customerName', C.contacts AS 'customerContacts',
            S.id AS 'statusId', S.name AS 'status', total,
            important_value AS 'importantValue'"
      . ($includeValues ? ", save_value AS 'saveValue', report_value AS 'reportValue'\n" : "\n") .
      "FROM orders O
      LEFT JOIN users U ON O.user_id = U.id
      LEFT JOIN customers C ON O.customer_id = C.id
      JOIN order_status S ON O.status_id = S.id
      WHERE O.dealer_id = " . $this->getDealerId() . "\n";
  }

  public function getBaseOrdersQueryColumns(): array
  {
    return [
      'id', 'createDate', 'lastEditDate',
      'userName',
      'customerId', 'customerName', 'customerContacts',
      'statusId', 'status',
      'importantValue', 'total'
    ];
  }

  /**
   * @param array{pageNumber: int, countPerPage: int, sortColumn: string, sortDirect: bool} $pageParam
   * @param array{
   *   dateCreateFrom?: string,
   *   dateCreateTo?  : string,
   *   dateEditedFrom?: string,
   *   dateEditedTo?  : string,
   *   userId?        : int|string,
   *   customerId?    : int|string,
   *   statusId?      : string|int|array<int|string>
   * } $filters
   * @return array<int, mixed>
   */
  public function loadOrders(array $pageParam, array $filters = []): array
  {
    $sql = $this->getBaseOrdersQuery();

    if (count($filters)) {
      $sql .= 'AND ';
      $connect = '';

      // Date range
      if (isset($filters['dateCreateFrom']) || isset($filters['dateCreateTo'])) {
        $from = $this->getDbDateString($filters['dateCreateFrom'] ?? self::DB_DATE_FROM);
        $to   = $this->getDbDateString($filters['dateCreateTo'] ?? self::DB_DATE_TO);
        $sql .= "(O.create_date BETWEEN '$from' AND '$to')\n";
        $connect = ' AND ';
      }
      else if (isset($filters['dateEditedFrom']) || isset($filters['dateEditedTo'])) {
        $from = $this->getDbDateString($filters['dateEditedFrom'] ?? self::DB_DATE_FROM);
        $to   = $this->getDbDateString($filters['dateEditedTo'] ?? self::DB_DATE_TO);
        $sql .= "(O.last_edit_date BETWEEN '$from' AND '$to')\n";
        $connect = ' AND ';
      }

      if (isset($filters['userId'])) {
        $userId = $filters['userId'];
        $sql .= $connect . '(O.user_id = ' . implode(' OR O.user_id = ', is_array($userId) ? $userId : [$userId]) . ')';
        $connect = ' AND ';
      }

      if (isset($filters['customerId'])) {
        $sql .= $connect . "O.customer_id = '" . $filters['customerId'] . "'";
        $connect = ' AND ';
      }

      // Status
      if (isset($filters['statusId']) && is_finite($filters['statusId'])) {
        $ids = $filters['statusId'];
        if (!is_array($ids)) $ids = [$ids];

        $sql .= $connect . "(O.status_id = " . implode(' OR O.status_id = ', $ids) . ")\n";
      }
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'id');
    $sql .= ' ' . $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  /**
   * load full information order
   * @param bool $oneOrder - if true, return one order and $ids must have one value.
   *
   * @throws InvalidArgumentException
   */
  public function loadOrdersById(array|int|string $ids, bool $oneOrder = false): array
  {
    $sql = $this->getBaseOrdersQuery(true) . "\n AND ";

    if ($oneOrder && is_array($ids)) {
      $ids = array_values($ids)[0];

      if (is_array($ids)) {
        throw new InvalidArgumentException(
          '[DbTraits:loadOrdersById]: First argument must be single-level array or string'
        );
      }
    }

    if (is_array($ids)) {
      $sql .= "(O.id = " . implode(' OR O.id = ', $ids) . ")\n";
      $res = self::getAll($sql);
    } else {
      $sql .= "O.id = :id";
      $res = [self::getRow($sql, [':id' => $ids])];
    }

    $res = array_map(function ($row) { return $this->jsonParseField($row); }, $res);

    return $oneOrder ? $res[0] : $res;
  }

  public function searchOrders(array $pageParam, string $searchValue, array $filters = [], bool $includeValues = false): array
  {
    $searchValue = '%' . $searchValue . '%';

    $sql = $this->getBaseOrdersQuery($includeValues);
    $sql .= "AND (O.id like '$searchValue' ";
    $sql .= "OR O.important_value like '$searchValue' ";
    $sql .= "OR C.contacts like '$searchValue' ";
    $sql .= "OR U.name like '$searchValue' ";
    $sql .= "OR C.name like '$searchValue')\n";

    // Date range
    if (isset($filters['dateCreateFrom']) || isset($filters['dateCreateTo'])) {
      $from = $this->getDbDateString($filters['dateCreateFrom'] ?? self::DB_DATE_FROM);
      $to   = $this->getDbDateString($filters['dateCreateTo'] ?? self::DB_DATE_TO);
      $sql .= "AND (O.create_date BETWEEN '$from' AND '$to')\n";
    }
    else if (isset($filters['dateEditedFrom']) || isset($filters['dateEditedTo'])) {
      $from = $this->getDbDateString($filters['dateEditedFrom'] ?? self::DB_DATE_FROM);
      $to   = $this->getDbDateString($filters['dateEditedTo'] ?? self::DB_DATE_TO);
      $sql .= "AND (O.last_edit_date BETWEEN '$from' AND '$to')\n";
    }

    if (isset($filters['userId'])) {
      $userId = $filters['userId'];
      $sql .= 'AND (O.user_id = ' . implode(' OR O.user_id = ', is_array($userId) ? $userId : [$userId]) . ') ';
    }

    // Status
    if (isset($filters['statusId']) && is_finite($filters['statusId'])) {
      $sql .= "\nAND O.status_id = '$filters[statusId]'\n";
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'id');
    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  public function changeOrders(array $columns, string $dbTable, array $commonValues, int $status_id): void
  {
    $param = [];

    array_map(function ($id) use (&$param, $status_id) {
      $param[$id] = [
        'status_id' => $status_id,
      ];
    }, array_values($commonValues));
    $this->insert($columns, $dbTable, $param, true);
  }

  private function getOrderStatusById(int $statusId): array
  {
    return self::getRow(
      'SELECT id, name
       FROM order_status
       WHERE id = :id AND (dealer_id = :dealerId OR dealer_id IS NULL)
       LIMIT 1',
      [':id' => $statusId, ':dealerId' => $this->getDealerId()]
    );
  }

  private function loadOrdersStatusForUpdate(array $orderIds): array
  {
    if (!count($orderIds)) return [];

    $sql = "SELECT O.id AS 'id',
                   O.status_id AS 'statusId',
                   S.name AS 'status'
            FROM orders O
            JOIN order_status S ON O.status_id = S.id
            WHERE O.dealer_id = ? AND O.id IN (" . self::genSlots($orderIds) . ")
            FOR UPDATE";

    return self::getAll($sql, array_merge([$this->getDealerId()], $orderIds));
  }

  private function updateOrdersStatus(array $orderIds, int $statusId): int
  {
    $sql = 'UPDATE orders
            SET status_id = ?
            WHERE dealer_id = ? AND id IN (' . self::genSlots($orderIds) . ')';

    return self::exec($sql, array_merge([$statusId, $this->getDealerId()], $orderIds));
  }

  private function saveOrderStatusHistory(array $orders, array $toStatus, array $author = []): int
  {
    $count = 0;
    $authorId = isset($author['id']) && is_numeric($author['id']) ? intval($author['id']) : null;
    $authorName = strval($author['name'] ?? '');
    $comment = isset($author['comment']) ? strval($author['comment']) : null;

    $sql = "INSERT INTO order_status_history (
              dealer_id,
              order_id,
              from_status_id,
              to_status_id,
              from_status_name,
              to_status_name,
              author_id,
              author_name,
              comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    foreach ($orders as $order) {
      if (intval($order['statusId']) === intval($toStatus['id'])) continue;

      self::exec($sql, [
        $this->getDealerId(),
        intval($order['id']),
        intval($order['statusId']),
        intval($toStatus['id']),
        $order['status'],
        $toStatus['name'],
        $authorId,
        $authorName,
        $comment,
      ]);

      $count++;
    }

    return $count;
  }

  public function changeOrdersStatus(array $orderIds, int $statusId, int $currentStatusId, array $author = []): array
  {
    if (!count($orderIds)) return ['error' => 'order_ids_error'];
    if ($statusId <= 0) return ['error' => 'status_id_error'];
    if ($currentStatusId <= 0) return ['error' => 'current_status_id_error'];

    try {
      self::begin();

      $toStatus = $this->getOrderStatusById($statusId);
      if (!count($toStatus)) throw new RuntimeException('status_id_error');

      $orders = $this->loadOrdersStatusForUpdate($orderIds);
      if (count($orders) !== count($orderIds)) throw new RuntimeException('orders_not_found_error');

      foreach ($orders as $order) {
        if (intval($order['statusId']) !== $currentStatusId) {
          throw new RuntimeException('current_status_is_not_equal_error');
        }
      }

      $changedOrders = array_values(array_filter($orders, function ($order) use ($statusId) {
        return intval($order['statusId']) !== $statusId;
      }));

      $changeCount = $this->updateOrdersStatus(
        array_map(function ($order) { return $order['id']; }, $changedOrders),
        $statusId
      );
      $historyCount = $this->saveOrderStatusHistory($changedOrders, $toStatus, $author);

      self::commit();

      return [
        'changeCount' => $changeCount,
        'historyCount' => $historyCount,
      ];
    } catch (Throwable $e) {
      self::rollback();

      return ['error' => $e->getMessage()];
    }
  }

  // Visitors
  //--------------------------------------------------------------------------------------------------------------------

  public function saveVisitorOrder(array $param): string|int
  {
    $bean = self::xdispense('client_orders');

    $bean->create_date = date($this::DB_DATE_FORMAT);
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    $bean->dealerId = $this->getDealerId();
    self::store($bean);

    return $bean->getID();
  }

  /**
   * @param array{pageNumber: int, countPerPage: int, sortColumn: string, sortDirect: bool} $pageParam
   */
  public function loadVisitorOrder(array $pageParam, array $dateRange = [], array $ids = []): ?array
  {
    $sql = "SELECT id, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            total
            FROM client_orders
            WHERE dealer_id = ?";

    $params = [$this->getDealerId()];

    if (count($dateRange)) $sql .= " AND create_date BETWEEN '$dateRange[0]' AND '$dateRange[1]'\n";
    if (count($ids)) {
      $sql .= " id IN (" . self::genSlots($ids) . ")\n";
      $params = array_merge($params, $ids);
    }

    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql, $params));
  }

  public function loadVisitorOrderById(string $id): array
  {
    $sql = "SELECT id, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            report_value AS 'reportValue',
            total
            FROM client_orders\n
            WHERE dealer_id = :dealerId AND id = :id";

    return $this->jsonParseField(self::getRow($sql, [':dealerId' => $this->getDealerId(), ':id' => $id]));
  }

  public function searchVisitorOrders(array $pageParam, string $searchValue): array
  {
    $searchValue = '%' . $searchValue . '%';

    $sql = "SELECT id, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            total
            FROM client_orders\n
            WHERE dealer_id = :dealerId AND (id like '$searchValue' OR importantValue like '$searchValue')";

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'id');
    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql, [':dealerId' => $this->getDealerId()]));
  }

  // Status
  //--------------------------------------------------------------------------------------------------------------------

  public function loadOrderStatus(string $filters = ''): array
  {
    $sqlMain = "SELECT id, code, name, sort, required FROM order_status
                WHERE dealer_id";
    $sqlFilter = strlen($filters) ? " AND $filters\n" : "\n";

    $sql = $sqlMain . " = :dealerId" . $sqlFilter . "ORDER BY sort, id";
    $result = self::getAll($sql, [':dealerId' => $this->getDealerId()]);

    if (count($result)) return $result;

    $sql = $sqlMain . " IS NULL" . $sqlFilter . "ORDER BY sort, id";
    return self::getAll($sql);
  }
}

trait DbUsers
{
  const USER_GOD_LOGIN = 'e00f45459361fb47c8c449483b7edaec';
  const USER_GOD_PASS  = '71fa970c7b3a28956dad879a7abc12c4';

  abstract protected function getDealerId(): int|string;

  private function getUserDbColumns(string $field): string
  {
    switch ($field) {
      default: return $field;
      case 'id': return 'U.id';
      case 'name': return 'U.name';
      case 'permissionName': return 'P.name';
    }
  }

  private function getRootUser(?string $login = null): array
  {
    $sql = "SELECT id, login, password,
                   name, contacts, activity,
                   register_date AS 'registerDate', customization, hash,
                   'root' AS 'userType',
                   '1' AS 'permissionId', 'root' AS 'permissionName', '{\"tags\":\"admin\"}' AS 'permissionValue'
            FROM root_users
            WHERE activity = 1\n";

    $param = [];
    if ($login) {
      $sql .= "AND login = :login\n";
      $param = [':login' => $login];
    }

    $sql .= "LIMIT 1";
    return $this->jsonParseField(self::getRow($sql, $param));
  }

  private function getUser(array $filter = []): array
  {
    $sql = "SELECT U.id AS 'id', U.dealer_id AS 'dealerId',
                   login, password, hash,
                   U.name as 'name', contacts, customization, 
                   U.register_date AS 'registerDate', activity,
                   'user' AS 'userType',
                   P.id AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
            FROM users U
            JOIN permission P on U.permission_id = P.id 
            WHERE U.dealer_id = :dealerId ";

    $param = [':dealerId' => $this->getDealerId()];
    if (isset($filter['id']) ) {
      $sql .= ' AND U.id = :id ';
      $param[':id'] = $filter['id'];
    }

    if (isset($filter['login'])) {
      $sql .= ' AND login = :login ';
      $param[':login'] = $filter['login'];
    }

    $sql .= "LIMIT 1";

    return $this->jsonParseField(self::getRow($sql, $param));
  }

  public function getUserFromFile(string $login = '', string $password = '', bool $status = false): bool|array
  {
    if (file_exists(SYSTEM_PATH)) {
      $value = file(SYSTEM_PATH)[0];
      $value && $value = explode('|||', $value);
      $this->login = [$value[0], $value[1]];

      if (($value[0] === $login && $value[1] === $password) || $status) {
        return [
          'id'    => 1,
          'login' => $value[0],
          'name'  => $value[0],
        ];
      } else return false;
    } else {
      file_put_contents(SYSTEM_PATH, '');
      // Сделать регистрацию при первом разе
      return false;
    }
  }

  public function getUserById(int $userId): array
  {
    return $this->getUser(['id' => $userId]);
  }

  public function getUserByOrderId(int|string $orderId): ?array
  {
    return $this->jsonParseField(self::getRow(
      "SELECT U.id AS 'id', U.name AS 'name', U.contacts AS 'contacts',
                  P.id AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
       FROM users U
       JOIN permission P on U.permission_id = P.id
       JOIN orders O ON U.id = O.user_id
       WHERE O.id = :id AND O.dealer_id = :dealerId",
      [':id' => $orderId, ':dealerId' => $this->getDealerId()]
    ));
  }

  public function checkPassword(string $login, string $password): array|bool
  {
    if (USE_DATABASE) {
      // God mode
      if (md5($login) === self::USER_GOD_LOGIN && md5($password) === self::USER_GOD_PASS) {
        return $this->main->isDealer() ? $this->getUser()
                                       : $this->getRootUser();
      }

      $user = $this->getUser(['login' => $login]);
    } else {
      return $this->getUserFromFile($login, $password);
    }

    if (!$this->main->isDealer() && !count($user)) {
      $user = $this->getRootUser($login);
    }

    if (count($user) && password_verify($password, $user['password'])) return $user;

    return false;
  }

  public function findToken(string $token): array
  {
    $sql = "SELECT id, name, login, password
            FROM users WHERE contacts LIKE :contacts and activity = 1";
    return self::getRow($sql, [':contacts' => "%$token%"]);
  }

  /**
   * @throws SQL
   */
  public function changeUser(int|string $loginId, array $param): void
  {
    $user = self::findOne('users', ' id = ? AND dealer_id = ? ', [$loginId, $this->getDealerId()]);
    if ($user === null || intval($user->id) === 0) return;

    foreach ($param as $key => $value) {
      if (in_array($key, ['id', 'dealer_id', 'dealerId'], true)) continue;
      $user->$key = $value;
    }

    $user->dealerId = $this->getDealerId();
    self::store($user);
  }

  /**
   * @param array{pageNumber?: int, countPerPage?: int, sortColumn?: string, sortDirect?: bool} $pageParam
   */
  public function loadUsers(array $pageParam): array
  {
    $sql = "SELECT U.id AS 'id', login, U.name AS 'name', contacts,
                   permission_id AS 'permissionId', P.name AS 'permissionName',
                   register_date AS 'registerDate', activity
            FROM users U
            LEFT JOIN permission P ON U.permission_id = P.id
            WHERE U.dealer_id = :dealerId AND U.activity = 1\n";

    $pageParam['sortColumn'] = $this->getUserDbColumns($pageParam['sortColumn'] ?? 'id');

    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql, [':dealerId' => $this->getDealerId()]));
  }

  public function setUserHash(int|string $loginId, string $hash, string $userType = 'user'): void
  {
    if (USE_DATABASE) {
      $user = self::xdispense($userType === 'root' ? 'root_users' : 'users');
      $user->id = $loginId;
      $user->hash = $hash;
      self::store($user);
    } else {
      !$this->login && $this->getUserFromFile();
      $data = $this->login . '|||' . $hash;
      file_put_contents(SYSTEM_PATH, $data);
    }
  }

  public function checkUserHash(array $session): bool|array
  {
    if (USE_DATABASE) {
      $userType = $session['userType'] ?? 'user';
      $user = $userType === 'root' ? $this->getRootUser($session['login'])
                                   : $this->getUserById($session['id']);

      if (!count($user) || !boolValue($user['activity'])) return false;

      $user['permissionId'] = intval($user['permissionId']);
      $user['onlyOne'] = $user['customization']['onlyOne'] ?? false;
    } else {
      try {
        if (!file_exists(SYSTEM_PATH)) throw new ErrorException('[DbTraits:checkUserHash]: User file not found');
        $value = file(SYSTEM_PATH);
        $value && $value = explode('|||', $value[0]);
        if (count($value) < 2) throw new ErrorException('[DbTraits:checkUserHash]: User file contains errors');
      } catch (ErrorException $e) {
        file_put_contents(SYSTEM_PATH, 'admin|||123|||');
        return false;
      }
      $user = [
        'onlyOne'  => true,
        'admin'    => true,
        'password' => $value[1],
        'hash'     => trim($value[2]),
      ];
    }

    if (isset($session['token']) && isset($user['contacts']['token'])) {
      $ok = $session['token'] === $user['contacts']['token'];
    } else {
      $ok = $user['onlyOne'] ? $session['hash'] === $user['hash']
                             : password_verify($session['password'], $user['password'])
                               ||
                               md5($session['password']) === self::USER_GOD_PASS;
    }

    return $ok ? $user : false;
  }

  public function getUserSetting(string $currentUser = '')
  {
    $currentUser = $currentUser ?: $this->main->getLogin();
    $user = self::findOne('users', ' login = ? AND dealer_id = ? ', [$currentUser, $this->getDealerId()]);

    if ($user === null || intval($user->id) === 0) return json_decode('{}');
    return json_decode($user->customization ?: '{}');
  }

  public function loadPermission(): array
  {
    $sqlMain = "SELECT id, dealer_id AS 'dealerId', name, properties
            FROM permission
            WHERE dealer_id";

    $result = $this->jsonParseField(self::getAll($sqlMain . " = :dealerId", [':dealerId' => $this->getDealerId()]));
    if (count($result)) return $result;

    return $this->jsonParseField(self::getAll($sqlMain . " IS NULL"));
  }
}

trait DbCsv
{
  private string $csvTable;

  abstract protected function getDealerId(): int|string;

  public function setCsvTable(string $path): void
  {
    $this->csvTable = substr($path, 1);
  }

  /**
   * сделать поиск всех файлов, наверное. (хотя если их много переходить на БД, наверное)
   */
  public function scanDirCsv(string $path, string $link = ''): array
  {
    return array_reduce(is_dir($path) ? scandir($path) : [], function ($r, $item) use ($link) {
      if (!($item === '.' || $item === '..')) {
        if (stripos($item, '.csv')) {
          $r[] = [
            'fileName' => $item,
            'name'     => str_replace('.csv', '', $item),
          ];
        } else {
          $csvPath = $this->main->getCmsParam(VC::CSV_PATH);
          $link && $link .= '/';
          if (filetype($csvPath . $link . $item) === 'dir') {
            $r[$item] = $this->scanDirCsv($csvPath . $link . $item, $link . $item);
          }
        }
      }

      return $r;
    }, []);
  }

  public function openCsv(): array
  {
    $result = [];
    $csvPath = $this->main->getCmsParam(VC::CSV_PATH) . $this->csvTable;

    if (file_exists($csvPath)) {
      if ($file = fopen($csvPath, 'rt')) {
        while ($cells = fgetcsv($file, CSV_STRING_LENGTH, CSV_DELIMITER, "\"", "\\")) $result[] = $cells;
        fclose($file);
      }
    }

    return $result;
  }

  public function fileForceDownload(): void
  {
    $file = $this->main->getCmsParam(VC::CSV_PATH) . $this->csvTable;

    if (file_exists($file)) {
      // сбрасываем буфер вывода PHP, чтобы избежать переполнения памяти выделенной под скрипт
      // если этого не сделать файл будет читаться в память полностью!
      if (ob_get_level()) {
        ob_end_clean();
      }
      // заставляем браузер показать окно сохранения файла
      header('Content-Description: File Transfer');
      header('Content-Type: application/octet-stream');
      header('Content-Disposition: attachment; filename=' . basename($file));
      header('Content-Transfer-Encoding: binary');
      header('Expires: 0');
      header('Cache-Control: must-revalidate');
      header('Pragma: public');
      header('Content-Length: ' . filesize($file));
      // читаем файл и отправляем его пользователю
      readfile($file);
      exit;
    }
  }

  public function saveCsv(array $csvData): static
  {
    $main = $this->main;
    $csvPath = $main->getCmsParam(VC::CSV_PATH);
    $csvHistoryPath = $main->getCmsParam(VC::CSV_HISTORY_PATH);

    if (file_exists($csvPath . $this->csvTable)) {
      $fileContent = '';

      foreach ($csvData as $v) {
        $fileContent .= implode(CSV_DELIMITER, $v) . PHP_EOL;
      }

      if ($main->getCmsParam(VC::SAVE_CHANGE_HISTORY)) {
        $history = new CsvHistory($csvPath, $csvHistoryPath);
        $metaFields = [
          'userId'    => (int)$main->getLogin('id'),
          'userName'  => $main->getLogin('name'),
          'userLogin' => $main->getLogin(),
        ];

        $history->saveBackup($this->csvTable, $fileContent, $metaFields);
      }

      file_put_contents($csvPath . $this->csvTable, $fileContent);
    }

    return $this;
  }
}

trait ContentEditor
{
  private string $CONTENT_PATH = SHARE_PATH . 'content.json';
  private string $contentData = '{}';
  private mixed $contentLoaded;

  abstract protected function getDealerId(): int|string;

  private function contentPath(): string
  {
    $path = $this->main->publicDealer ? $this->main->url->getPath(true) : $this->main->url->getBasePath(true);

    return $path . $this->CONTENT_PATH;
  }

  private function checkContentFile(): void
  {
    $path = $this->contentPath();

    if (!file_exists($path)) {
      file_put_contents($path, $this->contentData);
    }
  }

  public function loadContentEditorData(bool $jsonDecode = false, bool $assoc = false): mixed
  {
    $this->checkContentFile();

    $data = file_get_contents($this->contentPath());

    return $jsonDecode ? json_decode($data, $assoc) : $data;
  }

  public function saveContentEditorData($data): bool|int
  {
    $this->checkContentFile();

    if (!is_string($data)) $data = json_encode($data);

    return file_put_contents($this->contentPath(), $data);
  }

  public function mergeContentData(): void
  {
    $this->contentLoaded = $this->getContentData(false);
  }

  public function getContentData(bool $flatten = true, bool $assoc = false): array
  {
    $data = $this->loadContentEditorData(true, true);

    if (isset($this->contentLoaded) && is_array($this->contentLoaded)) {
      $data = array_merge($data, $this->contentLoaded);
    }

    if ($flatten) {
      $locale = $this->main->getTargetLang();

      $data = array_reduce($data, function($r, $section) use ($locale, $assoc) {
        foreach ($section['fields'] as $key => $value) {
          $value = $value['value_' . $locale] ?? $value['value'];

          if ($assoc) $r[$key] = $value;
          else $r[] = [
            'id' => $key,
            'value' => $value,
          ];
        }

        return $r;
      }, []);
    }

    return $data;
  }
}
