<?php

namespace RedBeanPHP;

require 'rb.php';

class Db extends \R {
  private $currentUserID = 2;
  private $dbName;
  private $login;

  /**
   * Plugin readbaen for special name
   * @param $type
   * @param $count
   *
   * @return array|OODBBean|null
   */
  private function dis($type, $count) {
    return self::getRedBean()->dispense($type, $count);
  }

  private function setting() {
    self::ext('xdispense', function ($type, $count = 1) {
      return $this->dis($type, $count);
    });
  }

  /**
   * db constructor
   *
   * @param array $dbConfig
   * @param bool $freeze
   */
  public function __construct($dbConfig = [], $freeze = true) {
    if (USE_DATABASE) {
      if (!count($dbConfig)) {
        require ABS_SITE_PATH . 'config.php';
        if (!count($dbConfig)) exit('Configs error');
      }

      $this->dbName = $dbConfig['dbName'];

      self::setup(
        'mysql:host=' . $dbConfig['dbHost'] . ';dbname=' . $dbConfig['dbName'],
        $dbConfig['dbUsername'],
        $dbConfig['dbPass']
      );

      if (!self::testConnection()) {
        is_callable('reDirect') && reDirect(false, '404&dbError=true');
        exit('Data Base connect error!');
      }

      $this->setting();

      //self::fancyDebug(DEBUG);
      self::freeze($freeze);
    }
  }

  /**
   * @param $id
   */
  public function setCurrentUserId() {
    if (!isset($_SESSION)) session_start();
    if (isset($_SESSION['priority'])) $this->currentUserID = $_SESSION['priority'];
  }

  // MAIN query
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param string $tableName name of table
   * @param $columns array of columns, if count 1 return simple array
   * @param $filters string filter
   *
   * @return array
   */
  public function selectQuery($tableName, $columns, $filters = '') {
    if (!$tableName) return [];
    if (!is_array($columns)) $columns = [$columns];
    //if (!is_array($filters)) $filters = [$filters];

    $sql = 'SELECT ' . implode(',', $columns) .
           ' FROM ' . $tableName;

    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    return self::getAll($sql);
  }

  /**
   * Проверка таблицы перед добавлениями/изменениями
   *
   * @param $curTable
   * @param $tableName
   * @param $param - link
   * @param $count - link
   *
   * @return array $result
   */
  public function checkTableBefore($curTable, $tableName, &$param) {
    $result = [];

    array_map(function ($col) use (&$result, $tableName, &$param) {
      // Если автоинкремент -> удалить все поля из $param
      if ($col['key'] === 'PRI' && strpos($col['extra'], 'auto') !== false) {

        foreach ($param as $k => $item) {
          if (isset($item[$col['columnName']])) {
            unset($param[$k][$col['columnName']]);
          }
        }

      } // Если ключ или уникальный проверить на уникальность
      else if ($col['key'] === 'PRI' || $col['key'] === 'UNI') {

        foreach ($param as $k => $item) {
          if (isset($item[$col['columnName']])) $queryResult = $this->checkHaveRows($tableName, $col['columnName'], $item[$col['columnName']]);
          else $queryResult = [];

          if (count($queryResult)) {
            $result[] = [
              'id'         => $queryResult[0],
              'columnName' => $col['columnName'],
              'value'      => $item[$col['columnName']],
              'cause'      => 'UNI'
            ];

            unset($param[$k][$col['columnName']]);
          }
        }
      } // Если поле не может быть пустым
      else if ($col['null'] === 'NO') {
        foreach ($param as $k => $item) {
          if (isset($item[$col['columnName']]) && $item[$col['columnName']] === '') {
            $result[] = [
              'id'         => $k,
              'columnName' => $col['columnName'],
              'cause'      => 'Not Null'
            ];

            unset($param[$k][$col['columnName']]);
          }
        }
      }

      // Приведение типов
      if (strpos($col['type'], 'char') === false) {
        foreach ($param as $k => $item) {
          if (isset($item[$col['columnName']])) {
            preg_match('/\w+(?=\()/', $col['type'], $match);
            if (count($match)) {
              //$item[$col['columnName']] = $this->convertType($match[0], item);
            }
          }
        }
      }

      if (count($param) && isset($k) && count($param[$k]) === 0) unset($param[$k]);
    }, $curTable);

    return $result;
  }

  /**
   * select all (*)
   * @param $tableName
   *
   * @return array|null
   */
  public function loadTable($tableName) {
    return self::getAll('SELECT * FROM ' . $tableName);
  }

  /**
   * @param $tableName
   * @param $columnName
   * @param $value
   *
   * @return array|null
   */
  public function checkHaveRows($tableName, $columnName, $value) {
    return self::getCol('Select * FROM ' . $tableName . ' WHERE ' . $columnName . ' = :value', [':value' => $value]);
    //return R::find($tableName , $columnName . ' = ' . $value);
  }

