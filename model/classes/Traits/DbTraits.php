<?php

trait DbOrders {
  private function getOrdersDbColumns(string $field) {
    switch ($field) {
      default: return $field;
      case 'id': case 'ID': return 'O.ID';
      case 'userName': return 'U.name';
      case 'customerName': return 'C.name';
      case 'statusId': return 'S.ID';
      case 'status': return 'S.name';
    }
  }

  private function getBaseOrdersQuery(bool $includeValues = false) {
    return "SELECT O.ID AS 'ID', 
            create_date AS 'createDate', last_edit_date AS 'lastEditDate', 
            start_shipping_date AS 'startShippingDate', end_shipping_date AS 'endShippingDate',
            U.name AS 'userName', C.name AS 'customerName', S.ID AS 'statusId', S.name AS 'status', total"
      . ($includeValues ? ", important_value AS 'importantValue', save_value AS 'saveValue', report_value AS 'reportValue'" : "\n") .
      "FROM " . $this->pf('orders') . " O
      LEFT JOIN " . $this->pf('users') . " U ON O.user_id = U.ID
      LEFT JOIN " . $this->pf('customers') . " C ON O.customer_id = C.ID
      JOIN " . $this->pf('order_status') . " S ON O.status_id = S.ID\n";
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

    return self::getAll($sql);
  }

