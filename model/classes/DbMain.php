<?php

use RedBeanPHP\OODBBean;
use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
use RedBeanPHP\RedException;

require __DIR__ . '/Rb.php';
require __DIR__ . '/traits/DbTraits.php';

class DbMain extends R {
  /** Save Load csv files */
  use DbCsv;
  use ContentEditor;
  use DbOrders;
  use DbUsers;

  const DB_DATE_FORMAT = 'Y-m-d H:i:s',
        DB_DATE_FROM   = '2000-01-01 00:00:00',
        DB_DATE_TO     = '2100-01-01 00:00:00',
        SHOW_DATE_FORMAT = 'H:i d-m-Y';

  const DB_MAIN_TABLES = ['customers', 'orders', 'users', 'money', 'order_status', 'permission'];

  const DB_JSON_FIELDS = [
    'inputValue', 'saveValue', 'importantValue',
    'contacts', 'customerContacts', 'customization',
    'cmsParam', 'properties', 'permissionValue'
  ];

  const DB_DATE_FIELDS = [
    'createDate', 'lastEditDate', 'registerDate'
  ];

  const DB_BLOB_FIELDS = ['reportValue', 'settings'];


  /**
   * @var boolean
   */
  private $usePrefix = true;

  private $prefix;
  private string $dbName;
  private string $login;

  /**
   * @throws RedException
   */
  public function __construct(protected Main $main) {
    if (defined('USE_DATABASE') && USE_DATABASE) {
      self::ext('xdispense', fn($type, $count = 1) => $this->dis($type, $count));
    }
  }

  public function connect(): void
  {
    if (!USE_DATABASE) return;

    if (!self::testConnection()) {
      $dbConfig = $this->main->getSettings(VC::DB_CONFIG);

      if (!count($dbConfig)) {
        $pathConfig = $this->main->url->getPath(true) . 'config.php';

        if (file_exists($pathConfig)) {
          require $pathConfig;
        }

        if (!count($dbConfig)) die('Configs error');
      }

      $this->dbName = $dbConfig['dbName'];
      $this->setPrefix($dbConfig['dbPrefix'] ?? '');

      self::setup(
        'mysql:host=' . $dbConfig['dbHost'] . ';dbname=' . $dbConfig['dbName'],
        $dbConfig['dbUsername'],
        $dbConfig['dbPass']
      );

      !self::testConnection() && die('Data Base connect error!');

      //self::fancyDebug(DEBUG);
      self::freeze();
    }
  }

  /**
   * Plugin readBean for special name
   */
  private function dis($type, $count): array|OODBBean|null
  {
    return self::getRedBean()->dispense($type, $count);
  }


  /**
   * get Table with Prefix
   * @param string $table
   * @return string
   */
  private function pf(string $table): string {
    return $this->usePrefix ? $this->prefix . str_replace($this->prefix, '', $table) : $table;
  }

  private function getPaginatorQuery(array $pageParam): string {
    $pageNumber = $pageParam['pageNumber'] ?? 0;
    $countPerPage = $pageParam['countPerPage'] ?? 100;
    $sortColumn = AQueryWriter::camelsSnake($pageParam['sortColumn'] ?? 'id');
    $sortDirect = boolValue($pageParam['sortDirect'] ?? false) ? 'DESC' : '';

    if (includes($sortColumn, 'id')) $sortColumn = strtoupper($sortColumn);// Todo у всех таблиц убрать верхний регистр ID
    if (includes($sortColumn, '.')) $sortColumn = ucfirst($sortColumn);
    $pageNumber *= $countPerPage;
    return "ORDER BY $sortColumn " . $sortDirect . " LIMIT $countPerPage OFFSET $pageNumber";
  }

  public function jsonParseField(array $arr): array {
    $result = [];

    foreach ($arr as $key => $value) {
      if (is_array($value)) {
        $result[$key] = $this->jsonParseField($value);
      } else if (in_array($key, self::DB_JSON_FIELDS)) {
        $result[$key] = json_decode($value, true);
      } else if (in_array($key, self::DB_BLOB_FIELDS)) {
        $result[$key] = empty($value) ? [] : json_decode(gzuncompress($value), true);
      } else {
        $result[$key] = $value;
      }
    }

    return $result;
  }