  /**
   * @param $tableName
   * @param $ids
   *
   * @return array
   */
  public function deleteItem($tableName, $ids) {
    ob_start();
    if (count($ids) === 1) {
      $bean = self::xdispense($tableName);
      $bean->ID = $ids[0];
      $bean->id = $ids[0];
      self::trash($bean);
    } else {
      $beans = self::xdispense($tableName, count($ids));

      for ($i = 0; $i < count($ids); $i++) {
        $beans[$i]->ID = $ids[$i];
        $beans[$i]->id = $ids[$i];
      }

      self::trashAll($beans);
    }
    $temp = ob_get_clean();
    return [];
  }

  /**
   * @return mixed|null
   * assoc array [
   *  ['name' => 'table_name1']
   *  ['name' => 'table_name2']
   * ]
   */
  public function getTables() {
    return array_reduce($this::getCol('SHOW TABLES'), function ($acc, $item) {

      $acc[] = [
        'tableName' => $item,
        'name'      => $item
      ];

      return $acc;
    }, []);
  }

  /**
   * get columns table
   * @param $tableName
   *
   * @return mixed
   */
  public function getColumnsTable($tableName) {
    return self::getAll('SELECT COLUMN_NAME as "columnName", COLUMN_TYPE as "type",
       COLUMN_KEY AS "key", EXTRA AS "extra", IS_NULLABLE as "null"
		FROM information_schema.COLUMNS where TABLE_SCHEMA = :dbName AND  TABLE_NAME = :tableName',
      [':dbName'    => $this->dbName,
       ':tableName' => $tableName
      ]);
  }

  /**
   * @param $tableName
   * @param $filters
   *
   * @return mixed
   */
  public function getCountRows($tableName, $filters = '') {
    $sql = "SELECT COUNT(*) as 'count' from $tableName";

    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    $result = self::getRow($sql);
    //$result = self::getRow("SELECT COUNT(*) as 'count' from :tableName", [':tableName' => $tableName]);

    if (count($result)) return $result['count'];
  }

  /**
   * insert or change rows
   *
   * @param $curTable
   * @param $tableName
   * @param $param
   * @param bool $change
   *
   * @return array|int
   */
  public function insert($curTable, $tableName, $param, $change = false) {
    $result = $this->checkTableBefore($curTable, $tableName, $param);

    $beans = self::xdispense($tableName, count($param));

    if (count($param) > 0) {

      if ($change) {
        foreach ($curTable as $col) {
          if ($col['key'] === 'PRI') {
            $idColName = $col['columnName'];
            break;
          }
        }
      }

      try {
        if (count($param) === 1) {
          foreach ($param as $id => $item) {

            if ($change) $beans->$idColName = $id;

            foreach ($item as $k => $v) {
              if (isset($idColName) && $idColName === $k) continue;
              $beans->$k = $v;
            }
          }
          self::store($beans);
        } else {

          $i = 0;
          foreach ($param as $id => $item) {

            if ($change) $beans[$i]->$idColName = $id;

            foreach ($item as $k => $v) {
              $beans[$i]->$k = $v;
            }
            $i++;
          }
          self::storeAll($beans);
        }
      } catch (\RedBeanPHP\RedException $e) {
        return [
          'result'   => $result,
          'sqlError' => $e->getMessage(),
        ];
      }
    }

    return ['result' => $result,];
  }

  // ELEMENTS
  //------------------------------------------------------------------------------------------------------------------

