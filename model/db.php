<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $dbConfig - config from public
 * @var object $main
 */

$db = $main->getDB();

$dbAction = $dbAction ?? '';
$dbTable = $dbTable ?? $tableName ?? '';

stripos($dbTable, '.csv') === false && $dbTable = basename($dbTable);

if ($dbAction === 'tables') { // todo добавить фильтрацию таблиц
  CHANGE_DATABASE && $result[$dbAction] = $db->getTables();
  $result['csvFiles'] = $db->scanDirCsv($main->getCmsParam('PATH_CSV'));
} else {
  $columns = [];
  if ($dbTable) {
    if (stripos($dbTable, '.csv')) $db->setCsvTable($dbTable);
    else if (USE_DATABASE) {
      $columns = $db->getColumnsTable($dbTable);
      if (!count($columns)) {
        $dbTable = $db->getTables($dbTable);
        if (count($dbTable)) {
          $dbTable = $dbTable[0]['dbTable'];
          $columns = $db->getColumnsTable($dbTable);
        }
      }
    }
  }

  $pageNumber = $currPage ?? 0;
  $countPerPage = $countPerPage ?? 20;
  $sortDirect = isset($sortDirect) && $sortDirect === 'true';

  switch ($dbAction) {
    // Tables
    case 'showTable':
      $result['columns'] = $columns;
      if (is_string($dbTable) && stripos($dbTable, '.csv')) $result['csvValues'] = $db->openCsv();
      else {
        if (CHANGE_DATABASE) {
          USE_DATABASE && $result['dbValues'] = $db->loadTable($dbTable);
        } else {
          $dbTable = $db->getTables($dbTable);
          count($dbTable) && $result['dbValues'] = $db->loadTable($dbTable[0]['dbTable']);
        }
      }
      break;
    case 'saveTable':
      if (isset($dbData) && !empty($dbData)) {
        $column = array_filter($columns, function ($col) { return $col['key'] === 'PRI'; });
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
      }
      else if (isset($csvData) && !empty($csvData)) {
        $db->saveCsv(json_decode($csvData));
      }
      break;
    case 'loadCVS': $db->fileForceDownload(); break;
    case 'loadFormConfig':
      if (isset($dbTable)) {
        $filePath = SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
        if (file_exists($filePath) && filesize($filePath) > 60) {
          $result['csvValues'] = $db->openCsv();
          $result['XMLValues'] = new SimpleXMLElement(file_get_contents($filePath));
        } else $result['error'] = 'File error';
      }
      break;
    case 'saveXMLConfig':
      if (isset($dbTable) && isset($XMLConfig)) {
        $result['error'] = Xml::saveXml($dbTable, json_decode($XMLConfig, true));
      }
      break;
    case 'loadXmlConfig':
      if (isset($dbTable)) {
        $filePath = SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
        if (file_exists($filePath)) {
          if (filesize($filePath) < 60) Xml::createXmlDefault($filePath, substr($dbTable, 1));
          $result['XMLValues'] = new SimpleXMLElement(file_get_contents($filePath));
        }
      }
      break;
    case 'refreshXMLConfig':
      if (isset($dbTable)) {
        $filePath = SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
        Xml::createXmlDefault($filePath, substr($dbTable, 1));
        $result['XMLValues'] = new SimpleXMLElement(file_get_contents($filePath));
      }
      break;

    // Orders
    case 'saveOrder':
      if (isset($reportVal)) {
        $customerId = intval($customerId ?? 0);
        $customerChange = $customerId === 0 ? true : boolValue($customerChange ?? true);
        $customerId = $customerId !== 0 ? $customerId : $db->getLastID('customers');

        if ($customerChange) {
          $param = [$customerId => [
            'name' => $name ?? 'No name',
            'ITN'  => $ITN ?? '',
            'contacts' => json_encode([
              'phone'   => $phone ?? '',
              'email'   => $email ?? '',
              'address' => $address ?? '',
            ]),
          ]];

          $result['error'] = $db->insert($db->getColumnsTable('customers'), 'customers', $param, true);
        }

        $orderId = intval($orderId ?? 0);
        $orderId = $orderId !== 0 ? $orderId
          : $db->getLastID('orders',
            [
              'status_id' => $main->getSettings('statusDefault'),
              'customer_id' => $customerId
            ]);
        $orderTotal = $orderTotal ?? 0;

        $param = [$orderId => [
          'user_id'     => $main->getLogin('id'),
          'customer_id' => $customerId,
          'total'       => floatval(is_finite($orderTotal) ? $orderTotal : 0),
          'important_value' => $importantVal ?? '{}',
          'status_id'       => $main->getSettings('statusDefault'),
          'save_value'      => $saveVal ?? '{}',
          'report_value'    => addCpNumber($orderId, $reportVal),
        ]];

        $result['error'] = $db->insert($db->getColumnsTable('orders'), 'orders', $param, true);

        $result['customerId'] = $customerId;
        $result['orderId']    = $orderId;
        $result['saveDate']   = date('Y-m-d H:i:s');
      }
      break;
    case 'loadOrders':
      $sortColumn = $sortColumn ?? 'create_date';

      $orderIds = json_decode($orderIds ?? '[]'); // TODO Зачем это
      $dateRange = json_decode($dateRange ?? '[]');

      // Значит нужны все заказы (поиск)
      if ($countPerPage > 999) $countPerPage = 1000000;
      else $result['countRows'] = $db->getCountRows('orders');

      $result['orders'] = $db->loadOrder($pageNumber, $countPerPage, $sortColumn, $sortDirect, $dateRange, $orderIds);
      !isset($search) && $result['statusOrders'] = $db->loadTable('order_status');
      break;
    case 'loadOrder': // Показать подробности
      $orderIds = isset($orderId) ? [$orderId] : json_decode($orderIds ?? '[]');
      if (count($orderIds) === 1) $result['order'] = $db->loadOrderById($orderIds[0]);
      break;
    case 'changeStatusOrder':
      if (isset($orderIds) && isset($statusId) && count($columns)) {
        if (!is_finite($statusId)) { $result['error'] = 'status_id_error'; break; }

        $result['error'] = $db->changeOrders($columns, $dbTable, explode(',', $orderIds), $statusId);
      }
      break;
    case 'delOrders':
      $orderIds = explode(',', $orderIds ?? '');
      if (count($orderIds)) $db->deleteItem('orders', $orderIds);
      break;

    // VisitorOrders
    case 'saveVisitorOrder':
      if (isset($inputValue)) {
        $param = [
          'cp_number'   => $cpNumber ?? time(),
          'input_value' => $inputValue,
          'total'       => $total ?? 0,
        ];

        isset($importantValue) && $importantValue !== 'false' && $param['importantValue'] = $importantValue;

        $db->saveVisitorOrder($param);
      }
      break;
    case 'loadVisitorOrders':
      !isset($sortColumn) && $sortColumn = 'createDate';

      $search = isset($search);
      // Значит нужны все заказы (поиск)
      if ($countPerPage > 999) $countPerPage = 1000000;
      else $result['countRows'] = $db->getCountRows('client_orders');

      $result['orders'] = $db->loadVisitorOrder($pageNumber, $countPerPage, $sortColumn, $sortDirect);
      break;
    case 'loadVisitorOrder': break;
    case 'delVisitorOrders':
      $orderIds = isset($orderIds) ? json_decode($orderIds) : [];
      if (count($orderIds)) $db->deleteItem('client_orders', $orderIds);
      break;

    // Section
    case 'createSection':
      $param = ['0' => []];
      $param['0']['parent_ID'] = $parentId ?? 0;
      if (isset($name) && isset($code) && !empty($name)) {
        $haveSection = $db->selectQuery('section', 'name', " parent_ID = $parentId");
        if (in_array($name, $haveSection)) {
          $result['error'] = 'section_exist';
        } else {
          $param['0']['name'] = $name;
          $param['0']['code'] = $code;
          $param['0']['active'] = intval(isset($activity) && $activity === "true");
          $result['error'] = $db->insert([], 'section', $param);
        }
      }
      break;
    case 'openSection':
      if (isset($sectionId) && is_finite($sectionId)) {
        $result['countRowsElements'] = $db->getCountRows('elements', " section_parent_id = $sectionId");
        $result['elements'] = $db->loadElements($sectionId, $pageNumber, 10000);
      }
      break;
    case 'loadSection':
      $result['section'] = array_map(function ($row) {
        $row['key']      = intval($row['ID']);
        $row['parentId'] = intval($row['parent_ID']);
        $row['label']    = $row['name'];
        $row['activity'] = boolval($row['active']);
        unset($row['ID'], $row['parent_id'], $row['name'], $row['active']);
        return $row;
      }, $db->selectQuery('section'));
      break;
    case 'changeSection':
      $parentId = $parentId ?? 0;
      $name = $name ?? false;
      $code = $code ?? false;
      $param[$sectionId ?? 'error'] = [
        'parent_ID' => $parentId,
        'name'      => $name,
        'code'      => $code ?: $name,
        'active'    => intval(isset($activity) && $activity === "true"),
      ];
      if (!isset($param['error'])) {
        if (empty($name)) { $result['error'] = 'name_error'; break; }

        $result['error'] = $db->insert($db->getColumnsTable('section'), 'section', $param, true);
      }
      break;
    case 'deleteSection':
      if (isset($sectionId)) {
        $ids = [$sectionId];
        $ids = array_merge($ids, $db->selectQuery('section', 'ID', " parent_ID = $sectionId "));
        $db->deleteItem('section', [$sectionId]);
      }
      break;

    // Elements
    case 'createElement':
    case 'copyElement':
      $param = ['0' => []];
      if (!isset($sectionId)) { $result['error'] = 'section_id_error'; break; }

      $param['0']['section_parent_id'] = $sectionId;
      if (isset($name) && isset($type) && !empty($name)) {
        $haveElements = $db->selectQuery('elements', 'name', " name = '$name' ");
        if (count($haveElements)) { $result['error'] = 'element_name_exist'; break; }

        $param['0']['name'] = $name;
        $param['0']['element_type_code'] = $type;
        $param['0']['activity'] = intval(isset($activity) && $activity === "true");
        $param['0']['sort'] = $sort ?? 100;
        $result['error'] = $db->insert($db->getColumnsTable('elements'), 'elements', $param);

        // Проверка на срабатывание триггера
        $haveOptions = $db->selectQuery('options_elements', 'ID', " name = '$name' ");
        if (!count($haveOptions)) {
          $columns = $db->getColumnsTable('options_elements');
          $elementsId = $db->getLastID('elements');
          $param = ['0' => [
            'element_id' => $elementsId,
            'name'       => $name,
          ]];
          $result['error'] = $db->insert($columns, 'options_elements', $param);
        }
      }
      break;
    case 'openElement':
      if (isset($elementsId) && is_finite($elementsId)) {
        $result['countRowsOptions'] = $db->getCountRows('options_elements', " element_id = $elementsId ");
        $result['options'] = $db->openOptions($elementsId);
      }
      break;
    case 'changeElements':
      $elementsId = json_decode($elementsId ?? '[]');
      if (count($elementsId)) {
        $param = [];
        $single = count($elementsId) === 1;
        $element = json_decode($element ?? '[]', true);
        $fieldChange = json_decode($fieldChange ?? '[]', true);
        $name = $element['name'] ?? '';

        if ($single) {
          $elements = $db->selectQuery('elements', ['ID', 'name'], " name = '$name' ");
          if (count($elements) > 1 || empty($name)
              || (count($elements) === 1 && $elements[0]['ID'] !== $elementsId[0])) {
            $result['error'] = 'element_name_error'; break;
          }
        }

        foreach ($elementsId as $id) {
          if ($single || $fieldChange['type']) $param[$id]['element_type_code'] = $element['type'];
          if ($single || $fieldChange['parentId']) $param[$id]['section_parent_id'] = $element['parentId'];
          if ($single) $param[$id]['name'] = $name;
          if ($single || $fieldChange['activity']) $param[$id]['activity'] = intval(boolValue($element['activity']));
          if ($single || $fieldChange['sort']) $param[$id]['sort'] = $element['sort'];
        }

        $result['error'] = $db->insert($db->getColumnsTable('elements'), 'elements', $param, true);
      }
      break;
    case 'deleteElements':
      $elementsId = json_decode($elementsId ?? '[]');
      count($elementsId) && $db->deleteItem('elements', $elementsId);
      break;
    case 'searchElements':
      if (isset($searchValue)) {
        $result = $db->searchElements($searchValue, $pageNumber, $countPerPage, $sortColumn ?? 'ID', $sortDirect);
      }
      break;

    // Options
    case 'loadOptions':
      $result['options'] = $db->loadOptions(
        json_decode($filter ?? '[]', true),
        $pageNumber ?? 0, $countPerPage
      );
      break;
    case 'copyOption':
    case 'createOption':
      $param = ['0' => []];
      if (isset($name) && isset($elementsId) && !empty($name)) {
        $haveOption = $db->selectQuery('options_elements', ['ID', 'name'], " ID = '$elementsId' and name = '$name' ");
        if (count($haveOption)) { $result['error'] = 'option_name_exist'; break; }

        $param['0']['element_id'] = $elementsId;
        $param['0']['name'] = $name;
        $param['0']['money_input_id'] = $moneyInputId ?? 1;
        $param['0']['input_price'] = $inputPrice ?? 0;
        $param['0']['money_output_id'] = $moneyOutputId ?? 1;
        $param['0']['output_percent'] = $outputPercent ?? 0;
        $param['0']['output_price'] = $outputPrice ?? 0;
        $param['0']['unit_id'] = $unitId ?? 1;
        $param['0']['activity'] = intval(isset($activity) && $activity === "true");
        $param['0']['sort'] = $sort ?? 100;
        $param['0']['properties'] = $propertiesJson ?? '{}';

        $imageIds = [];
        foreach ($_REQUEST as $k => $v) {
          stripos($k, 'files') === 0 && $param['0']['images_id'][] = $v;
        }
        $param['0']['images_ids'] = $db->setFiles($result, $imageIds);

        $result['error'] = $db->insert($db->getColumnsTable('options_elements'), 'options_elements', $param);
      }
      break;
    case 'changeOptions':
      $optionsId = json_decode($optionsId ?? '[]');
      if (isset($elementsId) && count($optionsId)) {
        $param = [];
        $single = count($optionsId) === 1;
        $option = json_decode($option ?? '[]', true);
        $fieldChange = json_decode($fieldChange ?? '[]', true);
        $name = $option['name'] ?? '';

        if ($single) {
          $options = $db->selectQuery('options_elements', ['ID', 'name'], " element_id = $elementsId AND name = '$name' ");
          if (count($options) > 1 || empty($name)
              || (count($options) === 1 && $options[0]['ID'] !== $optionsId[0])) {
            $result['error'] = 'option_name_error'; break;
          }
        } elseif ($fieldChange['percent']) {
          $currentOptions = $db->openOptions($option['elementId']);
        }

        foreach ($optionsId as $id) {
          if ($single) $param[$id]['name'] = $name;
          if ($single || $fieldChange['unitId']) $param[$id]['unit_id'] = $option['unitId'];
          if ($single || $fieldChange['moneyInputId']) $param[$id]['money_input_id'] = $option['moneyInputId'];
          if ($single || $fieldChange['moneyInput']) $param[$id]['input_price'] = $option['inputPrice'];
          if ($single || $fieldChange['moneyOutputId']) $param[$id]['money_output_id'] = $option['moneyOutputId'];
          if ($single || $fieldChange['moneyOutput']) $param[$id]['output_price'] = $option['outputPrice'];
          if ($single || $fieldChange['activity']) $param[$id]['activity'] = intval(boolValue($option['activity']));
          if ($single || $fieldChange['sort']) $param[$id]['sort'] = $option['sort'];
          if ($single || $fieldChange['properties']) $param[$id]['properties'] = json_encode($option['properties']);

          // Change percent
          if ($single) $param[$id]['output_percent'] = $option['percent'];
          else if ($fieldChange['percent']) {
            $currentOption = array_filter($currentOptions, function ($option) use ($id) {return $option['id'] === $id;});
            $currentOption = array_values($currentOption)[0];

            $param[$id]['output_percent'] = $option['percent'];
            $basePrice = floatval($currentOption['outputPrice']) / (1 + floatval($currentOption['outputPercent']) / 100);
            $param[$id]['output_price'] = $basePrice * (1 + $option['percent'] / 100);
          }

          // Images
          if ($single) {
            $imageIds = [];
            foreach ($_REQUEST as $k => $v) {
              stripos($k, 'files') === 0 && $imageIds[] = $v;
            }
            $param[$id]['images_ids'] = $db->setFiles($result, $imageIds);
          }
        }

        $result['error'] = $db->insert($db->getColumnsTable('options_elements'), 'options_elements', $param, true);
      }
      break;
    case 'deleteOptions':
      $optionsId = json_decode($optionsId ?? '[]');
      if (count($optionsId)) $db->deleteItem('options_elements', $optionsId);
      break;

    // Customers
    case 'loadCustomerByOrder':
      if (isset($orderId)) {
        $result['customer'] = $db->loadCustomerByOrderId($orderId);
        $result['users'] = $db->getUserByOrderId($orderId);
      }
      break;
    case 'loadCustomers':
      // Значит нужны все заказчики (поиск при сохранении)
      if ($countPerPage > 999) $countPerPage = 1000000;
      else $result['countRows'] = $db->getCountRows('customers');

      $result['customers'] = $db->loadCustomers($pageNumber, $countPerPage,
        $sortColumn ?? 'name', $sortDirect,
        json_decode($customerIds ?? '[]')
      );
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
    case 'loadPermission': break;

    // Rate
    case 'loadRate':
      $result['rate'] = $db->getMoney();
      break;

    // Users
    case 'loadUsers':
      $result['countRows'] = $db->getCountRows('users');
      $result['users'] = $db->loadUsers($pageNumber, $countPerPage, $sortColumn ?? 'create_date', $sortDirect);
      $result['permissionUsers'] = $db->loadTable('permission');
      break;
    case 'addUser':
      $param = [];
      $user = json_decode($authForm ?? '[]', true);

      $contacts = [];
      foreach ($user as $k => $v) {
        if (in_array($k, ['login', 'name', 'permissionId'])) $param[$k] = $v;
        else if ($k === 'password') $param[$k] = password_hash($v, PASSWORD_BCRYPT);
        else if ($k === 'activity') $param[$k] = isset($authForm['activity']) ? '1' : '0';
        else $contacts[$k] = $v;
      }
      $param['contacts'] = json_encode($contacts);

      $result['error'] = $db->insert($columns, 'users', [0 => $param]);
      break;
    case 'changeUser':
      $usersId = json_decode($usersId ?? '[]');
      $authForm = json_decode($authForm ?? '[]', true);

      if (count($usersId)) {
        $param = [];

        foreach ($usersId as $id) {
          $param[$id] = [];
          $contacts = [];
          foreach ($authForm as $k => $v) {
            if (in_array($k, ['login', 'name', 'permissionId'])) $param[$id][$k] = $v;
            else if ($k === 'activity') $param[$id][$k] = isset($authForm['activity']) ? '1' : '0';
            else $contacts[$k] = $v;
          }
          count($contacts) && $param[$id]['contacts'] = json_encode($contacts);
        }

        $result['error'] = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'changeUserPassword':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId) === 1 && isset($validPass)) {
        $param[$usersId[0]]['password'] = password_hash($validPass, PASSWORD_BCRYPT);

        $result['error'] = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'delUser':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId)) {
        $db->deleteItem('users', $usersId);
      }
      break;

    // Files
    case 'loadFiles':
      $result['files'] = $db->loadFiles();
      break;

    case 'openOrders': /* TODO когда это отправляется */
      break;

    default:
      echo 'SWITCH default DB.php' . var_dump($_REQUEST);
      break;
  }

  $db::close();
}
