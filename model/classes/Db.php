<?php

namespace RedBeanPHP;

use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;

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

  public function setQueryAs($varName) {
    return AQueryWriter::camelsSnake($varName) . " AS '$varName'";
  }


  // MAIN query
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param string $dbTable name of table
   * @param array|string $columns of columns, if size of array is 1 (except all column '*') return simple array,
   * @param $filters string filter
   *
   * @return array
   */
  public function selectQuery($dbTable, $columns = '*', $filters = '') {
    $simple = false;
    if (!$dbTable) return [];
    if (!is_array($columns)) {
      $simple = $columns !== '*';
      $columns = [$columns];
    }

    $columns[0] !== '*' && $columns = array_map(function ($item) { return $this->setQueryAs($item); }, $columns);
    $sql = 'SELECT ' . implode(', ',  $columns) . ' FROM ' . $dbTable;
    if (strlen($filters)) $sql .= ' WHERE ' . AQueryWriter::camelsSnake($filters);

    return $simple ? self::getCol($sql) : self::getAll($sql);
  }

  /**
   * Проверка таблицы перед добавлениями/изменениями
   *
   * @param $curTable
   * @param $dbTable
   * @param $param - link
   * @return array $result
   */
  public function checkTableBefore($curTable, $dbTable, &$param) {
    $result = [];

    array_map(function ($col) use (&$result, $dbTable, &$param) {
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
          if (isset($item[$col['columnName']])) $queryResult = $this->checkHaveRows($dbTable, $col['columnName'], $item[$col['columnName']]);
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
   * @param $dbTable
   *
   * @return array|null
   */
  public function loadTable($dbTable) {
    return self::getAll('SELECT * FROM ' . $dbTable);
  }

  /**
   * @param $dbTable
   * @param $columnName
   * @param $value
   *
   * @return array|null
   */
  public function checkHaveRows($dbTable, $columnName, $value) {
    return self::getCol('Select * FROM ' . $dbTable . ' WHERE ' . $columnName . ' = :value', [':value' => $value]);
    //return R::find($dbTable , $columnName . ' = ' . $value);
  }

  /**
   * @param $dbTable
   * @param $ids
   *
   * @return array
   */
  public function deleteItem($dbTable, $ids) {
    if (count($ids) === 1) {
      $bean = self::xdispense($dbTable);
      $bean->ID = $ids[0];
      $bean->id = $ids[0];
      self::trash($bean);
    } else {
      $beans = self::xdispense($dbTable, count($ids));

      for ($i = 0; $i < count($ids); $i++) {
        $beans[$i]->ID = $ids[$i];
        $beans[$i]->id = $ids[$i];
      }

      self::trashAll($beans);
    }
    return [];
  }

  /**
   * @param string $like
   * @return mixed|null
   */
  public function getTables($like = '') {
    $sql = "SHOW TABLES
            FROM `$this->dbName`
            WHERE `Tables_in_$this->dbName` LIKE '%$like%'";

    return array_reduce($this::getCol($sql), function ($acc, $item) {
      $acc[] = [
        'dbTable' => $item,
        'name'    => str_replace('prop_', '', $item),
      ];
      return $acc;
    }, []);
  }

  /**
   * get columns table
   * @param $dbTable
   *
   * @return mixed
   */
  public function getColumnsTable($dbTable) {
    return self::getAll('SELECT COLUMN_NAME as "columnName", COLUMN_TYPE as "type",
       COLUMN_KEY AS "key", EXTRA AS "extra", IS_NULLABLE as "null"
		FROM information_schema.COLUMNS where TABLE_SCHEMA = :dbName AND  TABLE_NAME = :dbTable',
      [':dbName'  => $this->dbName,
       ':dbTable' => $dbTable
      ]);
  }

  /**
   * @param $dbTable
   * @param $filters
   *
   * @return integer
   */
  public function getCountRows($dbTable, $filters = '') {
    $sql = "SELECT COUNT(*) as 'count' from $dbTable";

    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    $result = self::getRow($sql);
    //$result = self::getRow("SELECT COUNT(*) as 'count' from :dbTable", [':dbTable' => $dbTable]);

    if (count($result)) return $result['count'];
    return 0;
  }

  /**
   * insert or change rows
   *
   * @param $curTable
   * @param $dbTable
   * @param $param
   * @param bool $change
   *
   * @return array|int
   */
  public function insert($curTable, $dbTable, $param, $change = false) {
    $result = $this->checkTableBefore($curTable, $dbTable, $param);

    $beans = self::xdispense($dbTable, count($param));

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

    return $result;
  }

  // Files
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param mixed $ids - if sting use delimiter ","
   *
   * @return array
   */
  public function getFiles($ids = false) {
    if (is_string($ids)) $ids = explode(',', $ids);
    $filters = $ids ? ' ID = ' . implode(' or ID = ', $ids) : '';
    return $this->selectQuery('files', '*', $filters);
  }

  // Elements
  //------------------------------------------------------------------------------------------------------------------

  public function loadElements($sectionID, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'C.name', $sortDirect = false) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT ID, E.name AS 'E.name', activity, sort, last_edit_date AS 'lastEditDate',
                   C.symbol_code AS 'symbolCode', C.name AS 'C.name'
    FROM elements E
    JOIN codes C on C.symbol_code = E.element_type_code
    WHERE E.section_parent_id = $sectionID
    ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
    //return self::getAll($sql, [':sectionID', $sectionID]);
  }

  // Options
  //------------------------------------------------------------------------------------------------------------------

  private function setImages($imagesIds) {
    $images = $this->getFiles($imagesIds);
    return array_map(function ($item) {
      $path = findingFile(substr(PATH_IMG , 0, -1), mb_strtolower($item['path']));
      $item['path'] = $path ? $path : $item['path'];
      return $item;
    }, $images);
  }
  private function getAlias($table) {
    $tables = ['codes.', 'money.', 'elements.', 'options_elements.', 'units.'];
    $alias = ['C.', 'M.', 'E.', 'O.', 'U.'];
    $table = str_replace($tables, $alias, $table);
    $cols = ['.id', '.type', '.unit', '.lastDate'];
    $alias = ['.ID', '.element_type_code', '.short_name', '.last_edit_date'];
    return str_replace($cols, $alias, $table);
  }

  /**
   * Для страницы Catalog
   * @param false $elementID
   * @param int $pageNumber
   * @param int $countPerPage
   * @param string $sortColumn
   * @param false $sortDirect
   * @return array|null
   */
  public function openOptions($elementID = false, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'name', $sortDirect = false) {
    $pageNumber *= $countPerPage;

    $sql = "SELECT ID, money_input_id AS 'moneyInputId', money_output_id as 'moneyOutputId',
                   images_ids AS 'images', property,
                   name, unit_id AS 'unitId', last_edit_date AS 'lastEditDate', activity, sort,
                   input_price AS 'inputPrice', output_percent AS 'outputPercent', output_price AS 'outputPrice'
            FROM options_elements";

    if ($elementID) {
      $sql .= " WHERE element_id = $elementID
      		ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";
    }

    $options = self::getAll($sql);

    return array_map(function ($option) {
      // set images
      strlen($option['images']) && $option['images'] = $this->setImages($option['images']);

      return $option;
    }, $options);
  }

  /**
   * Load for calculator
   * @param array $filter
   * @return array|null
   */
  public function loadOptions($filter = []) {
    $sql = "SELECT O.ID AS 'id', element_id as 'elementId', E.element_type_code AS 'type', O.name AS 'name',
                   U.short_name as 'unit', O.activity AS 'activity',
                   O.sort AS 'sort', O.last_edit_date as 'lastDate', property, images_ids AS 'images',
                   MI.name AS 'moneyInput', MO.name AS 'moneyOutput',
                   input_price AS 'inputPrice', output_percent AS 'outputPercent', output_price AS 'price'
            FROM options_elements O
            JOIN elements E on E.ID = O.element_id
            JOIN money MI on MI.ID = O.money_input_id
            JOIN money MO on MO.ID = O.money_output_id
            JOIN units U on U.ID = O.unit_id";

    if (count($filter)) {
      $filterArr = [];
      foreach ($filter as $k => $v) {
        $k = $this->getAlias(AQueryWriter::camelsSnake($k));
        $filterArr[] = "$k LIKE '$v'";
      }

      $sql .= ' WHERE ' . implode(' AND ', $filterArr);
      unset($filter, $filterArr);
    }

    $options = self::getAll($sql);

    return array_map(function ($option) {
      // set images
      if (strlen($option['images'])) {
        $option['images'] = [['path' => PATH_IMG . 'stone/a001_raffia.jpg']];
        //$option['images'] = $this->setImages($option['images']);
      }

      // set property
      $properties = $option['property'] ? json_decode($option['property'], true) : [];
      $option['property'] = [];
      foreach ($properties as $property => $id) {
        $propName = str_replace('prop_', '', $property);
        $option['property'][$propName] = $this->getPropertyTable($id, $property);
      }

      return $option;
    }, $options);
  }

  // Property
  //------------------------------------------------------------------------------------------------------------------

  private function parseSimpleProperty($type, $value) {
    switch ($type) {
      default:
      case 'text':
      case 'textarea': return strval($value);
      case 'number': return floatval($value);
      //case 'date':
      case 'bool': return boolval($value);
    }
  }

  private function getPropertyTable($propValue, $propName) {
    static $propTables, $props;

    if (!$propTables) {
      $props = [];
      // Простые параметры
      if (($setting = getSettingFile()) && isset($setting['propertySetting'])) {
        foreach ($setting['propertySetting'] as $prop => $value) {
          $props[$prop] = array_merge($value, ['simple' => true]);
        }
      }

      // Параметры из таблиц БД
      $propTables = $this->getTables('prop');
      foreach ($propTables as $table) {
        $props[$table['dbTable']] = $this->loadTable($table['dbTable']);

        // TODO временно
        if ($table['dbTable'] === 'prop_brand') {
          $tmp = array_map(function ($it) {
            if($it['logo_ids']) {
              $it['logo_ids'] = $this->setImages($it['logo_ids']);
              $it['logo'] = $it['logo_ids'][0]['path'];
            }
            return $it;
          }, $props[$table['dbTable']]);

          $props[$table['dbTable']] = $tmp;
        }
      }
    }

    if (!isset($props[$propName]) || !is_array($props[$propName]) ) return ['name' => 'Property table error'];

    $prop = $props[$propName];

    if (isset($prop['simple'])) return $this->parseSimpleProperty($prop['type'], $propValue);
    foreach ($props[$propName] as $item) if ($item['ID'] === $propValue) return $item;
    return ['name' => 'db item not found!'];
  }

  public function createPropertyTable($dbTable, $param) {
    $sql = "CREATE TABLE $dbTable (
            `ID` int(10) UNSIGNED NOT NULL,
            `name` varchar(255) NOT NULL DEFAULT 'NoName'";

    if (count($param)) {
      function getParam($prop, $type) {
        $str = ", `$prop` ";

        switch ($type) {
          case 'file': return ", `$prop". "_ids` varchar(255)";
          case 'string': return $str . "varchar(255)";
          case 'textarea': return $str . "varchar(1000)";
          case 'double': return $str . "double NOT NULL DEFAULT 1";
          case 'money': return $str . "decimal(10,4) NOT NULL DEFAULT 1.0000";
          case 'date': return $str . "timestamp";
          case 'bool': return $str . "int(1) NOT NULL DEFAULT 1";
        }
      }

      foreach ($param as $prop => $type) {
        $sql .= getParam($prop, $type);
      }
    }

    $error = self::exec($sql . ')');
    !$error && $error = self::exec("ALTER TABLE `$dbTable`
        ADD PRIMARY KEY (`ID`)");
    return self::exec("ALTER TABLE `$dbTable`
        MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1");
  }

  public function delPropertyTable($dbTables) {
    $propTables = $this->getTables('prop');

    foreach ($propTables as $prop) {
      if (in_array($prop['dbTable'], $dbTables)) {
        $table = $prop['dbTable'];
        self::exec("DROP TABLE `$table`");
      }
    }
  }

  // Orders
  //------------------------------------------------------------------------------------------------------------------

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

    /*important_value AS 'importantValue', */
    $sql = "SELECT O.ID AS 'O.ID', create_date AS 'createDate',
            last_edit_date AS 'lastEditDate', users.name, C.name as 'C.name', total,
            S.name AS 'S.name'
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
   * @param $id {string}
   *
   * @return array rows
   */
  public function loadOrderById($id) {

    $sql = "SELECT O.ID AS 'ID', create_date AS 'createDate', last_edit_date AS 'lastEditDate',
                   users.name AS 'name', users.ID AS 'userId',
                   users.contacts AS 'contacts', C.name AS 'C.name', total, S.name AS 'Status', 
                   important_value AS 'importantValue', save_value AS 'saveValue',
                   report_value AS 'reportValue'
            FROM orders O
            LEFT JOIN users ON user_id = users.ID
            LEFT JOIN customers C ON customer_id = C.ID
            JOIN order_status S ON status_id = S.ID
            WHERE O.ID = :id";

    $res = self::getAll($sql, [':id' => $id]);

    if (count($res)) {
      $res = $res[0];
      $res['reportValue'] = gzuncompress($res['reportValue']);
      if (!$res['reportValue']) $res['reportValue'] = false;
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

  // Orders Visitors
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

    $sql = "SELECT C.ID as 'id', name, ITN, contacts, GROUP_CONCAT(O.ID) as 'orders'
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

    $sql = "SELECT C.ID as 'ID', C.name as 'name', ITN, contacts FROM orders 
        LEFT JOIN customers C ON C.ID = orders.customer_id
        WHERE orders.ID = $orderIds";

    return self::getRow($sql);
  }

  // Permission
  //--------------------------------------------------------------------------------------------------------------------

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
   * @param $userId
   *
   * @return array|null
   */
  public function getUserById($userId) {
    return self::getRow("SELECT * FROM users WHERE ID = :id", [':id' => $userId]);
  }

  /**
   * @param $login
   * @return array|null
   */
  public function getUserByLogin($login) {
    return self::getRow("SELECT hash, password, customization, 
            p.ID as 'permId', p.name as 'permName', access_val as 'permVal'
            FROM users
            LEFT JOIN permission p on users.permission_id = p.ID
            WHERE login = :login", [':login' => $login]);
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
    global $main;
    if (USE_DATABASE) {
      $user = $this->getUserByLogin($session['login']);
      count($user) && $userParam = [
        'onlyOne' => isset(json_decode($user['customization'])->onlyOne),
        'admin' => $user['permId'] === 'admin' || $user['permId'] === '1',
        'customization' => json_decode($user['customization'], true),
        'permission' => json_decode($user['permVal'], true),
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
        'hash' => trim($value[2]),
      ];
      $userParam = [
        'onlyOne' => true,
        'admin' => true,
      ];
    }

    if (isset($userParam)) foreach ($userParam as $k => $v) $main->setSettings($k, $v);

    if (!$main->getSettings('onlyOne') && isset($user['password']) && isset($_SESSION['password'])) {
      $ok = USE_DATABASE ? password_verify($_SESSION['password'], $user['password'])
                         : $_SESSION['password'] === $user['password'];
    }
    return $session['hash'] === $user['hash'] || (isset($ok) && $ok);
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
    return json_decode('{}');
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
   * @param $path {string}
   * @param $link {string}
   * @return mixed|null
   */
  static function scanDirCsv($path, $link = '') {

    return array_reduce(scandir($path), function ($r, $item) use ($link) {
      if (!($item === '.' || $item === '..')) {
        if (stripos($item, '.csv')) {
          $r[] = [
            'fileName' => $item,
            'name'     => gTxt(str_replace('.csv', '', $item)),
          ];
        } else {
          $link && $link .= '/';
          if (filetype(PATH_CSV . $link . $item) === 'dir') {
            global $db;
            $r[$item] = $db::scanDirCsv(PATH_CSV . $link . $item, $link . $item);
          }
        }
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
