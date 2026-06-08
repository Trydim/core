<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main
 * @var array $dbConfig - config from public
 * @var string $cmsAction - extract from query in head.php
 */

$result = [];
$db = $main->getDB();

$dbTable = $dbTable ?? $tableName ?? '';

stripos($dbTable, '.csv') === false && $dbTable = basename($dbTable);

if ($cmsAction === 'tables') { // Добавить фильтрацию таблиц
  $result[$cmsAction] = $db->getTables();
  $result['csvFiles'] = $db->scanDirCsv($main->getCmsParam(VC::CSV_PATH));
} else {
  $columns = [];
  if ($dbTable) {
    if (stripos($dbTable, '.csv')) $db->setCsvTable($dbTable);
    else if (USE_DATABASE && $dbTable !== 'content-js') {
      $columns = $db->getColumnsTable($dbTable);
      if (!count($columns)) {
        $dbTable = $db->getTables($dbTable);
        if (count($dbTable)) {
          $dbTable = $dbTable[0]['dbTable'];
          $columns = $db->getColumnsTable($dbTable);
        }
      }
    }/**/
  }

  $pageNumber = $currPage ?? 0;
  $countPerPage = $countPerPage ?? 20;
  $sortDirect = $sortDirect ?? 'true';

  $pagerParam = [
    'pageNumber'   => $pageNumber,
    'countPerPage' => $countPerPage,
    'sortColumn'   => $sortColumn ?? 'id',
    'sortDirect'   => $sortDirect,
  ];

  switch ($cmsAction) {
      // Tables
    case 'showTable':
      $result['columns'] = $columns;
      if (stripos($dbTable, '.csv')) $result['csvValues'] = $db->openCsv();
      elseif ($dbTable === 'content-js') $result['content'] = $db->loadContentEditorData();
      else {
        if (USE_DATABASE) {
          $result['dbValues'] = $db->loadTable($dbTable);
        } else {
          $dbTable = $db->getTables($dbTable);
          count($dbTable) && $result['dbValues'] = $db->loadTable($dbTable[0]['dbTable']);
        }
      }
      break;
    case 'saveTable':
      if (!empty($dbData)) {
        $column = array_filter($columns, function ($col) {
          return $col['key'] === 'PRI';
        });
        $priColumn = count($column) ? $column[0]['columnName'] : false;

        $dbDataOld = $db->loadTable($dbTable);
        $dbData = json_decode($dbData, true);

        $find = function ($array, $testRow) use ($priColumn) {
          return array_values(array_filter($array, function ($row) use ($priColumn, $testRow) {
            return $row[$priColumn] === $testRow[$priColumn];
          }));
        };

        // Delete
        $deleted = [];
        foreach ($dbDataOld as $index => $rowOld) {
          $have = $find($dbData, $rowOld);
          if (!count($have)) {
            $deleted[] = $rowOld[$priColumn];
            array_splice($dbDataOld, $index, 1);
          }
        }
        count($deleted) && $result['deleteCount'] = $db->deleteItem($dbTable, $deleted, $priColumn);

        // Insert & Update
        $added = [];
        $changed = [];
        foreach ($dbData as $row) {
          $have = $find($dbDataOld, $row);
          if (count($have)) {
            $dif = array_diff_assoc($row, $have[0]);
            !empty($dif) && $changed[$row[$priColumn]] = $row;
          } else {
            $added[] = $row;
          }
        }
        count($added) && $result['insert'] = $db->insert($columns, $dbTable, $added);
        count($changed) && $result['change'] = $db->insert($columns, $dbTable, $changed, true);
      } else if (!empty($csvData)) {
        $db->saveCsv(json_decode($csvData));
      } else if (!empty($contentData)) {
        $db->saveContentEditorData($contentData);
      } else {
        $result['error'] = '[db:save]: Nothing to save!';
      }
      break;
    case 'loadTable':
      $tables = json_decode($tables ?? '[]', true);

      if (count($tables) === 0) {
        if (empty($tableName)) { $result['error'] = '[db:loadTable]: Invalid table name'; break; }

        $arrTable[] = [
          'param' => json_decode($columns ?? '{}', true),
          'file'  => $tableName,
        ];
      }

      foreach ($tables as $file => $param) {
        $key = pathinfo($file, PATHINFO_FILENAME);

        $result[$key] = loadCSV(
          is_array($param ?? null) ? $param : [],
          $file,
          false,
          true
        );

        if ($param['saveJson'] ?? false) {
          file_put_contents(
            ABS_SITE_PATH . SHARE_PATH . 'json/' . str_replace('.csv', '.json', $file),
            json_encode($result[$key]),
          );
        }
      }
      break;
    case 'loadFormsTable':
    case 'loadCsvConfig':
      if (isset($dbTable)) {
        $result['csvValues'] = $db->openCsv();
        $result['configValues'] = CsvConfig::syncFile($dbTable);
        $result['configProperties'] = $main->getSettings(VC::TABLE_CONFIG_PROPERTIES);
      }
      break;
    case 'saveCsvConfig':
      if (isset($dbTable) && isset($csvConfig) && isset($configProperties)) {
        $result['error'] = CsvConfig::saveConfig($dbTable, $csvConfig);

        // if (empty($result['error'])) { }
        $main->setSettings(VC::TABLE_CONFIG_PROPERTIES, json_decode($configProperties))->saveSettings();
      }
      break;

      // Orders
    case 'saveOrder':
      if (isset($reportValue)) {
        $customerId = intval($customerId ?? 0);
        $customerChange = $customerId === 0 || boolValue($customerChange ?? true);
        $customerId = $customerId !== 0 ? $customerId : $db->getLastID('customers');

        // If customer id is missing
        $result = $db->selectQuery('customers', '*', " id = $customerId");
        if (!count($result)) { $customerChange = true; $customerId = 0; }

        if ($customerChange) {
          $param = [$customerId => [
            'name' => $name ?? 'No name',
            'ITN'  => $ITN ?? $itn ?? '',
            'contacts' => json_encode([
              'phone'   => $phone ?? '',
              'email'   => $email ?? '',
              'address' => $address ?? '',
            ]),
          ]];

          $result = $db->insert($db->getColumnsTable('customers'), 'customers', $param, true);
        }

        // Set Status Id
        $statusId = $statusId ?? $main->getSettings(VC::STATUS_DEFAULT) ?? 1;
        if (isset($statusCode)) {
          $status = $db->loadOrderStatus(" code = '$statusCode'");
          if (count($status) === 1) $statusId = $status[0]['id'];
        }

        // Set order id, if have $orderId, then the order will be change.
        $orderId = intval($orderId ?? 0);
        $orderChange = $orderId !== 0;
        $orderId = $orderId !== 0 ? $orderId
          : $db->getLastID(
            'orders',
            [
              'status_id'   => $statusId,
              'customer_id' => $customerId
            ]
          );
        $orderTotal = $orderTotal ?? 0;

        if ($orderChange) {
          $param = [
            'customer_id'  => $customerId,
            'report_value' => gzcompress($reportValue, 9),
          ];

          isset($userId) && $param['user_id'] = $userId;
          isset($statusId) && $param['status_id'] = $statusId;
          $orderTotal !== 0 && $param['total'] = floatval(is_finite($orderTotal) ? $orderTotal : 0);
          isset($importantValue) && $param['important_value'] = addCpNumber($orderId, $importantValue);
          isset($saveValue) && $param['save_value'] = $saveValue;
        } else {
          $param = [
            'user_id'     => $main->getLogin('id'),
            'customer_id' => $customerId,
            'status_id'   => $statusId,
            'total'       => floatval(is_finite($orderTotal) ? $orderTotal : 0),
            'important_value' => addCpNumber($orderId, $importantValue ?? '{}'),
            'save_value'      => $saveValue ?? '{}',
            'report_value'    => gzcompress($reportValue, 9),
          ];
        }

        $result = $db->insert($db->getColumnsTable('orders'), 'orders', [$orderId => $param], true);

        $result['customerId'] = $customerId;
        $result['orderId']    = $orderId;
        $result['saveDate']   = date('Y-m-d H:i:s');
      }
      break;
    case 'changeOrders':
      $orderIds = json_decode($orderIds ?? '[]');
      if (!is_array($orderIds)) $orderIds = [$orderIds];

      if (count($orderIds)) {
        $param = [];
        //$single = count($orderIds) === 1;

        $statusId = $statusId ?? false;
        if (isset($statusCode)) {
          $status = $db->loadOrderStatus(" code = '" . $statusCode . "'");
          if (count($status)) $statusId = $status[0]['id'];
        }

        foreach ($orderIds as $id) {
          isset($userId)         && $param[$id]['user_id']     = $userId;
          isset($customerId)     && $param[$id]['customer_id'] = $customerId;
          isset($orderTotal)     && $param[$id]['total']       = $orderTotal;
          isset($total)          && $param[$id]['total']       = $total;
          isset($importantValue) && $param[$id]['important_value'] = isset($orderId) ? addCpNumber($orderId, $importantValue) : $importantValue;
          isset($saveValue)      && $param[$id]['save_value']  = $saveValue;
          if ($statusId) $param[$id]['status_id'] = $statusId;
        }

        if (count($param)) {
          $result = $db->insert($db->getColumnsTable('orders'), 'orders', $param, true);
        } else {
          $result['error'] = '[db:changeOrders]: Cannot change orders: parameters are empty';
        }
      }
      break;
    case 'loadOrders':
      if (isset($orderIds)) {
        $result['orders'] = $db->loadOrdersById(json_decode($orderIds, true));
      } else if (isset($ordersFilter)) { // Загрузка по менеджеру, клиенту и/или статусу
        $ordersFilter = json_decode($ordersFilter, true);
        $result['orders'] = $db->loadOrders($pagerParam, $ordersFilter);

        // Date range
        $filter = '';
        $connect = '';
        if (isset($ordersFilter['dateCreateFrom']) || isset($ordersFilter['dateCreateTo'])) {
          $from = $db->getDbDateString($ordersFilter['dateCreateFrom'] ?? '2000-01-01 00:00:00');
          $to   = $db->getDbDateString($ordersFilter['dateCreateTo'] ?? '2100-01-01 00:00:00');
          $filter .= "(create_date BETWEEN '$from' AND '$to')\n";
          $connect = ' AND ';
        }
        else if (isset($ordersFilter['dateEditedFrom']) || isset($ordersFilter['dateEditedTo'])) {
          $from = $db->getDbDateString($ordersFilter['dateEditedFrom'] ?? '2000-01-01 00:00:00');
          $to   = $db->getDbDateString($ordersFilter['dateEditedTo'] ?? '2100-01-01 00:00:00');
          $filter .= $connect . "(last_edit_date BETWEEN '$from' AND '$to')\n";
          $connect = ' AND ';
        }
        if (isset($ordersFilter['userId'])) {
          $userId = $ordersFilter['userId'];
          $filter .= $connect . 'user_id = ' . implode(' or user_id = ', is_array($userId) ? $userId : [$userId]);
          $connect = ' AND ';
        }
        if (isset($ordersFilter['customerId'])) {
          $filter .= $connect . 'customer_id = ' . $ordersFilter['customerId'];
          $connect = ' AND ';
        }
        if (isset($ordersFilter['statusId'])) {
          $statusId = $ordersFilter['statusId'];
          $filter .= $connect .'status_id = ' . implode(' or status_id = ', is_array($statusId) ? $statusId : [$statusId]);
          $connect = ' AND ';
        }

        $result['countRows'] = $db->getCountRows('orders', $filter);
      } else {
        $dateRange = json_decode($dateRange ?? '[]', true);
        $result['orders'] = $db->loadOrders($pagerParam, $dateRange);
        $result['countRows'] = $db->getCountRows('orders');
      }
      $result['statusOrders'] = $db->loadOrderStatus();
      break;
    case 'searchOrder':
      if (isset($searchValue)) {
        $ordersFilter = json_decode($ordersFilter ?? '[]', true);

        $result['orders'] = $db->searchOrders($pagerParam, $searchValue, $ordersFilter);
        $result['countRows'] = count($result['orders']);
      }
      break;
    case 'changeStatusOrder':
      if (isset($orderIds) && isset($statusId)) {
        $orderIds = explode(',', $orderIds);

        if (!is_numeric($statusId)) { $result['error'] = '[db:changeStatusOrder]: Status ID is invalid'; break; }

        if (!isset($currentStatusId)) { $result['error'] = '[db:changeStatusOrder]: Current status ID is missing'; break; }

        if (!is_numeric($currentStatusId)) { $result['error'] = '[db:changeStatusOrder]: Current status ID is invalid'; break; }

        $result = $db->changeOrdersStatus($orderIds, intval($statusId), intval($currentStatusId), [
          'id'      => $main->getLogin('id'),
          'name'    => $main->getLogin('name') ?: $main->getLogin(),
          'comment' => $statusComment ?? $comment ?? null,
        ]);
      }
      break;
    case 'delOrders':
      $orderIds = explode(',', $orderIds ?? '');
      if (count($orderIds)) $db->deleteItem('orders', $orderIds);
      break;

      // VisitorOrders
    case 'saveVisitorOrder':
      if (isset($reportValue)) {
        $orderTotal = $orderTotal ?? 0;

        $param = [
          'save_value'     => $saveValue ?? '{}',
          'important_value' => addCpNumber(0, $importantValue ?? '{}'),
          'report_value'    => gzcompress($reportValue, 9),
          'total'           => floatval(is_finite($orderTotal) ? $orderTotal : 0),
        ];

        isset($importantValue) && $importantValue !== 'false' && $param['importantValue'] = $importantValue;

        $result['orderId'] = $db->saveVisitorOrder($param);
      }
      break;
    case 'loadVisitorOrders':
      !isset($sortColumn) && $pagerParam['sortColumn'] = 'createDate';

      $result['countRows'] = $db->getCountRows('client_orders');
      $result['orders'] = $db->loadVisitorOrder($pagerParam);
      break;
    case 'searchVisitorOrders':
      if (isset($searchValue)) {
        $result['orders'] = $db->searchVisitorOrders($pagerParam, $searchValue);
        $result['countRows'] = count($result['orders']);
      }
      break;
    case 'delVisitorOrders':
      $orderIds = explode(',', $orderIds ?? '');
      if (count($orderIds)) $db->deleteItem('client_orders', $orderIds);
      break;

      // Customers
    case 'loadCustomerByOrder':
      if (isset($orderId) && is_numeric($orderId)) {
        $result['customer'] = $db->loadCustomerByOrderId($orderId);
        $result['users'] = $db->getUserByOrderId($orderId);
      }
      break;
    case 'loadCustomers':
      // Значит нужны все заказчики
      if ($countPerPage > 999) $pagerParam['countPerPage'] = 1000000;
      else $result['countRows'] = $db->getCountRows('customers');

      $result['customers'] = $db->loadCustomers($pagerParam, json_decode($customerIds ?? '[]'));
      break;
    case 'addCustomer':
    case 'changeCustomer':
      $changeCustomer = isset($customerId) && is_finite($customerId);
      $customerId = $customerId ?? 0;
      $param = [$customerId => []];
      $customer = json_decode($authForm ?? '[]', true);

      $contacts = [];
      foreach ($customer as $k => $v) {
        if ($k === 'cType') continue;
        if (in_array($k, ['name', 'ITN'])) $param[$customerId][$k] = $v;
        else $contacts[$k] = $v;
      }
      count($contacts) && $param[$customerId]['contacts'] = json_encode($contacts);

      $db->insert($columns, 'customers', $param, $changeCustomer);
      break;
    case 'delCustomer':
      $usersId = json_decode($customerId ?? '[]');
      if (count($usersId)) $result['customers'] = $db->deleteItem('customers', $usersId);
      break;

      // Permission
    //case 'loadPermission': break;

      // Rate
    case 'loadRate':
      $result['rate'] = $db->getMoney();
      break;

      // Users
    case 'loadUser':
      if (isset($userId)) $result['user'] = $db->getUserById($userId);
      else if(isset($userLogin)) $result['user'] = $db->getUserByLogin($userLogin);
      else $result['error'] = '[db:loadUser]: User ID or login does not exist';
      break;
    case 'loadUsers':
      $useRoot = $main->hasDealers() && !$main->isDealer();

      //if (isset($searchValue)) {$filters = ''}

      $result = [
        'countRows' => $db->getCountRows($useRoot ? 'root_users' : 'users'),
        'users'     => $useRoot ? $db->loadRootUsers($pagerParam) : $db->loadUsers($pagerParam),
      ];
      break;
    case 'addUser':
      $useRoot = $main->hasDealers() && !$main->isDealer();
      $dbTable = $useRoot ? 'root_users' : 'users';

      $user = json_decode($authForm ?? '[]', true);

      $haveName = $db->selectQuery($dbTable, 'id', ' login = "' . $user['login'] . '"');
      if (count($haveName) > 0) {
        $result['error'] = '[db:addUser]: Login already exists';
        break;
      }

      $param = [];
      $contacts = [];
      foreach ($user as $k => $v) {
        if (in_array($k, ['login', 'name', 'permissionId'])) $param[$k] = $v;
        else if ($k === 'password') $param[$k] = password_hash($v, PASSWORD_BCRYPT);
        else if ($k === 'activity') $param[$k] = '1';
        else $contacts[$k] = $v;
      }
      $param['contacts'] = json_encode($contacts);

      $result = $db->insert($db->getColumnsTable($dbTable), $dbTable, ['0' => $param]);
      break;
    case 'changeUser':
      $useRoot = $main->hasDealers() && !$main->isDealer();
      $dbTable = $useRoot ? 'root_users' : 'users';

      $usersId = json_decode($usersId ?? '[]');
      $authForm = json_decode($authForm ?? '[]', true);

      if (count($usersId)) {
        $param = [];

        if (count($usersId) === 1) {
          $haveName = $db->selectQuery($dbTable, ['id', 'login'], ' login = "' . $authForm['login'] . '"');
          if (count($haveName) && $haveName[0]['id'] !== $usersId[0]) {
            $result['error'] = '[db:changeUser]: Login already exists';
            break;
          }
        }

        foreach ($usersId as $id) {
          $param[$id] = ['activity' => '0'];
          $contacts = [];
          foreach ($authForm as $k => $v) {
            if (in_array($k, ['login', 'name', 'permissionId'])) $param[$id][$k] = $v;
            else if ($k === 'activity') $param[$id][$k] = '1';
            else $contacts[$k] = $v;
          }
          count($contacts) && $param[$id]['contacts'] = json_encode($contacts);
        }

        $result = $db->insert($db->getColumnsTable($dbTable), $dbTable, $param, true);

        // If this is the current user, the login session will be updated
        if (empty($result['error']) && count($usersId) === 1 && $main->getLogin('id') === $usersId[0]) {
          $_SESSION['login'] = $authForm['login'];
        }
      }
      break;
    case 'changeUserPassword':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId) === 1 && isset($validPass)) {
        $param[$usersId[0]]['password'] = password_hash($validPass, PASSWORD_BCRYPT);

        $useRoot = $main->hasDealers() && !$main->isDealer();
        $dbTable = $useRoot ? 'root_users' : 'users';
        $result = $db->insert($db->getColumnsTable($dbTable), $dbTable, $param, true);

        // If this is the current user, the session password will be updated
        if ($main->getLogin('id') === $usersId[0]) {
          $_SESSION['password'] = $validPass;
        }
      }
      break;
    case 'delUser':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId)) {
        $useRoot = $main->hasDealers() && !$main->isDealer();
        $dbTable = $useRoot ? 'root_users' : 'users';
        $db->deleteItem($dbTable, $usersId);
      }
      break;
    case 'loadUsersLogin':
      $result['users'] = array_unique(array_merge(
        $db->selectQuery('root_users', 'login'),
        $db->selectQuery('users', 'login')
      ));
      break;

      // Files
    case 'uploadFiles':
      $result = (new FS($main))->saveAllFromRequest();
      break;
    case 'loadFiles':
      $result['files'] = ['loadFiles method was removed'];
      break;

      // Dealers
    case 'addDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $dealerName = trim($dealer['name']);
        if (strlen($dealerName) < 2) { $result['error'] = '[db:addDealer]: Name must be 2 or more chars!'; break; }

        $login = trim($dealer['login'] ?? '');
        $pass = password_hash($dealer['password'] ?? 123, PASSWORD_BCRYPT);

        $urlPrefix = strtolower(preg_replace('/[^a-zA-Z]/i', '', translit($dealerName)));

        $id = $db->getLastID('dealers', ['name' => 'tmp']);
        $param = [
          'name'      => $dealerName,
          'cms_param' => json_encode(['urlPrefix' => $urlPrefix]),
          'contacts'  => json_encode($dealer['contacts']),
          'activity'  => intval(boolValue($dealer['activity'] ?? true)),
          'settings'  => gzcompress(json_encode($dealer['settings']), 9),
        ];

        $result = $db->insert($columns, 'dealers', [$id => $param], true);

        if ($login === '') $login = 'dealer' . $id;

        $main->dealer->create($id, [
          'dealerName' => $dealerName,
          'dbConfig'   => $main->getSettings(VC::DB_CONFIG),
        ], [
          'login'  => $login,
          'pass'   => $pass,
        ]);
      }
      break;
    case 'loadDealers':
      $result['dealers'] = $db->loadDealers(false, false);
      break;
    case 'loadDealerUsers':
      $dealer = $db->loadDealerById($main->url->request->get('dealerId'));

      $result['dealerUsers'] = $db->selectQuery('users');
      break;
    case 'changeDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $dealerName = trim($dealer['name']);
        if (strlen($dealerName) < 2) { $result['error'] = '[db:changeDealer]: Name must be 2 or more chars!'; break; }

        $param = [
          'name'     => $dealerName,
          'contacts' => json_encode($dealer['contacts']),
          'activity' => intval(boolValue($dealer['activity'] ?? true)),
          'settings' => gzcompress(json_encode($dealer['settings']), 9),
        ];

        $result = $db->insert($columns, $dbTable, [$dealer['id'] => $param], true);

        $login = $dealer['login'] ?? null;
        $pass  = $dealer['password'] ?? null;
        if (is_string($login) && is_string($pass)) {
          if (strlen($login) > 2 && strlen($pass) > 2) {
            $dealer = $db->loadDealerById($dealer['id']);

            $change = $db->getUserById(1);

            $param = ['login' => $login, 'password' => password_hash($pass, PASSWORD_BCRYPT)];
            $result = $db->insert($db->getColumnsTable('users'), 'users', [1 => $param], true);
          } else {
            $result['error'] = '[db:changeDealer]: Login or password is invalid!';
          }
        }
      }
      break;
    case 'deleteDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);
        $id = $dealer['id'];

        $dealer = $db->selectQuery('dealers', ['cms_param'], ' id = ' . $id);

        if (empty($id)) { $result['error'] = '[db:deleteDealer]: Dealer ID is empty!'; break; }

        $result = $main->dealer->drop($id);
        if ($result === 1) $result = ['dealerId' => strval($id)];
      }
      break;
    case 'dealersDatabaseEdit':
      /**
       * @deprecated
       */
      $result['report'] = 'dealersDatabaseEdit: deprecated';
      break;

      // History
    case 'loadHistoryTree':
      $history = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );
      $result['historyTree'] = $history->getHistoryTree();
      break;
    case 'loadHistoryBackup':
      if (!isset($relativePath)) {
        $result['error'] = '[db:loadHistoryBackup]: Missing relativePath parameter';
        break;
      }
      if (!isset($backupId)) {
        $result['error'] = '[db:loadHistoryBackup]: Missing backupId parameter';
        break;
      }

      $history = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );

      try {
        $result['diff'] = $history->getBackupsForDiff($relativePath, $backupId);
      } catch (\Throwable $e) {
        $result['error'] = $e->getMessage();
      }
      break;
    case 'loadHistory':
      if (!isset($relativePath)) {
        $result['error'] = '[db:loadHistory]: Missing relativePath parameter';
        break;
      }

      $history = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );

      try {
        $result['history'] = $history->getHistoryList($relativePath);
      } catch (RuntimeException $e) {
        $result['error'] = $e->getMessage();
      }
      break;

    case 'getCsvHistoryTree':
      $csvHistory = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );
      $result['historyTree'] = $csvHistory->getHistoryTree();
      break;

    case 'getCsvBackupForDiff':
      if (!isset($relativePath)) {
        $result['error'] = '[db:getCsvBackupForDiff]: Missing relativePath parameter';
        break;
      }
      if (!isset($backupId)) {
        $result['error'] = '[db:getCsvBackupForDiff]: Missing backupId parameter';
        break;
      }

      $csvHistory = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );

      try {
        $result['diff'] = $csvHistory->getBackupsForDiff($relativePath, $backupId);
      } catch (\Throwable $e) {
        $result['error'] = $e->getMessage();
      }
      break;

    case 'getCsvHistory':
      if (!isset($relativePath)) {
        $result['error'] = '[db:getCsvHistory]: Missing relativePath parameter';
        break;
      }

      $csvHistory = new CsvHistory(
        $main->getCmsParam(VC::CSV_PATH),
        $main->getCmsParam(VC::CSV_HISTORY_PATH)
      );

      try {
        $result['history'] = $csvHistory->getHistoryList($relativePath);
      } catch (RuntimeException $e) {
        $result['error'] = $e->getMessage();
      }
      break;

    default:
      $result['error'] = '[db:default]: Unknown action';
      break;
  }
}

$db::close();
$main->response->setContent($result);