  /**
   * load full information order
   * @param string|int|string[]|int[] $ids
   *
   * @return array rows
   */
  public function loadOrdersById($ids) {
    $sql = $this->getBaseOrdersQuery(true) . "\n WHERE ";

    if (is_array($ids)) {
      $sql .= " O.ID = " . implode(' OR O.ID = ', $ids) . "\n";
      $res = self::getAll($sql);
    } else {
      $sql .= "O.ID = :id";
      $res = self::getAll($sql, [':id' => $ids]);
    }

    return array_map(function ($row) {
      $row['reportValue'] = gzuncompress($row['reportValue']);
      if (!$row['reportValue']) $row['reportValue'] = false;

      return $this->jsonParseField($row);
    }, $res);
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

    if (isset($filters['userId'])) {
      $sql = "O.user_id = '" . $filters['userId'] . "'";
    }

    else if (isset($filters['customerId'])) {
      $sql = "O.customer_id = '" . $filters['customerId'] . "'";
    }

    else if (isset($filters['statusId'])) {
      $ids = $filters['statusId'];
      if (!is_array($ids)) $ids = [$ids];

      $sql .= "O.status_id = " . implode(' OR O.status_id = ', $ids) . "\n";
    }

    $pageParam['sortColumn'] = $this->getOrdersDbColumns($pageParam['sortColumn']);
    $sql .= $this->getPaginatorQuery($pageParam);

    return self::getAll($sql);
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
  //------------------------------------------------------------------------------------------------------------------

  public function saveVisitorOrder($param) {
    $bean = self::xdispense($this->pf('client_orders'));

    $bean->create_date = date($this::DB_DATA_FORMAT);
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    self::store($bean);
  }

  /**
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   * @param array $dateRange
   * @param array $ids
   *
   * @return array|null
   */
  public function loadVisitorOrder(array $pageParam, array $dateRange = [], array $ids = []) {
    $sql = "SELECT cp_number AS 'cpNumber', create_date AS 'createDate', important_value AS 'importantValue', total
            FROM " . $this->pf('client_orders') . "\n";

    if (count($dateRange)) $sql .= "WHERE create_date BETWEEN '$dateRange[0]' AND '$dateRange[1]'\n";
    if (count($ids)) {
      $sql .= "WHERE ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR ID = ', $ids) . " ";
    }

    $sql .= $this->getPaginatorQuery($pageParam);

    return self::getAll($sql);
  }

  // Status
  public function loadOrderStatus(string $filters = ''): array {
    $sql = "SELECT * FROM " . $this->pf('order_status') . "\n ";

    if (strlen($filters)) $sql .= 'WHERE ' . $filters . "\n ";

    $sql .= "ORDER BY sort";

    return self::getAll($sql);
  }
}

trait DbUsers {
  private function getUserDbColumns(string $field) {
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
          'login' => $value[0],
          'name'  => $value[0],
          'ID'    => 1,
        ];
      } else return false;
    } else {
      file_put_contents(SYSTEM_PATH, '');
      // Сделать регистрацию при первом разе
    }
  }

  /**
   * @param $login
   * @param $column string
   *
   * @return array|null
   */
  public function getUser($login, string $column = 'ID') {
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
  public function getUserById($userId) {
    return self::getRow("SELECT * FROM " . $this->pf('users') . " WHERE ID = :id",
      [':id' => $userId]
    );
  }

  /**
   * @param $login
   * @return array|null
   */
  public function getUserByLogin($login) {
    $sql = "SELECT login, U.name AS 'name', hash, password, customization, 
                   P.ID AS 'permId', P.name AS 'permName', properties AS 'permValue', activity
            FROM " . $this->pf('users') . " U
            LEFT JOIN " . $this->pf('permission') . " P on U.permission_id = P.ID
            WHERE login = :login";

    return self::getRow($sql, [':login' => $login]);
  }

  /**
   * @param $id
   *
   * @return mixed
   */
  public function getUserByOrderId($id) {
    return self::getRow("SELECT U.name AS 'name', U.contacts AS 'contacts'
            FROM " . $this->pf('users') . " U 
            JOIN " . $this->pf('orders') . " O ON U.ID = O.user_id
            WHERE O.ID = :id", [':id' => $id]);
  }

  public function checkPassword($login, $password) {
    if (USE_DATABASE) {
      $user = $this->getUser($login, 'ID, name, login, password, activity');
    } else {
      return $this->getUserFromFile($login, $password);
    }

    return count($user) && boolValue($user['activity'])
    && password_verify($password, $user['password']) ? $user : false;
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

    return self::getAll($sql);
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

      $customization = json_decode($user['customization'], true);

      $userParam = [
        'permissionId'  => intval($user['permId']),
        'onlyOne'       => isset($customization['onlyOne']),
        'customization' => $customization,
        'permission'    => json_decode($user['permValue'], true),
      ];
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
        'password' => $value[1],
        'hash'     => trim($value[2]),
      ];
      $userParam = [
        'onlyOne' => true,
        'admin'   => true,
      ];
    }

    if ($userParam['onlyOne']) $ok = $session['hash'] === $user['hash'];
    else {
      $ok = USE_DATABASE ? password_verify($session['password'], $user['password'])
        : $session['password'] === $user['password'];
    }

    return $ok ? $userParam : false;
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
   * @param mixed $csvTable
   */
  public function setCsvTable($csvTable) {
    $this->csvTable = $csvTable;
  }

  /**
   * сделать поиск всех файлов, наверное. (хотя если их много переходить на БД, наверное)
   * @param $path {string}
   * @param $link {string}
   * @return mixed|null
   */
  static function scanDirCsv(string $path, string $link = '') {
    return array_reduce(is_dir($path) ? scandir($path) : [], function ($r, $item) use ($link) {
      if (!($item === '.' || $item === '..')) {
        if (stripos($item, '.csv')) {
          $r[] = [
            'fileName' => $item,
            'name'     => gTxt(str_replace('.csv', '', $item)),
          ];
        } else {
          global $main;
          $csvPath = $main->getCmsParam(VC::CSV_PATH);
          $link && $link .= '/';
          if (filetype($csvPath . $link . $item) === 'dir') {
            $r[$item] = self::scanDirCsv($csvPath . $link . $item, $link . $item);
          }
        }
      }

      return $r;
    }, []);
  }

  public function openCsv() {
    $csvPath = $this->main->getCmsParam(VC::CSV_PATH) . $this->csvTable;

    if (file_exists($csvPath) && ($file = fopen($csvPath, 'rt'))) {
      $result = [];
      while ($cells = fgetcsv($file, CSV_STRING_LENGTH, CSV_DELIMITER)) {
        /* Это не работает
        $cells = array_map(function ($cell) {
          return mb_detect_encoding($cell, 'UTF-8', true) === 'UTF-8' ? $cell
                 : iconv('cp1251', 'UTF-8', $cell);
        }, $cells);*/
        $result[] = $cells;
      }
      return $result;
    }
    return false;
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
   * @param $csvData
   *
   * @return DbMain
   */
  public function saveCsv($csvData): DbMain {
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
    if ($this->main->url->getRoute() === 'public') {
      $path = $this->main->publicDealer ? $this->main->url->getPath(true) : ABS_SITE_PATH;
    } else {
      $path = $this->main->url->getPath(true);
    }

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