  private function convertDateFormatField(array $arr): array {
    foreach ($arr as &$value) {
      foreach (self::DB_DATE_FIELDS as $dateF) {
        if (isset($value[$dateF])) $value[$dateF] = date_format(date_create($value[$dateF]), self::SHOW_DATE_FORMAT);
      }
    }

    return $arr;
  }

  public function jsonEncodeField(array $arr): array {
    $result = [];

    foreach ($arr as $key => $value) {
      if (in_array($key, self::DB_JSON_FIELDS) && is_string($value) === false) {
        $result[$key] = json_encode($value, JSON_HEX_APOS | JSON_HEX_QUOT);
      } else {
        $result[$key] = $value;
      }
    }

    return $result;
  }

  /**
   * Multiple databases
   */
  public function addDb(string $key, array $dbConfig, bool $freeze = true): DbMain {
    self::addDatabase(
      $key,
      'mysql:host=' . $dbConfig['dbHost'] . ';dbname=' . $dbConfig['dbName'],
      $dbConfig['dbUsername'],
      $dbConfig['dbPass'],
      $freeze
    );

    return $this;
  }

  /**
   * Select a database
   * @throws RedException
   */
  public function selectDb(string $key): DbMain {
    self::selectDatabase($key);

    return $this;
  }

  /**
   * What does this function do?
   */
  public function setQueryAs(string $varName): string {
    return AQueryWriter::camelsSnake($varName) . " AS '$varName'";
  }

  public function getDbDateString(int|string $date): bool|string|null
  {
    $date = trim($date, '"\'');

    if (empty($date)) return null;
    if (is_numeric($date) && strlen($date) >= 10) {
      return date($this::DB_DATE_FORMAT, intval(substr($date, 0, 10)));
    }
    $date = date_create($date);
    return $date ? $date->format($this::DB_DATE_FORMAT) : null;
  }

  public function setPrefix(string $prefix) { $this->prefix = $prefix; }

  /**
   * @deprecated
   */
  public function togglePrefix(): bool {
    return $this->usePrefix = !$this->usePrefix;
  }


  // MAIN query
  //------------------------------------------------------------------------------------------------------------------

  private function getConvertDbType(string $type): Closure {
    if (stripos($type, 'int') === 0) {
      return function ($v) { return intval($v); };
    }

    if (stripos($type, 'decimal') === 0 || stripos($type, 'float') === 0 || stripos($type, 'double') === 0) {
      return function ($v) { return floatval($v); };
    }

    return function ($v) {
      return $v;
    };
  }
  /**
   * Проверка таблицы перед добавлениями/изменениями
   */
  private function checkTableBefore($curTable, string $dbTable, &$param, bool $change): array {
    $result = [];

    array_map(function ($col) use (&$result, $dbTable, &$param, $change) {
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
          $count = isset($item[$col['columnName']])
            ? $this->checkHaveRows($dbTable, $col['columnName'], $item[$col['columnName']]) : 0;

          if ($change && $count > 2 || !$change && $count > 0) {
            $result[] = [
              'columnName' => $col['columnName'],
              'value'      => $item[$col['columnName']],
              'cause'      => 'Must be unique value',
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
              'cause'      => 'Must be Not Null value',
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
            //if (count($match)) {
              // $item[$col['columnName']] = $this->convertType($match[0], item);
            //}
          }
        }
      }

      if (count($param) && isset($k) && count($param[$k]) === 0) unset($param[$k]);
    }, $curTable);

