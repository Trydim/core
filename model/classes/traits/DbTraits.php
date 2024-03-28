<?php

trait DbOrders {
  private function getOrdersDbColumns(string $field): string {
    switch ($field) {
      default: return $field;
      case 'id': case 'ID': return 'O.ID';
      case 'userName': return 'U.name';
      case 'customerName': return 'C.name';
      case 'statusId': return 'S.ID';
      case 'status': return 'S.name';
    }
  }

  private function getBaseOrdersQuery(bool $includeValues = false): string {
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

  public function getBaseOrdersQueryColumns(): array {
    return [
      'ID', 'createDate', 'lastEditDate',
      'userName',
      'customerId', 'customerName', 'customerContacts',
      'statusId', 'status',
      'importantValue', 'total'
    ];
  }

  /**
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   * @param ?array $filters<br>
   * $filters['dateCreateFrom'] - date<br>
   * $filters['dateCreateTo']   - date<br>
   * $filters['dateEditedFrom'] - date<br>
   * $filters['dateEditedTo']   - date<br>
   *
   * @return array
   */
  public function loadOrders(array $pageParam, array $filters = []): array {
    $sql = $this->getBaseOrdersQuery();

    if (count($filters)) {
      $sql .= 'WHERE ';

      // Date range
      if (isset($filters['dateCreateFrom']) || isset($filters['dateCreateTo'])) {
        $from = $this->getDbDateString($filters['dateCreateFrom'] ?? self::DB_DATE_FROM);
        $to   = $this->getDbDateString($filters['dateCreateTo'] ?? self::DB_DATE_TO);
        $sql .= "O.create_date BETWEEN '$from' AND '$to'\n";
      }
      else if (isset($filters['dateEditedFrom']) || isset($filters['dateEditedTo'])) {
        $from = $this->getDbDateString($filters['dateEditedFrom'] ?? self::DB_DATE_FROM);
        $to   = $this->getDbDateString($filters['dateEditedTo'] ?? self::DB_DATE_TO);
        $sql .= "O.last_edit_date BETWEEN '$from' AND '$to'\n";
      }
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn'] ?? 'ID');
    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  /**
   * load full information order
   * @param string|int|string[]|int[] $ids
   * @param bool $oneOrder - if true, return one order and $ids must have one value.
   *
   * @return array|boolean rows
   */
  public function loadOrdersById($ids, bool $oneOrder = false) {
    $sql = $this->getBaseOrdersQuery(true) . "\n WHERE ";

    if (is_array($ids)) {
      $one = false;
      $sql .= " O.ID = " . implode(' OR O.ID = ', $ids) . "\n";
      $res = self::getAll($sql);
    } else {
      $one = true;
      $sql .= "O.ID = :id";
      $res = self::getAll($sql, [':id' => $ids]);
    }

    $res = array_map(function ($row) { return $this->jsonParseField($row); }, $res);

    return $oneOrder ? ($one && count($res) === 1 ? $res[0] : false) : $res;
  }

  /**
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   * @param ?array $filters<br>
   * $filters['userId']     - int|string<br>
   * $filters['customerId'] - int|string<br>
   * $filters['statusId']   - string|int|string[]|int[]$ids
   *
   * @return array
   */
  public function loadOrdersByRelatedKey(array $pageParam, array $filters = []): array {
    $sql = $this->getBaseOrdersQuery() . 'WHERE ';
    $connect = '';

    if (isset($filters['userId'])) {
      $sql .= "O.user_id = '" . $filters['userId'] . "'";
      $connect = ' AND ';
    }

    if (isset($filters['customerId'])) {
      $sql .= $connect . "O.customer_id = '" . $filters['customerId'] . "'";
      $connect = ' AND ';
    }

    if (isset($filters['statusId'])) {
      $ids = $filters['statusId'];
      if (!is_array($ids)) $ids = [$ids];

      $sql .= $connect . "O.status_id = " . implode(' OR O.status_id = ', $ids) . "\n";
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn']);
    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  public function changeOrders($columns, $dbTable, $commonValues, $status_id) {
    $param = [];

    array_map(function ($id) use (&$param, $status_id) {
      $param[$id] = [
        'status_id'      => $status_id,
        'last_edit_date' => date('Y-m-d G:i:s'), //нужен триггер
      ];
    }, array_values($commonValues));
    $this->insert($columns, $dbTable, $param, true);
  }

  // Visitors
  //--------------------------------------------------------------------------------------------------------------------

  public function saveVisitorOrder($param) {
    $bean = self::xdispense($this->pf('client_orders'));

    $bean->create_date = date($this::DB_DATE_FORMAT);
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    self::store($bean);

    return $bean->getID();
  }

  /**
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   * @param array $dateRange
   * @param array $ids
   *
   * @return array|null
   */
  public function loadVisitorOrder(array $pageParam, array $dateRange = [], array $ids = []): ?array {
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

  public function loadVisitorOrderById(string $id) {
    $sql = "SELECT ID, create_date AS 'createDate',
            save_value AS 'saveValue', 
            important_value AS 'importantValue',
            report_value AS 'reportValue',
            total
            FROM " . $this->pf('client_orders') . "\n
            WHERE ID = :id";

    return $this->jsonParseField(self::getRow($sql, [':id' => $id]));
  }

  // Status
  //--------------------------------------------------------------------------------------------------------------------

  public function loadOrderStatus(string $filters = ''): array {
    $sql = "SELECT * FROM " . $this->pf('order_status') . "\n ";

    if (strlen($filters)) $sql .= 'WHERE ' . $filters . "\n ";

    $sql .= "ORDER BY sort";

    return self::getAll($sql);
  }
}

trait DbUsers {
  private function getUserDbColumns(string $field): string {
    switch ($field) {
      default: return $field;
      case 'id': case 'ID': return 'U.ID';
      case 'name': return 'U.name';
      case 'permissionName': return 'P.name';
    }
  }

  /**
   * @param string $login
   * @param string $password
   * @param bool   $status
   * @return array|false
   */
  public function getUserFromFile(string $login = '', string $password = '', bool $status = false) {
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

  /**
   * @param string $login
   * @param string $column
   *
   * @return array|null
   */
  public function getUser(string $login, string $column = 'ID'): ?array {
    $result = self::getRow("SELECT $column FROM " . $this->pf('users') . " WHERE login = :login",
      [':login' => $login]
    );

    if (count($result) === 1 && count(explode(',', $column)) === 1) return $result[$column];
    return $result;
  }

  /**
   * @param $userId
   *
   * @return array|null
   */
  public function getUserById($userId): ?array {
    return self::getRow("SELECT * FROM " . $this->pf('users') . " WHERE ID = :id",
      [':id' => $userId]
    );
  }

  /**
   * @param $login
   * @return array|null
   */
  public function getUserByLogin($login): ?array {
    $sql = "SELECT U.ID AS 'id', login,  password, hash, 
                   U.name AS 'name', contacts, customization, activity,
                   P.ID AS 'permissionId', P.name AS 'permissionName', properties AS 'permissionValue'
            FROM " . $this->pf('users') . " U
            LEFT JOIN " . $this->pf('permission') . " P on U.permission_id = P.ID
            WHERE login = :login";

    return $this->jsonParseField(self::getRow($sql, [':login' => $login]));
  }

  /**
   * @param string|int $id
   * @return array|null
   */
  public function getUserByOrderId($id): ?array {
    return self::getRow("SELECT U.name AS 'name', U.contacts AS 'contacts'
            FROM " . $this->pf('users') . " U 
            JOIN " . $this->pf('orders') . " O ON U.ID = O.user_id
            WHERE O.ID = :id", [':id' => $id]);
  }

  /**
   * @param string $login
   * @param string $password
   * @return array|false
   */
  public function checkPassword(string $login, string $password) {
    if (USE_DATABASE) {
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
          $this->setPrefix($user['prefix']);
          return $user;
        }
      }
    }

    return false;
  }

  public function changeUser($loginId, $param) {
    $user = self::xdispense($this->pf('users'));
    $user->ID = $loginId;
    foreach ($param as $key => $value) {
      $user->$key = $value;
    }
    self::store($user);
  }

  /**
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   *
   * @return array
   */
  public function loadUsers(array $pageParam): array {
    $sql = "SELECT U.ID AS 'ID', login, U.name AS 'name', contacts,
                   permission_id AS 'permissionId', P.name AS 'permissionName',
                   register_date AS 'registerDate', activity
            FROM " . $this->pf('users') . " U
            LEFT JOIN " . $this->pf('permission') . " P ON U.permission_id = P.ID\n";

    $pageParam['sortColumn'] = $this->getUserDbColumns($pageParam['sortColumn']);

    $sql .= $this->getPaginatorQuery($pageParam);

    return $this->jsonParseField(self::getAll($sql));
  }

  public function setUserHash($loginId, $hash) {
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

  /**
   * @param $session
   * @return array|bool[]|false
   */
  public function checkUserHash($session) {
    if (USE_DATABASE) {
      $user = $this->getUserByLogin($session['login']);
      if (!count($user) || !boolValue($user['activity'])) return false;

      $user['permissionId'] = intval($user['permissionId']);
      $user['onlyOne'] = $user['customization']['onlyOne'] ?? false;
    } else {
      try {
        if (!file_exists(SYSTEM_PATH)) throw new \ErrorException('error');
        $value = file(SYSTEM_PATH);
        $value && $value = explode('|||', $value[0]);
        if (count($value) < 2) throw new \ErrorException('error');
      } catch (\ErrorException $e) {
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

    $ok = $user['onlyOne'] ? $session['hash'] === $user['hash']
                           : password_verify($session['password'], $user['password']);

    return $ok ? $user : false;
  }

  /**
   * get Setting for current user
   *
   * @param string $currentUser {string}
   * @param string $columns {string}
   *
   * @return mixed
   */
  public function getUserSetting(string $currentUser = '', string $columns = 'customization') {
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

trait DbCsv {
  private $csvTable;

  /**
   * @param string $path
   */
  public function setCsvTable(string $path) {
    $this->csvTable = substr($path, 1);
  }

  /**
   * сделать поиск всех файлов, наверное. (хотя если их много переходить на БД, наверное)
   * @param $path {string}
   * @param $link {string}
   *
   * @return mixed|null
   */
  public function scanDirCsv(string $path, string $link = '') {
    return array_reduce(is_dir($path) ? scandir($path) : [], function ($r, $item) use ($link) {
      if (!($item === '.' || $item === '..')) {
        if (stripos($item, '.csv')) {
          $r[] = [
            'fileName' => $item,
            'name'     => gTxt(str_replace('.csv', '', $item)),
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

  public function openCsv(): array {
    $result = [];
    $csvPath = $this->main->getCmsParam(VC::CSV_PATH) . $this->csvTable;

    if (file_exists($csvPath)) {
      if ($file = fopen($csvPath, 'rt')) {
        while ($cells = fgetcsv($file, CSV_STRING_LENGTH, CSV_DELIMITER)) $result[] = $cells;
        fclose($file);
      }

      Xml::checkXml($this->csvTable);
    }

    return $result;
  }

  public function fileForceDownload() {
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

  /**
   * @param array $csvData
   *
   * @return DbCsv
   */
  public function saveCsv(array $csvData): DbCsv {
    $csvPath = $this->main->getCmsParam(VC::CSV_PATH);

    if (file_exists($csvPath . $this->csvTable)) {
      $fileStrings = [];
      $length = count($csvData[0]);

      foreach ($csvData as $v) {
        $v[$length - 1] .= PHP_EOL;
        $fileStrings[] = implode(CSV_DELIMITER, $v);
      }

      file_put_contents($csvPath . $this->csvTable, $fileStrings);
      $this->main->deleteCsvCache();
    }

    return $this;
  }
}

trait ContentEditor {
  private $CONTENT_PATH = SHARE_PATH . 'content.json';
  private $contentData = '{}';
  private $contentLoaded;

  private function contentPath(): string {
    $path = $this->main->publicDealer ? $this->main->url->getPath(true) : $this->main->url->getBasePath(true);

    return $path . $this->CONTENT_PATH;
  }

  private function checkContentFile(): void {
    $path = $this->contentPath();

    if (!file_exists($path)) {
      file_put_contents($path, $this->contentData);
    }
  }

  /**
   * @param bool $jsonDecode
   * @param bool $assoc
   * @return mixed
   */
  public function loadContentEditorData(bool $jsonDecode = false, bool $assoc = false) {
    $this->checkContentFile();

    $data = file_get_contents($this->contentPath());

    return $jsonDecode ? json_decode($data, $assoc) : $data;
  }

  public function saveContentEditorData($data) {
    $this->checkContentFile();

    if (!is_string($data)) $data = json_encode($data);

    return file_put_contents($this->contentPath(), $data);
  }

  public function mergeContentData() {
    $this->contentLoaded = $this->getContentData(false);
  }

  /**
   * @param bool $flatten
   * @param bool $assoc
   *
   * @return array
   */
  public function getContentData(bool $flatten = true, bool $assoc = false): array {
    $data = $this->loadContentEditorData(true, true);

    if (is_array($this->contentLoaded)) {
      $data = array_merge($data, $this->contentLoaded);
    }

    if ($flatten) {
      $data = array_reduce($data, function($r, $section) use ($assoc) {
        foreach ($section['fields'] as $key => $value) {
          if ($assoc) $r[$key] = $value['value'];
          else $r[] = [
            'id' => $key,
            'value' => $value['value'],
          ];
        }

        return $r;
      }, []);
    }

    return $data;
  }
}
