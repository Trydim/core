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
   * @var Main
   */
  private $main;

  /**
   * @var int
   */
  private $currentUserID = 2;

  /**
   * @var boolean
   */
  private $usePrefix = true;

  /**
   * @var string
   */
  private $prefix;

  /**
   * @var string
   */
  private $dbName;

  /**
   * @var string
   */
  private $login;

  /**
   * @param Main $main
   * @param bool $freeze
   * @throws RedException
   */
  public function __construct(Main $main, bool $freeze = true) {
    $this->main = $main;

    if (USE_DATABASE) {
      $dbConfig = $main->getSettings(VC::DB_CONFIG);

      if (!count($dbConfig)) {
        require $main->url->getPath(true) . 'config.php';
        if (!count($dbConfig)) exit('Configs error');
      }

      $this->dbName = $dbConfig['dbName'];
      $this->setPrefix($dbConfig['dbPrefix'] ?? '');

      self::setup(
        'mysql:host=' . $dbConfig['dbHost'] . ';dbname=' . $dbConfig['dbName'],
        $dbConfig['dbUsername'],
        $dbConfig['dbPass']
      );

      !self::testConnection() && die('Data Base connect error!');

      $this->setting();

      //self::fancyDebug(DEBUG);
      self::freeze($freeze);
    }
  }

  /**
   * Plugin readBean for special name
   * @param $type
   * @param $count
   *
   * @return array|OODBBean|null
   */
  private function dis($type, $count) {
    return self::getRedBean()->dispense($type, $count);
  }

  /**
   * @throws RedException
   */
  private function setting() {
    self::ext('xdispense', function ($type, $count = 1) {
      return $this->dis($type, $count);
    });
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

  /**
   * @param array $arr
   * @return array
   */
  private function jsonParseField(array $arr): array {
    $result = [];
    //$arr = array_flatten($arr);

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

  /**
   * @param array $arr
   * @return array
   */
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
   * @param string $key
   * @param array $dbConfig
   * @param bool $freeze
   * @return $this
   * @throws RedException
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
   * Select a database,
   * @param string $key
   * @return $this
   * @throws RedException
   */
  public function selectDb(string $key): DbMain {
    self::selectDatabase($key);

    return $this;
  }

  /**
   * What does this function do?
   * @param $varName
   * @return string
   */
  public function setQueryAs($varName): string {
    return AQueryWriter::camelsSnake($varName) . " AS '$varName'";
  }

  /**
   * @param string|integer $date
   * @return false|string|null
   */
  public function getDbDateString($date) {
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
   * Use or not prefix
   * @return boolean
   */
  public function togglePrefix(): bool {
    return $this->usePrefix = !$this->usePrefix;
  }

  // MAIN query
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param string $type
   * @return Closure
   */
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
   *
   * @param $curTable
   * @param string $dbTable
   * @param $param - link
   * @param boolean $change - link
   * @return array
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
   *
   * @return array
   */
  public function selectQuery(string $dbTable, $columns = '*', string $filters = ''): array {
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
   * select all (*)
   * @param string $dbTable
   * @param bool $typed
   *
   * @return array|null
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

  /**
   * @param $dbTable
   * @param $columnName
   * @param $value
   *
   * @return integer
   */
  public function checkHaveRows($dbTable, $columnName, $value): int {
    return intval(self::getCell("SELECT count(*) FROM " . $this->pf($dbTable) .
                                    " WHERE $columnName = :value", [':value' => $value]));
  }

  /**
   * @param string $dbTable
   * @param array $ids
   * @param string $primaryKey
   *
   * @return int
   */
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
    return $count;
  }

  /**
   * @param string $dbTable
   * @param array $requireParam
   * @return mixed
   * @throws RedException\SQL
   */
  public function getLastID(string $dbTable, array $requireParam = []) {
    $bean = self::xdispense($this->pf($dbTable));
    foreach ($requireParam as $field => $value) $bean->$field = $value;
    self::store($bean);

    return $bean->getID();
  }

  /**
   * @param string $like
   * @return mixed|null
   */
  public function getTables(string $like = '') {
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

  /**
   * get columns table
   * @param $dbTable
   *
   * @return array|null
   */
  public function getColumnsTable($dbTable): ?array {
    return self::getAll('SELECT COLUMN_NAME AS "columnName", COLUMN_TYPE AS "type",
                                    COLUMN_KEY AS "key", EXTRA AS "extra", IS_NULLABLE AS "null"
                             FROM information_schema.COLUMNS
                             WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :dbTable',
      [':dbName'  => $this->dbName,
       ':dbTable' => $this->pf($dbTable)]);
  }

  /**
   * @param $dbTable
   * @param string $filters
   *
   * @return integer
   */
  public function getCountRows($dbTable, string $filters = ''): int {
    $sql = "SELECT COUNT(*) AS 'count' from " . $this->pf($dbTable);

    if (strlen($filters)) $sql .= ' WHERE ' . $filters;

    $result = self::getRow($sql);

    if (count($result)) return $result['count'];
    return 0;
  }

  /**
   * insert or change rows
   *
   * @param array $curTable
   * @param string $dbTable
   * @param array $param
   * @param bool $change
   *
   * @return array
   */
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

  // Files
  //------------------------------------------------------------------------------------------------------------------

  /**
   * @param mixed $ids - if sting use delimiter ","
   *
   * @return array
   */
  public function getFiles($ids = false): array {
    if (is_string($ids) && !empty($ids)) $ids = explode(',', $ids);
    $filters = $ids ? ' ID = ' . implode(' or ID = ', $ids) : '';
    return $this->selectQuery('files', '*', $filters);
  }

  /**
   * @param object $file
   * @return array
   */
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

  // Elements
  //------------------------------------------------------------------------------------------------------------------

  public function loadElements($sectionID, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'C.name', $sortDirect = false): ?array {
    $pageNumber *= $countPerPage;

    $sql = "SELECT E.ID AS 'id', E.name AS 'name', E.activity AS 'activity', E.sort AS 'sort', E.last_edit_date AS 'lastEditDate',
                   C.symbol_code AS 'symbolCode', C.name AS 'codeName', IF(COUNT(E.ID) = 1, true, false) AS 'simple'
            FROM " . $this->pf('elements') . " E
            JOIN " . $this->pf('codes') . " C on C.symbol_code = E.element_type_code
            JOIN " . $this->pf('options_elements') . " O on E.ID = O.element_id
            WHERE E.section_parent_id = $sectionID
            GROUP BY E.ID
            ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '') . " LIMIT $countPerPage OFFSET $pageNumber";

    return self::getAll($sql);
  }

  public function searchElements($searchValue, $pageNumber = 0, $countPerPage = 20, $sortColumn = 'C.name', $sortDirect = false): array {
    $pageNumber *= $countPerPage;
    $searchValue = str_replace(' ', '%', $searchValue);

    $sql = "SELECT E.ID AS 'id', E.name AS 'name', E.activity AS 'activity', E.sort AS 'sort', E.last_edit_date AS 'lastEditDate',
                   C.symbol_code AS 'symbolCode', C.name AS 'codeName', IF(COUNT(E.ID) = 1, true, false) AS 'simple'
            FROM " . $this->pf('elements') . " E
            JOIN " . $this->pf('codes') . " C on C.symbol_code = E.element_type_code
            JOIN " . $this->pf('options_elements') . " O on E.ID = O.element_id
            WHERE E.name LIKE '%$searchValue%'
            GROUP BY E.ID
            ORDER BY $sortColumn " . ($sortDirect ? 'DESC' : '');

    $res = self::getAll($sql);

    return [
      'elements'          => array_slice($res, $pageNumber, $countPerPage),
      'countRowsElements' => count($res)
    ];
  }

  // Options
  //------------------------------------------------------------------------------------------------------------------

  private function setImages(string $imagesIds = ''): array {
    $images = $this->getFiles($imagesIds);

    return array_map(function ($item) {
      $path = FS::findingFile($item['path']);
      $item['id'] = $item['ID'];
      $item['path'] = $item['src'] = $path
        ? $this->main->url->getUri(true) . str_replace([ABS_SITE_PATH, '\\'], ['', '/'], $path)
        : $item['ID'] . '_' . $item['name'] . '_' . $item['path'];

      unset($item['ID']);
      return $item;
    }, $images);
  }
  private function getAlias(string $table): string {
    $tables = ['codes.', 'money.', 'options_elements.', 'elements.', 'units.'];
    $alias = ['C.', 'M.', 'O.', 'E.', 'U.'];
    $table = str_replace($tables, $alias, $table);

    $cols = ['.id', '.type', '.unit', '.lastDate'];
    $alias = ['.ID', '.element_type_code', '.short_name', '.last_edit_date'];
    return str_replace($cols, $alias, $table);
  }

  public function loadFiles(): array {
    return $this->setImages();
  }

  /**
   * Для страницы Catalog
   * @param string $elementID
   * @return array|null
   */
  public function openOptions(string $elementID): ?array {
    $sql = "SELECT O.ID AS 'id',
                   MI.short_name AS 'moneyInputName', MI.ID AS 'moneyInputId', 
                   MO.short_name as 'moneyOutputName', MO.ID AS 'moneyOutputId',
                   images_ids AS 'images', properties,
                   O.name AS 'name', U.ID AS 'unitId', U.name AS 'unitName', O.last_edit_date AS 'lastEditDate', O.activity AS 'activity', sort,
                   input_price AS 'inputPrice', output_percent AS 'outputPercent', output_price AS 'outputPrice'
            FROM " . $this->pf('options_elements') . " O
            JOIN " . $this->pf('money') . " MI on MI.ID = O.money_input_id
            JOIN " . $this->pf('money') . " MO on MO.ID = O.money_output_id
            JOIN " . $this->pf('units') . " U on U.ID = O.unit_id
            WHERE element_id = $elementID";

    return array_map(function ($option) {
      // set images
      $option['images'] = strlen($option['images']) ? $this->setImages($option['images']) : [];

      // set property
      $option['properties'] = json_decode($option['properties'] ?: '[]');

      return $option;
    }, self::getAll($sql));
  }

  /**
   * Load for calculator
   * @param array  $filter
   * @param int    $pageNumber
   * @param int    $countPerPage
   * @return array
   */
  public function loadOptions(array $filter = [], int $pageNumber = 0, int $countPerPage = -1): array {
    $sql = "SELECT O.ID AS 'id', element_id AS 'elementId', 
                   E.element_type_code AS 'type', E.sort AS 'elementSort',
                   O.name AS 'name', U.short_name AS 'unit', O.activity AS 'activity',
                   O.sort AS 'sort', O.last_edit_date AS 'lastDate', properties, images_ids AS 'images',
                   MI.code AS 'moneyInput', MO.code AS 'moneyOutput',
                   input_price AS 'inputPrice', output_percent AS 'outputPercent', output_price AS 'price'
            FROM " . $this->pf('options_elements') . " O
            JOIN " . $this->pf('elements') . " E ON E.ID = O.element_id
            JOIN section S ON S.ID = E.section_parent_id
            JOIN " . $this->pf('money') . " MI ON MI.ID = O.money_input_id
            JOIN " . $this->pf('money') . " MO ON MO.ID = O.money_output_id
            JOIN " . $this->pf('units') . " U ON U.ID = O.unit_id
            WHERE S.active <> 0 AND E.activity <> 0 AND O.activity <> 0";

    // Filter
    if (count($filter)) {
      $filterArr = [];
      foreach ($filter as $k => $values) {
        $k = $this->getAlias(AQueryWriter::camelsSnake($k));
        $values = convertToArray($values);
        $str = '(';
        foreach($values as $index => $v) {
          $index > 0 && $str .= " OR ";
          $str .= "$k LIKE '$v'";
        }
        $filterArr[] = $str . ')';
      }

      $sql .= ' AND ' . implode(' AND ', $filterArr);
      unset($filterArr, $filter, $k, $v, $values, $str, $index);
    }
    // Sorting
    $sql .= ' ORDER BY E.sort, O.sort';
    // Paginate
    if ($countPerPage !== -1) {
      $pageNumber *= $countPerPage;
      $sql .= " LIMIT $countPerPage OFFSET $pageNumber";
    }

    $options = self::getAll($sql);

    return array_map(function ($option) {
      // Set images
      if (strlen($option['images'])) {
        $option['images'] = $this->setImages($option['images']);
      }

      // Set property
      $properties = json_decode($option['properties'] ?: '[]', true);
      $option['properties'] = [];
      foreach ($properties as $property => $id) {
        $propName = str_replace('prop_', '', $property);
        $option['properties'][$propName] = $this->getPropertyTable($id, $property);
      }

      return $option;
    }, $options);
  }

  // Property only main cms
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
  private function getPropertyTable($propValue, $propName) {
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
    //$dbTable = $this->pf($dbTable);

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

  /**
   * @param string $dbTable
   * @param array $params
   * @return array
   */
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

  /**
   * @param string $dbTable
   * @param array $ids
   * @return array
   */
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
   * @param array $pageParam[int 'pageNumber', int 'countPerPage', string 'sortColumn', bool 'sortDirect']
   * @param array $ids
   *
   * @return string[][]
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

  public function loadCustomerByOrderId($orderId): array {
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
  public function setMoney($rate) {
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

  private function parseDealerSettings(array $dealers): array {
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

  public function setDealerLink() {
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

  /**
   * Load all users by all dealers
   * @param string $login
   * @return array
   */
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

      $result = array_merge($result, self::getAll(substr($sql, 7), [':login' => $login]));
      if ($login && count($result)) return $result;
    }

    return $result;
  }

  public function loadDealerById(string $id = null): array {
    $id = $id ?? $this->main->getCmsParam('dealerId');

    $sql = "SELECT ID AS 'id', name, contacts,
                   cms_param AS 'cmsParam',
                   register_date AS 'registerDate', activity, settings
            FROM dealers
            WHERE ID = :id";

    $dealer = $this->jsonParseField(self::getRow($sql, [':id' => $id]));

    return $this->parseDealerSettings([$dealer])[0];
  }
}