    return $result;
  }

  /**
   * @param string $dbTable name of table
   * @param array|string $columns of columns, if size of array is 1 (except all column "*") return simple array,
   * @param $filters string filter
   */
  public function selectQuery(string $dbTable, array|string $columns = '*', string $filters = ''): array {
    $simple = false;
    if (!is_array($columns)) {
      $simple = $columns !== '*';
      $columns = [$columns];
    }

    $columns[0] !== '*' && $columns = array_map(function ($item) { return $this->setQueryAs($item); }, $columns);
    $sql = 'SELECT ' . implode(', ',  $columns) . ' FROM ' . $this->pf($dbTable);
    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    return $simple ? self::getCol($sql) : self::getAll($sql);
  }

  /**
   * Select all (*)
   */
  public function loadTable(string $dbTable, bool $typed = false): ?array {
    $result = self::getAll('SELECT * FROM ' . $this->pf($dbTable));

    if ($typed) {
      $columns = [];
      foreach ($this->getColumnsTable($dbTable) as $col) {
        $columns[$col['columnName']] = $this->getConvertDbType($col['type']);
      }

      $result = array_map(function ($row) use ($columns) {
        foreach ($columns as $name => $func) $row[$name] = $func($row[$name]);
        return $row;
      }, $result);
    }

    return $result;
  }

  public function checkHaveRows(string $dbTable, string $columnName, mixed $value): int {
    return intval(self::getCell("SELECT count(*) FROM " . $this->pf($dbTable) .
                                    " WHERE $columnName = :value", [':value' => $value]));
  }

  public function deleteItem(string $dbTable, array $ids, string $primaryKey = 'ID'): int {
    $dbTable = $this->pf($dbTable);
    $count = 0;
    if ($primaryKey !== 'ID') {
      foreach ($ids as $id) {
        $count += self::exec("DELETE FROM $dbTable WHERE $primaryKey = '$id'");
      }
      return $count;
    }

    if (count($ids) === 1) {
      $bean = self::xdispense($dbTable);
      $bean->id = $ids[0];
      $count = self::trash($bean);
    } else {
      $beans = self::xdispense($dbTable, count($ids));

      for ($i = 0; $i < count($ids); $i++) {
        $beans[$i]->id = $ids[$i];
      }

      $count = self::trashAll($beans);
    }
    return count($ids) === $count ? $count : 0;
  }

  /**
   * @throws RedException\SQL
   */
  public function getLastID(string $dbTable, array $requireParam = []): mixed {
    $bean = self::xdispense($this->pf($dbTable));
    foreach ($requireParam as $field => $value) $bean->$field = $value;
    self::store($bean);

    return $bean->getID();
  }

  public function getTables(string $like = ''): mixed
  {
    $like = $this->pf($like);
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

  public function getColumnsTable(string $dbTable): ?array {
    return self::getAll('SELECT COLUMN_NAME AS "columnName", COLUMN_TYPE AS "type",
                                    COLUMN_KEY AS "key", EXTRA AS "extra", IS_NULLABLE AS "null"
                             FROM information_schema.COLUMNS
                             WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :dbTable',
      [':dbName'  => $this->dbName,
       ':dbTable' => $this->pf($dbTable)]);
  }

  public function getCountRows(string $dbTable, string $filters = ''): int {
    $sql = "SELECT COUNT(*) AS 'count' from " . $this->pf($dbTable);

    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    $result = self::getRow($sql);

    if (count($result)) return $result['count'];
    return 0;
  }

  public function insert(array $curTable, string $dbTable, array $param, bool $change = false): array {
    if (count($param) === 0) return [];
    $result['error'] = $this->checkTableBefore($curTable, $dbTable, $param, $change);

    $beans = self::xdispense($this->pf($dbTable), count($param));

    $idColName = 'id';
    foreach ($curTable as $col) {
      if ($col['key'] === 'PRI') {
        $idColName = $col['columnName'];
        break;
      }
    }

    if (strtolower($idColName) !== 'id') {
      if ($change) {
        foreach ($param as $id => $item) {
          $sql = "UPDATE `$dbTable` SET ";
          foreach ($item as $k => $v) $sql .= "`$k` = '$v' ";
          $sql .= "WHERE `$idColName` LIKE '$id'";
          self::exec($sql);
        }
      } else {
        foreach ($param as $item) {
          $sql = "INSERT INTO `$dbTable` ";
          $sql .= '(' . implode(', ', array_keys($item)) . ') VALUES ';
          $sql .= '(\'' . implode('\', \'', array_values($item)) . '\')';
          self::exec($sql);
        }
      }
      return $result;
    }

    try {
      if (count($param) === 1) {
        foreach ($param as $id => $item) {
          $change && $beans->id = $id;

          foreach ($item as $k => $v) {
            if (isset($idColName) && $idColName === $k) continue;
            if (in_array($k, self::DB_JSON_FIELDS) && is_string($v) === false) $v = json_encode($v);
            $beans->$k = $v;
          }
        }
        self::store($beans);

      } else {

        $i = 0;
        foreach ($param as $id => $item) {
          $change && $beans[$i]->id = $id;

          foreach ($item as $k => $v) {
            if (in_array($k, self::DB_JSON_FIELDS) && is_string($v) === false) $v = json_encode($v);
            $beans[$i]->$k = $v;
          }
          $i++;
        }
        self::storeAll($beans);
      }
    } catch (RedException $e) {
      return [
        'result' => $result,
        'error'  => $e->getMessage(),
      ];
    }

    if ($change === false && count($param) === 1) {
      $result[$dbTable . 'Id'] = $beans->getID();
    }

    return $result;
  }

  public function execQuery(string $sql): int {
    return self::exec($sql);
  }


  // Locales
  //------------------------------------------------------------------------------------------------------------------

  public function loadLocales(): array {
    return self::getAll('SELECT * FROM locales');
  }


  // Files
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param mixed $ids - if sting use delimiter ","
   */
  public function getFiles(mixed $ids = false): array {
    if (is_string($ids) && !empty($ids)) $ids = explode(',', $ids);
    $filters = $ids ? ' ID = ' . implode(' or ID = ', $ids) : '';
    return $this->selectQuery('files', '*', $filters);
  }

  public function setFiles(object $file): array {
    $files = ['id' => ''];

    $name = $file->name ?? basename($file->path) ?? null;

    if (!empty($name)) {
      $inserted = $this->insert([], 'files', [[
        'name'   => $name,
        'path'   => $file->path,
        'format' => $file->type || pathinfo($name, PATHINFO_EXTENSION),
      ]]);
    } else {
      return ['error' => 'Error insert file info to Db'];
    }

    if (isset($inserted['filesId']) && is_numeric($inserted['filesId'])) {
      $files = [
        'id' => $inserted['filesId'],
        'name' => $file->name,
        'src' => $file->uri,
      ];
    }

    return $files;
  }


  // Settings/Dealers Properties only main cms
  //------------------------------------------------------------------------------------------------------------------

  private function parseSimpleProperty(string $type, mixed $value): string|bool|float
  {
    switch ($type) {
      default:
      case 'text':
      case 'textarea': return strval($value);
      case 'number': return floatval($value);
      //case 'date':
      case 'bool': return boolval($value);
    }
  }
  private function parseDbProperty(string $prop, string $type): string {
    $str = " `$prop` ";

    switch ($type) {
      case 'file': return " `$prop" . "_ids` varchar(255)";
      default: case 'text': case 'string': return $str . "varchar(255)";
      case 'textarea': return $str . "varchar(1000)";
      case 'int': return $str . "int(20) NOT NULL DEFAULT 1";
      case 'float': return $str . "float NOT NULL DEFAULT 1";
      case 'double': return $str . "double NOT NULL DEFAULT 1";
      case 'money': return $str . "decimal(10,4) NOT NULL DEFAULT 1.0000";
      case 'date': return $str . "timestamp";
      case 'bool': return $str . "int(1) NOT NULL DEFAULT 1";
    }
  }
  private function getPropertyTable(mixed $propValue, string $propName): mixed {
    static $propTables, $props;

    if (!$propTables) {
      $props = [];
      // Простые параметры
      if (($setting = $this->main->getSettings()) && isset($setting['optionProperties'])) {
        foreach ($setting['optionProperties'] as $prop => $value) {
          $props[$prop] = array_merge($value, ['simple' => true]);
        }
      }

      // Параметры из таблиц БД
      $propTables = $this->getTables('prop');
      foreach ($propTables as $table) {
        $props[$table['dbTable']] = $this->loadTable($table['dbTable']);
      }
    }

    if (!isset($props[$propName]) || !is_array($props[$propName]) ) return ['name' => 'Property table error'];

    $prop = $props[$propName];

    if (isset($prop['simple'])) return $this->parseSimpleProperty($prop['type'], $propValue);
    foreach ($props[$propName] as $item) if ($item['ID'] === $propValue) return $item;
    return ['name' => "Prop item: $propValue in $propName - not found!"];
  }

  public function createPropertyTable(string $dbTable, array $params) {
    $sql = "CREATE TABLE $dbTable (
            `ID` int(10) UNSIGNED NOT NULL,
            `name` varchar(255) NOT NULL DEFAULT 'NoName'";

    if (count($params)) {
      foreach ($params as $prop) {
        $sql .= ', ' . $this->parseDbProperty($prop['newName'], $prop['type']);
      }
    }

    $error = self::exec($sql . ')');
    !$error && $error = self::exec("ALTER TABLE `$dbTable` ADD PRIMARY KEY (`ID`)");
    !$error && $error = self::exec("ALTER TABLE `$dbTable` MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1");

    return $error;
  }

  public function changePropertyTable(string $dbTable, array $params): array {
    $error = [];
    $query = [];
    $sSql = "ALTER TABLE " . $this->pf($dbTable);

    if (count($params)) {
      $haveColumns = array_map(function ($column) {return $column['columnName'];}, $this->getColumnsTable($dbTable));
      array_shift($haveColumns);
      array_shift($haveColumns);

      // Add and change properties
      foreach ($params as $columnName => $param) {
        if (!in_array($columnName, $haveColumns)) {
          $query[] = $sSql . ' ADD ' . $this->parseDbProperty($columnName, $param['type']);
        } else {
          $query[] = $sSql . " CHANGE `$columnName` " . $this->parseDbProperty($param['newName'], $param['type']);
        }
      }

      // Drop properties
      $param = array_keys($params);
      foreach ($haveColumns as $column) {
        if (!in_array($column, $param)) {
          $query[] = $sSql . " DROP `$column`";
        }
      }

      foreach ($query as $sql) $error[] = self::exec($sql);
    }

    return $error;
  }

  public function loadPropertyTable(string $dbTable, array $ids): array {
    return self::getAll("SELECT * FROM $dbTable WHERE ID IN (" . self::genSlots($ids) . ' )', $ids);
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


  // Customers
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param array{pageNumber: int, countPerPage: int, sortColumn: string, sortDirect: bool} $pageParam
   */
  public function loadCustomers(array $pageParam, array $ids = []): array {
    $sql = "SELECT C.ID as 'id', name, ITN, contacts, GROUP_CONCAT(O.ID) as 'orders'
      FROM " . $this->pf('customers') . " C
      LEFT JOIN " . $this->pf('orders') . " O on C.ID = O.customer_id\n";

    if (count($ids)) {
      $sql .= "WHERE C.ID = ";
      if (count($ids) === 1) $sql .= $ids[0] . " ";
      else $sql .= implode(' OR C.ID = ', $ids) . " ";
    }

    $sql .= "GROUP BY C.ID\n";

    if (intval($pageParam['countPerPage']) < 1000) $sql .= $this->getPaginatorQuery($pageParam);

    return self::getAll($sql);
  }

  public function loadCustomerByOrderId(int|string $orderId): array {
    $sql = "SELECT C.ID as 'ID', C.name as 'name', ITN, contacts
      FROM " . $this->pf('orders') . " O 
      LEFT JOIN " . $this->pf('customers') . " C ON C.ID = O.customer_id
      WHERE O.ID = :id";

    return self::getRow($sql, [':id' => $orderId]);
  }


  // Money
  //--------------------------------------------------------------------------------------------------------------------

  public function getMoney(): array {
    $queryRes = $this->selectQuery('money');

    $res = [];
    foreach ($queryRes as $item) {
      $item['shortName'] = $item['short_name'];
      unset($item['short_name']);
      $item['lastEditDate'] = $item['last_edit_date'];
      unset($item['last_edit_date']);
      $item['scale'] = floatval($item['scale']);
      $item['rate'] = floatval($item['rate']);

      $res[$item['code']] = $item;
    }

    return $res;
  }

  /**
   * @throws RedException\SQL
   */
  public function setMoney(array $rate): void
  {
    $beans = self::xdispense($this->pf('money'), 1);
    $date = date($this::DB_DATE_FORMAT);

    foreach ($rate as $currency) {
      $beans->id = $currency['ID'];
      $beans->scale = $currency['scale'];
      $beans->rate = $currency['rate'];
      $beans->lastEditDate = $date;
      self::store($beans);
    }
  }


  // Dealers
  //--------------------------------------------------------------------------------------------------------------------

  public function parseDealerSettings(array $dealers): array {
    $properties = new Properties($this->main, 'dealer');

    $this->togglePrefix();
    foreach ($dealers as &$dealer) {
      $settings = [];
      $dealer['settings'] = $dealer['settings'] ?? [];

      foreach ($dealer['settings'] as $prop => $value) {
        [$propName, $propValue] = $properties->getValue($prop, $value);
        $settings[$propName] = $propValue;
      }

      $dealer['settings'] = $settings;
    }
    $this->togglePrefix();

    return $dealers;
  }

  public function setDealerLink(): bool
  {
    $m = $this->main;

    $sqlValue = $m->url->getSubDomain();
    if (($sqlValue === '' || $sqlValue === 'dev') && !$m->isDealer()) return false;

    $sql = "SELECT ID as 'id', name, cms_param AS 'cmsParam' FROM dealers";

    // Check by subdomain
    if ($sqlValue && $sqlValue !== 'dev') {
      $sqlValue = "%$sqlValue%";
      $sql .= " WHERE cms_param LIKE :value";
    } else {
      $sqlValue = $m->getCmsParam(VC::DEALER_ID);
      // Check by dealer id
      if ($sqlValue) {
        $sql .= " WHERE ID = :value";
      }
      // Check by dealer link
      else {
        $sqlValue = '%' . $m->getCmsParam(VC::DEALER_LINK) . '%';
        $sql .= " WHERE cms_param LIKE :value";
      }
    }

    $sql .= ' AND activity = 1 LIMIT 1';
    $dealer = $this->jsonParseField(self::getRow($sql, [':value' => $sqlValue]));

    if (isset($dealer['id']) && is_dir(ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR . $dealer['id'])) {
      $this->prefix = $dealer['cmsParam']['dbPrefix'] ?? $dealer['cmsParam']['prefix']; // Support old name

      $m->setCmsParam(VC::IS_DEALER, true)
        ->setCmsParam(VC::DEALER_ID, $dealer['id'])
        ->setCmsParam(VC::PROJECT_TITLE, $dealer['name']);
      return true;
    }

    $m->setCmsParam(VC::IS_DEALER, false);
    return false;
  }

  public function loadDealers(bool $activity = false, bool $parseSettings = true): array {
    $sql = "SELECT ID AS 'id', cms_param AS 'cmsParam', name, contacts, register_date AS 'registerDate', activity, settings
            FROM dealers";

    if ($activity) $sql .= " WHERE activity <> 0";

    $dealers = $this->jsonParseField(self::getAll($sql));
    return $parseSettings ? $this->parseDealerSettings($dealers) : $dealers;
  }

  public function loadDealersUsers(string $login = ''): array {
    $result = [];
    $dealers = $this->loadDealers(true, false);
    $dealers = array_map(function ($dealer) {
      return [
        'id'     => $dealer['id'],
        'urlPrefix' => $dealer['cmsParam']['urlPrefix'] ?? '',
        'dbPrefix'  => $dealer['cmsParam']['dbPrefix'] ?? $dealer['cmsParam']['prefix'], // Support old name
      ];
    }, $dealers);

    $countPerPart = 20;
    $countDealers = count($dealers);
    $countPart = ceil($countDealers / $countPerPart);

    for ($i = 0; $i < $countPart; $i++) {
      $sql = '';
      if ($login) $result = [];

      for ($j = 0; $j < $countPerPart; $j++) {
        $index = $i * $countPerPart + $j;
        if ($index >= $countDealers) break;

        $dealer = $dealers[$index];
        $sql .= " UNION SELECT ID as 'id', name, login, password, "
              . "'$dealer[id]' as dealerId, "
              . "'$dealer[urlPrefix]' as urlPrefix, "
              . "'$dealer[dbPrefix]' as dbPrefix "
              . "FROM $dealer[dbPrefix]users "
              . ' WHERE activity = 1';

        if ($login) $sql .= ' AND login = "' . $login . '"';
      }

      $result = array_merge($result, self::getAll(substr($sql, 7)));
      if ($login && count($result)) return $result;
    }

    return $result;
  }

  public function loadDealerById(?string $id = null, bool $parseSettings = true): array {
    $id = $id ?? $this->main->getCmsParam('dealerId');

    $sql = "SELECT ID AS 'id', name, contacts,
                   cms_param AS 'cmsParam',
                   register_date AS 'registerDate', activity, settings
            FROM dealers
            WHERE ID = :id";

    $dealer = $this->jsonParseField(self::getRow($sql, [':id' => $id]));

    return $parseSettings ? $this->parseDealerSettings([$dealer])[0] : $dealer;
  }
}
