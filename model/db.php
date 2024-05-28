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
  CHANGE_DATABASE && $result[$cmsAction] = $db->getTables();
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
    }
  }

  $pageNumber = $currPage ?? 0;
  $countPerPage = $countPerPage ?? 20;
  $sortDirect = $sortDirect ?? 'true';

  $pagerParam = [
    'pageNumber'   => $pageNumber,
    'countPerPage' => $countPerPage,
    'sortColumn'   => $sortColumn ?? 'ID',
    'sortDirect'   => $sortDirect,
  ];

  switch ($cmsAction) {
      // Tables
    case 'showTable':
      $result['columns'] = $columns;
      if (stripos($dbTable, '.csv')) $result['csvValues'] = $db->openCsv();
      elseif ($dbTable === 'content-js') $result['content'] = $db->loadContentEditorData();
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
      } else if (isset($csvData) && !empty($csvData)) {
        $db->saveCsv(json_decode($csvData));
      } else if (isset($contentData) && !empty($contentData)) {
        $db->saveContentEditorData($contentData);
      } else {
        $result['error'] = 'Nothing to save!';
      }
      break;
    case 'loadTable':
      $tables = json_decode($tables ?? '[]', true);

      if (count($tables) === 0) {
        if (empty($tableName)) { $result['error'] = 'Error table name'; break; }

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
        $result = $db->selectQuery('customers', '*', " ID = $customerId");
        if (!count($result)) { $customerChange = true; $customerId = 0; }

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

        // Set Status Id
        $statusId = $statusId ?? $main->getSettings(VC::STATUS_DEFAULT) ?? 1;
        if (isset($statusCode)) {
          $status = $db->loadOrderStatus(" code = '$statusCode'");
          if (count($status) === 1) $statusId = $status[0]['ID'];
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
            'user_id'     => $main->getLogin('id') ?? 1,
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
      $ordersIds = json_decode($ordersIds ?? '[]');
      if (!is_array($ordersIds)) $ordersIds = [$ordersIds];

      if (count($ordersIds)) {
        $param = [];
        //$single = count($ordersIds) === 1;

        $statusId = $statusId ?? false;
        if (isset($statusCode)) {
          $status = $db->loadOrderStatus(" code = '" . $statusCode . "'");
          if (count($status)) $statusId = $status[0]['ID'];
        }

        foreach ($ordersIds as $id) {
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
          $result['error'] = 'Error change orders: empty param';
        }
      }
      break;
    case 'loadOrders':
      // Значит нужны все заказы (поиск)
      if ($countPerPage > 999) $pagerParam['countPerPage'] = 1000000;

      if (isset($orderIds)) {
        $orderIds = json_decode($orderIds ?? '[]', true);
        $result['orders'] = $db->loadOrdersById($orderIds);
      } else if (isset($ordersFilter)) { // Загрузка по менеджеру, клиенту или статусу
        $ordersFilter = json_decode($ordersFilter, true);
        $result['orders'] = $db->loadOrdersByRelatedKey($pagerParam, $ordersFilter);

        if (isset($ordersFilter['userId'])) $ordersFilter = 'user_id = ' . $ordersFilter['userId'];
        else if (isset($ordersFilter['customerId'])) $ordersFilter = 'customer_id = ' . $ordersFilter['customerId'];
        else if ($statusId = isset($ordersFilter['statusId'])) $ordersFilter = 'status_id = ' . implode(' or status_id = ', is_array($statusId) ? $statusId : [$statusId]);

        $result['countRows'] = $db->getCountRows('orders', $ordersFilter);
      } //
      else {
        $dateRange = json_decode($dateRange ?? '[]', true);
        $result['orders'] = $db->loadOrders($pagerParam, $dateRange);
        $result['countRows'] = $db->getCountRows('orders');
      }
      !isset($search) && $result['statusOrders'] = $db->loadOrderStatus();
      break;
    case 'changeStatusOrder':
      if (isset($orderIds) && isset($statusId) && count($columns)) {
        if (!is_finite($statusId)) {
          $result['error'] = 'status_id_error';
          break;
        }

        $db->changeOrders($columns, $dbTable, explode(',', $orderIds), $statusId);
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

      //$searchValue = isset($searchValue);
      // Значит нужны все заказы (поиск)
      if ($countPerPage > 999) $pagerParam['countPerPage'] = 1000000;
      else $result['countRows'] = $db->getCountRows('client_orders');

      $result['orders'] = $db->loadVisitorOrder($pagerParam);
      break;
    case 'delVisitorOrders':
      $orderIds = explode(',', $orderIds ?? '');
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
          if ($cmsAction === 'changeSection') {
            $haveSection = $db->selectQuery('section', 'ID', " name = '$name'");
            if (count($haveSection) > 2 || $haveSection[0] !== $sectionId) {
              $result['error'] = 'section_exist';
              break;
            }
          } else {
            $result['error'] = 'section_exist';
            break;
          }
        }

        $param = [
          'parent_ID' => $parentId,
          'name'      => $name,
          'code'      => $section['code'] ?? translit($name),
          'active'    => intval($section['activity'] === true),
        ];
        $result = $db->insert([], 'section', [$sectionId => $param], $cmsAction === 'changeSection');
      }
      break;
    case 'openSection':
      if (isset($sectionId) && is_numeric($sectionId)) {
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
      if (!isset($sectionId)) {
        $result['error'] = 'section_id_error';
        break;
      }

      $element = json_decode($element ?? '[]', true);
      $fieldChange = json_decode($fieldChange ?? '[]', true);
      $name = $element['name'] ?? '';

      if (!empty($name)) {
        $haveElements = $db->selectQuery('elements', 'name', " name = '$name' ");
        if (count($haveElements)) {
          $result['error'] = 'element_name_exist';
          break;
        }

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
      $elementsId = json_decode($elementsId ?? '[]');
      if (count($elementsId) === 1) {
        $elementsId = $elementsId[0];
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
          if (
            count($elements) > 1 || empty($name)
            || (count($elements) === 1 && intval($elements[0]['ID']) !== intval($elementsId[0]))
          ) {
            $result['error'] = 'element_name_error';
            break;
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
        $pageNumber ?? 0,
        $countPerPage
      );
      break;
    case 'copyOption':
    case 'createOption':
      $elementsId = json_decode($elementsId ?? '[]');
      if (count($elementsId) === 1) {
        $elementId = $elementsId[0];
        $param = [];
        $option = json_decode($option ?? '[]', true);
        $filesInfo = json_decode($filesInfo ?? '[]', true);

        $name = $option['name'];
        if (empty($name)) {
          $result['error'] = 'option_name_error';
          break;
        }

        $haveOption = $db->selectQuery('options_elements', ['ID', 'name'], " ID = '$elementId' and name = '$name' ");
        if (count($haveOption)) {
          $result['error'] = 'option_name_exist';
          break;
        }

        $param['element_id'] = $elementId;
        $param['name'] = $name;
        $param['money_input_id'] = $option['moneyInputId'] ?? 1;
        $param['input_price'] = $option['inputPrice'] ?? 0;
        $param['money_output_id'] = $option['moneyOutputId'] ?? 1;
        $param['output_percent'] = $option['percent'] ?? 0;
        $param['output_price'] = $option['outputPrice'] ?? 0;
        $param['unit_id'] = $option['unitId'] ?? 1;
        $param['activity'] = intval(($option['activity'] ?? "true") === "true");
        $param['sort'] = $option['sort'] ?? 100;
        $param['properties'] = $option['propertiesJson'] ?? '{}';

        // Images
        if (count($filesInfo)) {
          $imageIds = [];
          $result['files'] = [];
          $fileSystem = new FS($main);

          foreach ($filesInfo as $file) {
            $fileId = $file['id'];
            $optimize = $file['optimize'] ?? false;

            // Exist in DB
            if (is_numeric($fileId)) {
              $saveResult = $fileId;

              if ($optimize) {
                $file = $main->db->getFiles($fileId);

                if (count($file) === 1) {
                  $file = $file[0];
                  $file['name'] = $file['path'];
                  $fileSystem->prepareFile($file)->optimize();
                }
              }
            } else {
              $saveResult = $fileSystem->saveFromRequest($fileId, $optimize);
            }

            if (is_object($saveResult)) {
              $saveResult = $db->setFiles($saveResult);
              $imageIds[] = $saveResult['id'];
              $result['files'][] = $saveResult;
            } else if (is_numeric($saveResult)) $imageIds[] = $saveResult;
            else $result['error'] = $saveResult;
          }

          $param['images_ids'] = implode(',', $imageIds);
        } else {
          $param['images_ids'] = '';
        }

        $result = $db->insert($db->getColumnsTable('options_elements'), 'options_elements', [0 => $param]);
      }
      break;
    case 'changeOptions':
      $elementsId = json_decode($elementsId ?? '[]');
      $optionsId = json_decode($optionsId ?? '[]');
      if (count($elementsId) && count($optionsId)) {
        $param = [];
        $single = count($optionsId) === 1;
        $option = json_decode($option ?? '[]', true);
        $fieldChange = json_decode($fieldChange ?? '[]', true);
        $filesInfo = json_decode($filesInfo ?? '[]', true);
        $name = $option['name'] ?? '';

        if ($single) {
          $elementId = $elementsId[0];
          $options = $db->selectQuery('options_elements', ['ID', 'name'], " element_id = $elementId AND name = '$name' ");
          if (count($options) > 1 || empty($name) || (count($options) === 1 && $options[0]['ID'] !== $optionsId[0])) {
            $result['error'] = 'option_name_error';
            break;
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
            $currentOption = array_filter($currentOptions, function ($option) use ($id) {
              return $option['id'] === $id;
            });
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

              // Exist in DB
              if (is_numeric($fileId)) {
                $saveResult = $fileId;

                if ($optimize) {
                  $file = $main->db->getFiles($fileId);

                  if (count($file) === 1) {
                    $file = $file[0];
                    $file['name'] = $file['path'];
                    $fileSystem->prepareFile($file)->optimize();
                  }
                }
              } else {
                $saveResult = $fileSystem->saveFromRequest($fileId, $optimize);
              }

              if (is_object($saveResult)) {
                $saveResult = $db->setFiles($saveResult);
                $imageIds[] = $saveResult['id'];
                $result['files'][] = $saveResult;
              } else if (is_numeric($saveResult)) $imageIds[] = $saveResult;
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
    case 'loadUsers':
      $result['countRows'] = $db->getCountRows('users');

      $result['users'] = $db->loadUsers($pagerParam);
      $result['permissionUsers'] = $db->loadTable('permission');
      break;
    case 'addUser':
      $param = [];
      $user = json_decode($authForm ?? '[]', true);

      $haveName = $db->selectQuery('users', 'ID', ' login = "' . $user['login'] . '"');
      if (count($haveName) > 0) {
        $result['error'] = 'login_exist';
        break;
      }

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
          if (count($haveName) && $haveName[0]['ID'] !== $usersId[0]) {
            $result['error'] = 'login_exist';
            break;
          }
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
    case 'loadUsersLogin':
      $users = [];

      $dealersUsers = $db->loadDealersUsers();
      if (count($dealersUsers)) $users = array_map(function ($user) { return $user['login']; }, $dealersUsers);

      $db->togglePrefix();
      $users = array_merge($users, $db->selectQuery('users', 'login'));

      $result['users'] = $users;
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

      // Dealers
    case 'addDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $dealerName = trim($dealer['name']);
        if (strlen($dealerName) < 2) { $result['error'] = 'Name must be 2 or more chars!'; break; }

        $login = trim($dealer['login'] ?? '');
        $pass = password_hash($dealer['password'] ?? 123, PASSWORD_BCRYPT);

        $prefix = preg_replace('/[^a-zA-Z]/i', '', translit($dealerName));
        $prefix = strtolower(substr($prefix, 0, 3)) . '_';

        $haveDealers = $db->selectQuery('dealers', 'cms_param');
        if (count($haveDealers)) {
          $haveDealers = array_filter($haveDealers, function ($param) use ($prefix) {
            $param = json_decode($param);
            return ($param->prefix ?? false) === $prefix;
          });
          if (count($haveDealers)) {
            $prefix = str_replace('_', '', $prefix) . substr(uniqid(), -3, 3) . '_';
          }
          unset($haveDealers);
        }

        $id = $db->getLastID('dealers', ['name' => 'tmp']);
        $param = [
          'name'      => $dealerName,
          'cms_param' => json_encode(['prefix' => $prefix]),
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
          'prefix' => $prefix,
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

      $db->setPrefix($dealer['cmsParam']['prefix']);

      $result['dealerUsers'] = $db->selectQuery('users');
      break;
    case 'changeDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);

        $dealerName = trim($dealer['name']);
        if (strlen($dealerName) < 2) { $result['error'] = 'Name must be 2 or more chars!'; break; }

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
            $db->setPrefix($dealer['cmsParam']['prefix']);

            $change = $db->getUserById(1);

            $param = ['login' => $login, 'password' => password_hash($pass, PASSWORD_BCRYPT)];
            $result = $db->insert($db->getColumnsTable('users'), 'users', [1 => $param], true);
          } else {
            $result['error'] = 'Login or password is not validate!';
          }
        }
      }
      break;
    case 'deleteDealer':
      if (isset($dealer)) {
        $dealer = json_decode($dealer, true);
        $id = $dealer['id'];

        $dealer = $db->selectQuery('dealers', ['cms_param'], ' ID = ' . $id);
        $dealerPrefix = json_decode($dealer[0]['cms_param'], true)['prefix'] ?? '';

        if (empty($id) || empty($dealerPrefix)) { $result['error'] = 'Dealers id or prefix is empty!'; break; }

        $result = $main->dealer->drop($id, $dealerPrefix);
        if ($result === 1) $result['dealerId'] = strval($id);
      }
      break;
    case 'dealersDatabaseEdit':
      //if (password_verify($safeKey ?? '', '')) return;

      $result['report'] = $main->dealer->updateDatabase($selectedDealer ?? [], $sqlText ?? '');
      break;

    default:
      echo 'db.php: switch default case:' . var_dump($_REQUEST);
      break;
  }
}

$db::close();
$main->response->setContent($result);
