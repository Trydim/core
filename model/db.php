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
  $result['csvFiles'] = $db->scanDirCsv($main->getCmsParam('csvPath'));
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
      elseif (is_string($dbTable) && $dbTable === 'content-js') $result['content'] = $db->loadContentEditorData();
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
      } else if (isset($contentData) && !empty($contentData)) {
        $db->saveContentEditorData($contentData);
      } else {
        $result['error'] = 'Nothing to save!';
      }
      break;
    case 'loadCSV': $db->fileForceDownload(); break;
    case 'loadFormConfig':
      if (isset($dbTable)) {
        $filePath = ABS_SITE_PATH . SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
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
        $filePath = ABS_SITE_PATH . SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
        if (file_exists($filePath)) {
          if (filesize($filePath) < 60) Xml::createXmlDefault($filePath, substr($dbTable, 1));
          $result['XMLValues'] = new SimpleXMLElement(file_get_contents($filePath));
        }
      }
      break;
    case 'refreshXMLConfig':
      if (isset($dbTable)) {
        $filePath = ABS_SITE_PATH . SHARE_PATH . 'xml' . str_replace('csv', 'xml', $dbTable);
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

          $result = $db->insert($db->getColumnsTable('customers'), 'customers', $param, true);
        }

        $orderId = intval($orderId ?? 0);
        $orderId = $orderId !== 0 ? $orderId
          : $db->getLastID('orders',
            [
              'status_id' => $main->getSettings('statusDefault') ?? 1,
              'customer_id' => $customerId
            ]);
        $orderTotal = $orderTotal ?? 0;

        $param = [$orderId => [
          'user_id'     => $main->getLogin('id'),
          'customer_id' => $customerId,
          'total'       => floatval(is_finite($orderTotal) ? $orderTotal : 0),
          'important_value' => $importantVal ?? '{}',
          'save_value'      => $saveVal ?? '{}',
          'report_value'    => addCpNumber($orderId, $reportVal),
          'start_shipping_date' => $db->getDbDateString($startShippingDate ?? ''),
          'end_shipping_date'   => $db->getDbDateString($endShippingDate ?? ''),
        ]];

        $result = $db->insert($db->getColumnsTable('orders'), 'orders', $param, true);

        $result['customerId'] = $customerId;
        $result['orderId']    = $orderId;
        $result['saveDate']   = date('Y-m-d H:i:s');
      }
      break;
    case 'loadOrders':
      $sortColumn = $sortColumn ?? 'create_date';

      $orderIds = json_decode($orderIds ?? '[]');
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
    case 'changeSection':
      $section = json_decode($section ?? '[]', true);
      $sectionId = $sectionId ?? '0';
      $parentId = $section['parentId'] ?? 0;
      $name = $section['name'] ?? '';

      if (!empty($name)) {
        // Проверка есть ли раздел с таким же именем
        $haveSection = $db->selectQuery('section', 'name', " parent_ID = $parentId");
        if (in_array($name, $haveSection)) {
          if ($dbAction === 'changeSection') {
            $haveSection = $db->selectQuery('section', 'ID', " name = '$name'");
            if (count($haveSection) > 2 || $haveSection[0] !== $sectionId) {
              $result['error'] = 'section_exist'; break;
            }
          } else {
            $result['error'] = 'section_exist'; break;
          }
        }

        $param = [
          'parent_ID' => $parentId,
          'name'      => $name,
          'code'      => $section['code'] ?? translit($name),
          'active'    => intval($section['activity'] === true),
        ];
        $result = $db->insert([], 'section', [$sectionId => $param], $dbAction === 'changeSection');
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
      if (!isset($sectionId)) { $result['error'] = 'section_id_error'; break; }

      $element = json_decode($element ?? '[]', true);
      $fieldChange = json_decode($fieldChange ?? '[]', true);
      $name = $element['name'] ?? '';

      if (!empty($name)) {
        $haveElements = $db->selectQuery('elements', 'name', " name = '$name' ");
        if (count($haveElements)) { $result['error'] = 'element_name_exist'; break; }

        $param = [
          'section_parent_id' => $sectionId,
          'name'              => $name,
          'element_type_code' => $element['type'],
          'activity'          => intval($element['activity'] === true),
          'sort'              => $element['sort'] ?? 100
        ];

        $result = $db->insert($db->getColumnsTable('elements'), 'elements', ['0' => $param]);

        // Проверка на срабатывание триггера
        $haveOptions = $db->selectQuery('options_elements', 'ID', " name = '$name' ");
        if (!count($haveOptions)) {
          $columns = $db->getColumnsTable('options_elements');
          $param = ['0' => [
            'element_id' => $result['elementsId'],
            'name'       => $name,
          ]];
          $result = $db->insert($columns, 'options_elements', $param);
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

        $result = $db->insert($db->getColumnsTable('elements'), 'elements', $param, true);
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

        $filesInfo = json_decode($filesInfo ?? '[]', true);

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

        // Images
        if (count($filesInfo)) {
          $imageIds = [];
          $result['files'] = [];
          $fileSystem = new FS($main);

          foreach ($filesInfo as $file) {
            $fileId = $file['id'];

            $saveResult = $fileSystem->saveFromRequest('files' . $fileId, $file['optimize']);

            if (is_object($saveResult)) {
              $saveResult = $db->setFiles($saveResult);
              $imageIds[] = $saveResult['id'];
              $result['files'][] = $saveResult;
            }
            else if (is_numeric($saveResult)) $imageIds[] = $saveResult;
            else $result['error'] = $saveResult;
          }

          $param[0]['images_ids'] = implode(',', $imageIds);
        } else {
          $param[0]['images_ids'] = '';
        }

        $result = $db->insert($db->getColumnsTable('options_elements'), 'options_elements', $param);
      }
      break;
    case 'changeOptions':
      $optionsId = json_decode($optionsId ?? '[]');
      if (isset($elementsId) && count($optionsId)) {
        $param = [];
        $single = count($optionsId) === 1;
        $option = json_decode($option ?? '[]', true);
        $fieldChange = json_decode($fieldChange ?? '[]', true);
        $filesInfo = json_decode($filesInfo ?? '[]', true);
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
          if ($single && count($filesInfo)) {
            $imageIds = [];
            $result['files'] = [];
            $fileSystem = new FS($main);

            foreach ($filesInfo as $file) {
              $fileId = $file['id'];
              $optimize = $file['optimize'] ?? false;

              if (is_numeric($fileId)) {
                $saveResult = $fileId;

                if ($optimize) {
                  $file = $main->db->getFiles($fileId);
                }
              }
              else $saveResult = $fileSystem->saveFromRequest($fileId, $optimize);

              if (is_object($saveResult)) {
                $saveResult = $db->setFiles($saveResult);
                $imageIds[] = $saveResult['id'];
                $result['files'][] = $saveResult;
              }
              else if (is_numeric($saveResult)) $imageIds[] = $saveResult;
              else $result['error'] = $saveResult;
            }

            $param[$id]['images_ids'] = implode(',', $imageIds);
          } else {
            $param[$id]['images_ids'] = '';
          }
        }

        $result = $db->insert($db->getColumnsTable('options_elements'), 'options_elements', $param, true);
      }
      break;
    case 'deleteOptions':
      $optionsId = json_decode($optionsId ?? '[]');
      if (count($optionsId)) $db->deleteItem('options_elements', $optionsId);
      break;

    // Customers
    case 'loadCustomerByOrder':
      if (isset($orderId) && is_numeric($orderId)) {
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

      $haveName = $db->selectQuery('users', 'ID', ' login = "' . $user['login'] . '"');
      if (count($haveName) > 1) { $result['error'] = 'login_exits'; break; }

      $contacts = [];
      foreach ($user as $k => $v) {
        if (in_array($k, ['login', 'name', 'permissionId'])) $param[$k] = $v;
        else if ($k === 'password') $param[$k] = password_hash($v, PASSWORD_BCRYPT);
        else if ($k === 'activity') $param[$k] = '1'; // TODO
        else $contacts[$k] = $v;
      }
      $param['contacts'] = json_encode($contacts);

      $result = $db->insert($columns, 'users', ['0' => $param]);
      break;
    case 'changeUser':
      $usersId = json_decode($usersId ?? '[]');
      $authForm = json_decode($authForm ?? '[]', true);

      if (count($usersId)) {
        $param = [];

        if (count($usersId) === 1) {
          $haveName = $db->selectQuery('users', ['ID', 'login'], ' login = "' . $authForm['login'] . '"');
          if (count($haveName) && $haveName[0]['ID'] !== $usersId[0]) { $result['error'] = 'login_exits'; break; }
        }

        foreach ($usersId as $id) {
          $param[$id] = ['activity' => '0'];
          $contacts = [];
          foreach ($authForm as $k => $v) {
            if (in_array($k, ['login', 'name', 'permissionId'])) $param[$id][$k] = $v;
            else if ($k === 'activity') $param[$id][$k] = '1'; // TODO
            else $contacts[$k] = $v;
          }
          count($contacts) && $param[$id]['contacts'] = json_encode($contacts);
        }

        $result = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'changeUserPassword':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId) === 1 && isset($validPass)) {
        $param[$usersId[0]]['password'] = password_hash($validPass, PASSWORD_BCRYPT);

        $result = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'delUser':
      $usersId = json_decode($usersId ?? '[]');

      if (count($usersId)) {
        $db->deleteItem('users', $usersId);
      }
      break;

    // Files
    case 'uploadFiles':
      $result = (new FS($main))->saveAllFromRequest();
      break;
    case 'loadFiles':
      $result['files'] = $db->loadFiles();
      break;

    case 'openOrders': /* TODO когда это отправляется */
      break;

    case 'addDealer':
      $dealer = '{"name":"dpp.by"}';

      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $login = $dealer['login'] ?? false;
        $pass = password_hash($dealer['pass'] ?? 123, PASSWORD_BCRYPT);
        $prefix = strtolower(substr(translit($dealer['name']), 0, 3));

        $haveDealers = $db->selectQuery('dealers', 'cms_param');
        if (count($haveDealers)) {
          $haveDealers = array_filter($haveDealers, function ($param) use ($prefix) {
            $param = json_decode($param);
            return ($param->prefix ?? false) === $prefix . '_';
          });
          if (count($haveDealers)) $prefix .= substr(uniqid(), -3, 3);
          unset($haveDealers);
        }

        $id = $db->getLastID('dealers', ['name' => 'tmp']);

        $param = [
          'name' => $dealer['name'],
          'cms_param' => json_encode(['prefix' => $prefix]),
          'activity' => intval(boolValue($dealer['activity'] ?? true)),
          'contacts' => json_encode([
            'address' => $dealer['address'] ?? '',
            'email' => $dealer['email'] ?? '',
            'phone' => $dealer['phone'] ?? '',
          ]),
        ];

        $result = $db->insert($columns, 'dealers', [$id => $param], true);

        if ($login === false) $login = 'dealer' . $id;

        $main->dealer->create($id,
          [
            'dealerName' => $dealer['name'],
            'dbConfig' => $main->getSettings('dbConfig'),
          ],
          [
            'prefix' => $prefix,
            'login' => $login,
            'pass'  => $pass,
          ]);
      }
      break;
    case 'loadDealers':
      $result['dealers'] = $main->db->loadDealers();
      break;
    case 'setupDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $param['settings'] = json_encode($dealer['settings']);

        $result = $db->insert($columns, $dbTable, [$dealer['id'] => $param], true);;
      }
      break;
    /*case 'changeDealer': break;
    case 'setupDealer': break;
    case 'deleteDealer': break;*/

    default:
      echo 'SWITCH default DB.php' . var_dump($_REQUEST);
      break;
  }

  $db::close();
}