  public function loadElements($sectionID, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'C.name', $sortDirect = false) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT ID, C.name AS 'C.name', E.name AS 'E.name', activity, sort, last_edit_date
    FROM elements E
    JOIN codes C on C.symbol_code = E.element_type_code
    WHERE E.section_parent_id = $sectionID
		ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
    //return self::getAll($sql, [':sectionID', $sectionID]);
  }

  // Options
  //------------------------------------------------------------------------------------------------------------------

  public function loadOptions($elementID, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'O.name', $sortDirect = false) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT O.ID AS 'O.ID', O.name AS 'O.name', O.unit_id as 'O.unit_id', O.activity as 'O.activity', sort, last_edit_date, 
       MI.name AS 'MI.name', MO.name AS 'MO.name', input_price, output_percent, output_price
    FROM options_elements O
    JOIN money MI on MI.ID = O.money_input_id
    JOIN money MO on MO.ID = O.money_output_id
    JOIN units U on U.ID = O.unit_id
    WHERE O.element_id = $elementID
		ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  // ORDERS
  //------------------------------------------------------------------------------------------------------------------

  /**
   * save order in calc
   * @param -
   */
  public function saveOrder($param) {
    $bean = self::xdispense('orders');
    $bean->user_id = $this->currentUserID;
    //$bean->create_date = date('Y-m-d G:i:s');
    //$bean->last_edit_date = date('Y-m-d G:i:s');
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    self::store($bean);
  }

  /**
   * @param int $pageNumber
   * @param int $countPerPage
   * @param string $sortColumn
   * @param bool $sortDirect
   * @param array $dateRange
   * @param array $ids
   *
   * @return array|null
   */
  public function loadOrder($pageNumber = 0, $countPerPage = 20, $sortColumn = 'last_edit_date', $sortDirect = false, $dateRange = [], $ids = []) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT O.ID AS 'O.ID', create_date, last_edit_date, users.name, C.name as 'C.name', total,
		           important_value, S.name AS 'S.name'
			FROM orders O
			LEFT JOIN users ON user_id = users.ID
			LEFT JOIN customers C ON customer_id = C.ID
			JOIN order_status S ON status_id = S.ID\n";

    if (count($dateRange)) $sql .= "WHERE O.last_edit_date BETWEEN '$dateRange[0]' AND '$dateRange[1]'\n";
    if (count($ids)) {
      $sql .= "WHERE O.ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR O.ID = ', $ids) . " ";
    }

    $sql .= "ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  /**
   * load full information order
   * @param $id - array
   *
   * @return array rows
   */
  public function loadOrderById($id) {

    $sql = "SELECT O.ID as 'ID', create_date, last_edit_date, users.name as 'name', C.name as 'C.name', total,
	                 S.name AS 'Status', important_value, save_value, report_value
            FROM orders O
            LEFT JOIN users ON user_id = users.ID
            LEFT JOIN customers C ON customer_id = C.ID
            JOIN order_status S ON status_id = S.ID
            WHERE O.ID = ?";

    $res = self::getAll($sql, $id);

    if (count($res)) {
      $res = $res[0];
      $res['report_value'] = gzuncompress($res['report_value']);
      if (!$res['report_value']) $res['report_value'] = false;
    }
    return $res;
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

  // ORDERS VISITORS
  //------------------------------------------------------------------------------------------------------------------

  public function saveVisitorOrder($param) {
    $bean = self::xdispense('client_orders');
    //$bean->create_date = date('Y-m-d G:i:s');
    foreach ($param as $key => $value) {
      $bean->$key = $value;
    }
    self::store($bean);
  }

  /**
   * @param int $pageNumber
   * @param int $countPerPage
   * @param string $sortColumn
   * @param bool $sortDirect
   * @param array $dateRange
   * @param array $ids
   *
   * @return array|null
   */
  public function loadVisitorOrder($pageNumber = 0, $countPerPage = 20, $sortColumn = 'create_date', $sortDirect = false, $dateRange = [], $ids = []) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT cp_number, create_date, important_value, total FROM client_orders\n";

    if (count($dateRange)) $sql .= "WHERE create_date BETWEEN '$dateRange[0]' AND '$dateRange[1]'\n";
    if (count($ids)) {
      $sql .= "WHERE ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR ID = ', $ids) . " ";
    }

    $sql .= "ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  //public function

  // Customers
  //--------------------------------------------------------------------------------------------------------------------

  public function getLastID($table) { // TODO плохо
    return self::getRow("SELECT MAX(ID) AS 'ID' FROM $table")['ID'];
  }

  /**
   * @param int $pageNumber
   * @param int $countPerPage
   * @param string $sortColumn
   * @param bool $sortDirect
   * @param array $ids
   *
   * @return mixed
   */
  public function loadCustomers($pageNumber = 0, $countPerPage = 20, $sortColumn = 'name', $sortDirect = false, $ids = []) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT C.ID as 'C.ID', name, ITN, contacts, GROUP_CONCAT(O.ID) as 'orders'
     FROM customers C
     LEFT JOIN orders O on C.ID = O.customer_id\n";

    if (count($ids)) {
      $sql .= "WHERE C.ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR C.ID = ', $ids) . " ";
    }

    $sql .= "GROUP BY C.ID\n";

    if ($countPerPage < 1000) $sql .= "ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  public function loadCustomerByOrderId($orderIds) {

    $sql = "SELECT C.name as 'name', ITN, contacts FROM orders 
        LEFT JOIN customers C ON C.ID = orders.customer_id
        WHERE orders.ID = $orderIds";

    return self::getRow($sql);
  }

  // Permission
  //--------------------------------------------------------------------------------------------------------------------

  public function getPermissionById($id) {
    $permission = $this->selectQuery('permission', ['access_val'], 'ID = ' . $id);

    if (count($permission) === 1) {
      return json_decode($permission[0]['access_val'], true);
    }
    return [];
  }

  // Users
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param string $login
   * @param string $password
   * @param false $status
   * @return array|false
   */
  public function getUserFromFile($login = '', $password = '', $status = false) {

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
  public function getUser($login, $column = 'ID') {
    $result = self::getRow("SELECT $column FROM users WHERE login = :login", [':login' => $login]);

    if (count($result) === 1 && count(explode(',', $column)) === 1) return $result[$column];
    return $result;
  }

  /**
   * @param $id
   *
   * @return mixed
   */
  public function getUserByOrderId($id) {
    return self::getRow("SELECT u.name as 'name', u.contacts as 'contacts'
            FROM users u 
            JOIN orders o ON u.ID = o.user_id
            WHERE o.ID = :id", [':id' => $id]);
  }

  public function checkPassword($login, $password) {
    if (USE_DATABASE) {
      $user = $this->getUser($login, 'ID, name, password');
    } else {
      return $this->getUserFromFile($login, $password);
    }

    if (count($user) && password_verify($password, $user['password'])) {
      return $user;
    } else return false;
  }

  public function changeUser($loginId, $param) {
    $user = self::xdispense('users');
    $user->ID = $loginId;
    foreach ($param as $key => $value) {
      $user->$key = $value;
    }
    self::store($user);
  }

  /**
   * @param int $pageNumber
   * @param int $countPerPage
   * @param string $sortColumn
   * @param bool $sortDirect
   *
   * @return mixed
   */
  public function loadUsers($pageNumber = 0, $countPerPage = 20, $sortColumn = 'register_date', $sortDirect = false) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT U.ID AS 'U.ID', permission_id, P.name AS 'P.name', login, U.name AS 'U.name', contacts, register_date, activity
    FROM users U
    LEFT JOIN permission P ON permission_id = P.ID\n";

    $sql .= "ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  public function setUserHash($loginId, $hash) {
    if (USE_DATABASE) {
      $user = self::xdispense('users');
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

  public function checkUserHash($session) {
    if (USE_DATABASE) {
      $hash = self::getCell('SELECT hash FROM users WHERE login = :login', [':login' => $session['login']]);
    } else {
      $value = file(SYSTEM_PATH)[0];
      $value && $hash = trim(explode('|||', $value)[2]);
    }
    return $session['hash'] === $hash;
  }

  /**
   * get Setting for current user
   *
   * @param $currentUser {string}
   * @param $columns {string}
   *
   * @return mixed
   */
  public function getUserSetting($currentUser = false, $columns = 'customization') {
    if (!$currentUser) {
      global $main;
      $currentUser = $main->getLogin();
    }
    $result = self::getAssocRow("SELECT $columns from users WHERE login = ?", [$currentUser]);

    if (count($result) === 1) {
      if ($columns === 'customization') return json_decode($result[0]['customization']);
      if (count(explode(',', $columns)) === 1) return $result[$columns];
    }
    return new class {};
  }

  use MainCsv;
}

/**
 * Trait Csv
 */
trait MainCsv {
  private $csvTable;

  /**
   * @param mixed $csvTable
   */
  public function setCsvTable($csvTable) {
    $this->csvTable = $csvTable;
  }

  /**
   * сделать поиск всех файлов, наверное. (хотя если их много переходить на БД, наверное)
   * @return mixed|null
   */
  static function scanDirCsv() {
    return array_reduce(scandir(PATH_CSV), function ($r, $item) {

      if (!($item === '.' || $item === '..' || !stripos($item, '.csv'))) {
        $r[] = [
          'fileName' => $item,
          'name'     => $item, //str_replace('.csv', '', $item),
        ];
      }

      return $r;
    }, []);
  }

  public function openCsv() {
    if (($file = fopen(PATH_CSV . $this->csvTable, 'r'))) {
      $result = [];
      while ($cells = fgetcsv($file, CSV_STRING_LENGTH, CSV_DELIMITER)) {
        $cells = array_map(function ($cell) {
          if (!mb_detect_encoding($cell, 'UTF-8', true)) $cell = iconv('cp1251', 'UTF-8', $cell);
          return $cell;
        }, $cells);
        $result[] = $cells;
      }
      return $result;
    }
    return false;
  }

  public function fileForceDownload() {
    $file = PATH_CSV . $this->csvTable;

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
   * @return $this
   */
  public function saveCsv($csvData) {
    if (file_exists(PATH_CSV . $this->csvTable)) {
      $fileStrings = [];
      $length = count($csvData[0]);

      foreach ($csvData as $v) {
        $v[$length - 1] .= PHP_EOL;
        $fileStrings[] = implode(CSV_DELIMITER, $v);
      }

      file_put_contents(PATH_CSV . $this->csvTable, $fileStrings);
    }
    return $this;
  }

}
