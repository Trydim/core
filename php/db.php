<?php use RedBeanPHP\db;

/**
 * @var array $dbConfig - config from public
 * @var object $main
 */

if (!defined('MAIN_ACCESS')) die('access denied!');

require_once 'libs/db.php';

$db = new db($dbConfig);

!isset($dbAction) && $dbAction = '';
isset($tableName) && $dbTable = $tableName;
!isset($dbTable) && $dbTable = '';

if ($dbAction === 'tables') { // todo добавить фильтрацию таблиц
  CHANGE_DATABASE && $result[$dbAction] = $db->getTables();
  $result['csvFiles'] = $db->scanDirCsv();
} else {

	if($dbTable) {
	  USE_DATABASE && $columns = $db->getColumnsTable($dbTable);
    $db->setCsvTable($tableName);
  } else $columns = [];

	$pageNumber = isset($currPage) ? $currPage : 0;
	!isset($countPerPage) && $countPerPage = 20;
	$sortDirect = isset($sortDirect) ? $sortDirect === 'true' : false;

	switch ($dbAction) {
		// Table
		case 'showTable':
			$result['columns'] = $columns;
      if(stripos($tableName, '.csv')) $result['csvValues'] = $db->openCsv();
      else {
        if (!CHANGE_DATABASE && stripos($tableName, 'csv') === false) reDirect(false, '404');
        USE_DATABASE && $result['dbValues'] = $db->loadTable($dbTable);
      }
			break;
		case 'saveTable':
			if($dbTable !== '') {

        $added   = isset($added) ? $added = json_decode($added, true) : false;
        $changed = isset($changed) ? $changed = json_decode($changed, true) : false;
        $deleted = isset($deleted) ? $deleted = json_decode($deleted) : false;

        if ($deleted) $result['notAllowed'] = $db->deleteItem($dbTable, $deleted);
				if ($added) $result['notAllowed'] = $db->insert($columns, $dbTable, $added);
				if ($changed) $result['notAllowed'] = $db->insert($columns, $dbTable, $changed, true);
			}
      if (isset($csvData)) {
        $db->saveCsv(json_decode($csvData));
      }
			break;
    case 'loadCVS':
      $db->fileForceDownload();
      break;
		// Orders
		case 'saveOrder':
			if (isset($saveVal)) {
				$db->setCurrentUserId();

				isset($C_ID) && $id = $C_ID;

				if (!isset($customerChange)) $changeUser = false;
				else if ($customerChange === 'change') $changeUser = true;
				else if ($customerChange === 'add') { $changeUser = false; $id = ''; }

				if(!isset($id)) break;

        if ($id === '' && isset($name) || $changeUser) {
          $contacts = [];
          isset($phone) && $contacts['phone'] = $phone;
          isset($email) && $contacts['email'] = $email;
          isset($address) && $contacts['address'] = $address;

          $param = [$id => []];
          $param[$id]['name'] = $name;
          isset($ITN) && $param[$id]['ITN'] = $ITN;
          count($contacts) && $param[$id]['contacts'] = json_encode($contacts);

          $changeUser && $columns = $db->getColumnsTable('customers');
          $db->insert($columns, 'customers', $param, $changeUser);
          !$changeUser && $id = $db->getLastID('customers');
        }

        $idOrder = ((int) $db->getLastID('orders')) + 1;

				$param = [];
        $param['save_value'] = $saveVal;
        $param['customer_id'] = $id;
        isset($importantVal) && $param['important_value'] = $importantVal;
        isset($orderTotal) && is_finite($orderTotal) && $param['total'] = floatval($orderTotal);
        isset($reportVal) && $param['report_value'] = addCpNumber($idOrder, $reportVal);

        // status_id = ; по умолчанию сохранять из настроек
        $db->saveOrder($param);
        $result['orderID'] = $idOrder;
			}
			break;
		case 'loadOrders':
			!isset($sortColumn) && $sortColumn = 'create_date';

      $search = isset($search);
      $orderIds = isset($orderIds) ? json_decode($orderIds) : []; // TODO Зачем это
      $dateRange = isset($dateRange) ? json_decode($dateRange) : [];

      // Значит нужны все заказы (поиск)
      if($countPerPage > 999) $countPerPage = 1000000;
			else $result['countRows'] = $db->getCountRows('orders');

			$result['orders'] = $db->loadOrder($pageNumber, $countPerPage, $sortColumn, $sortDirect, $dateRange, $orderIds);
			!$search && $result['statusOrders'] = $db->loadTable('order_status');
			break;
		case 'loadOrder': // Показать подробности
      $orderIds = isset($orderIds) ? json_decode($orderIds) : [];
      if (count($orderIds) === 1) $result['order'] = $db->loadOrderById($orderIds);
			break;
		case 'changeStatusOrder':
			if (isset($commonValues) && isset($status_id) && count($columns)) {

				if(!is_finite($status_id)) break;

				$commonValues = json_decode($commonValues);

				$db->changeOrders($columns, $dbTable, $commonValues, $status_id);
			}
			break;
		case 'delOrders':
      $orderIds = isset($orderIds) ? json_decode($orderIds) : [];
			if (count($orderIds)) $db->deleteItem( 'orders', $orderIds);
			break;

		// Section
		case 'openSection':
			!isset($sortColumn) && $sortColumn = 'C.name';
			if (isset($sectionId) && is_finite($sectionId)) {
				$result['countRowsElements'] = $db->getCountRows('elements', " section_parent_id = $sectionId ");
				$result['elements'] = $db->loadElements($sectionId, $pageNumber, $countPerPage, $sortColumn, $sortDirect);
			}
			break;
		case 'loadSection':
			if(isset($sectionId) && is_finite($sectionId)) {
				$result['section'] = $db->selectQuery('section', ['ID', 'name'], " parent_ID = $sectionId");
			}
			break;
		case 'createSection':
			$param = ['0' => []];
			if (isset($sectionParentId)) $param['0']['parent_ID'] = $sectionParentId;
			if (isset($sectionName) && isset($sectionCode)) {
				$param['0']['name'] = $sectionName;
				$param['0']['code'] = $sectionCode;
				$result['error'] = $db->insert([], 'section', $param);
			}
			break;
		case 'changeSection':
			$param = [];
			if (isset($sectionId)) {
				$id = $sectionId;
				$param[$id] = [];

				if(isset($sectionName) && $sectionName !== '') $param[$id]['name'] = $sectionName; else break;
				if(isset($sectionCode) && $sectionCode !== '') $param[$id]['code'] = $sectionCode;
				if(isset($sectionParentId) && is_finite($sectionParentId)) $param[$id]['parent_ID'] = $sectionParentId;

				$db->insert($columns, $dbTable, $param, true);
			}
			break;
		case 'delSection':
			if (isset($sectionId)) $db->deleteItem('section', [$sectionId]);
			break;

		// Elements
		case 'createElements':
			$param = ['0' => []];
			if (isset($sectionId)) $param['0']['section_parent_id'] = $sectionId;
			if (isset($elementName) && isset($elementType)) {
				$param['0']['name'] = $elementName;
				$param['0']['element_type_code'] = $elementType;
				$result['error'] = $db->insert($columns, 'elements', $param);
			}
			break;
		case 'openElements':
      !isset($sortColumn) && $sortColumn = 'O.name';

			if (isset($elementsId) && is_finite($elementsId)) {
				$result['countRowsOptions'] = $db->getCountRows('options_elements', " element_id = $elementsId ");
				$result['options'] = $db->loadOptions($elementsId, $pageNumber, $countPerPage, $sortColumn, $sortDirect);
			}
			break;
		case 'changeElements':
      $elementsId = isset($elementsId) ? json_decode($elementsId) : [];
			if (count($elementsId)) {
        $param = [];

        foreach ($elementsId as $id) {
          isset($sectionParent) && ($param[$id]['section_parent_id'] = $sectionParent);
          isset($elementName) && ($param[$id]['name'] = $elementName);
          isset($elementActivity) && ($param[$id]['activity'] = $elementActivity);
          isset($elementSort) && ($param[$id]['sort'] = $elementSort);
        }

				$result['error'] = $db->insert($columns, $dbTable, $param, true);
			}
			break;
		case 'delElements':
			$elementsId = isset($elementsId) ? json_decode($elementsId) : [];
			if (count($elementsId)) {
				$db->deleteItem('elements', $elementsId);
			}
			break;

		// Options
		case 'createOptions':
      $param = ['0' => []];
      if (isset($elementsId)) $param['0']['element_id'] = $elementsId;
      if (isset($optionName)) {
        $param['0']['name']            = $optionName;
        $param['0']['money_input_id']  = isset($moneyInputId) ? $moneyInputId : 1;
        $param['0']['input_price']     = isset($moneyInput) ? $moneyInput : 0;
        $param['0']['money_output_id'] = isset($moneyOutputId) ? $moneyOutputId : 1;
        $param['0']['output_percent']  = isset($outputPercent) ? $outputPercent : 0;
        $param['0']['output_price']    = isset($moneyOutput) ? $moneyOutput : 0;
        $param['0']['unit_id']         = isset($unitId) ? $unitId : 1;
        //$param['0']['image_id'] = $imageId;
        //$param['0']['properties'] = json_encode($properties);

        $result['error'] = $db->insert($columns, 'options_elements', $param);
      }
		  break;
		case 'changeOptions':
      $optionsId = isset($optionsId) ? json_decode($optionsId) : [];
      if (count($optionsId)) {
        $param = [];

        foreach ($optionsId as $id) {
          isset($optionName) && ($param[$id]['name'] = $optionName);
          isset($moneyInputId) && ($param[$id]['money_input_id'] = $moneyInputId);
          isset($moneyInput) && ($param[$id]['input_price'] = $moneyInput);
          isset($moneyOutputId) && ($param[$id]['money_output_id'] = $moneyOutputId);
          isset($outputPercent) && ($param[$id]['output_percent'] = $outputPercent);
          isset($output_price) && ($param[$id]['output_price'] = $output_price);
          isset($unitId) && ($param[$id]['unit_id'] = $unitId);
          isset($imageId) && ($param[$id]['image_id'] = $imageId);
          isset($properties) && ($param[$id]['properties'] = json_encode($properties));
        }

        $result['error'] = $db->insert($columns, $dbTable, $param, true);
      }
		  break;
		case 'delOptions':
      $optionsId = isset($optionsId) ? json_decode($optionsId) : [];
      if (count($optionsId)) {
        $db->deleteItem('options_elements', $optionsId);
      }
		  break;

    // Customers
    case 'loadCustomerByOrder':
      $orderIds = isset($orderIds) ? json_decode($orderIds) : [];
      if (count($orderIds) === 1) {
        $result['customer'] = $db->loadCustomerByOrderId($orderIds[0]);
        $result['users'] = $db->getUserByOrderId($orderIds[0]);
      }
      break;
    case 'loadCustomers':
      !isset($sortColumn) && $sortColumn = 'name';

      //$search = isset($search);
      $customerIds = isset($customerIds) ? json_decode($customerIds) : [];

      // Значит нужны все заказчики(поиск при сохранении)
      if($countPerPage > 999) $countPerPage = 1000000;
      else $result['countRows'] = $db->getCountRows('customers');

      $result['customers'] = $db->loadCustomers($pageNumber, $countPerPage, $sortColumn, $sortDirect, $customerIds);
      break;
    case 'addCustomer':
      $param = ['0' => []];
      if (isset($name)) {
        $param['0']['name'] = $name;
        $param['0']['ITN']  = isset($ITN) ? $ITN : '';

        $contacts = [];
        isset($phone) && $contacts['phone'] = $phone;
        isset($email) && $contacts['email'] = $email;
        isset($address) && $contacts['address'] = $address;
        count($contacts) && $param['0']['contacts'] = json_encode($contacts);

        // TODO обработка ошибки не верна
        //$result['error'] = $db->insert($columns, 'customers', $param);
        $db->insert($columns, 'customers', $param);
      }
      break;
    case 'changeCustomer':
      if (isset($usersId) && is_finite($usersId)) {
        $param = [];

        $contacts = [];
        isset($phone) && $contacts['phone'] = $phone;
        isset($email) && $contacts['email'] = $email;
        isset($address) && $contacts['address'] = $address;

        isset($name) && $param[$usersId]['name'] = $name;
        isset($ITN) && $param[$usersId]['ITN'] = $ITN;
        count($contacts) && $param[$usersId]['contacts'] = json_encode($contacts);

        $db->insert($columns, 'customers', $param, true);
      }
      break;
    case 'delCustomer':
      $usersId = isset($usersId) ? json_decode($usersId) : [];

      if (count($usersId)) {
        $result['customers'] = $db->deleteItem('customers', $usersId);
      }
      break;

    // Users
    case 'loadUsers':
      !isset($sortColumn) && $sortColumn = 'create_date';

      $result['countRows'] = $db->getCountRows('users');
      $result['users'] = $db->loadUsers($pageNumber, $countPerPage, $sortColumn, $sortDirect);
      $result['permissionUsers'] = $db->loadTable('permission');
      break;
    //case 'loadUser': break; // Вероятно для загрузки пароля
    case 'addUser':
      $param = ['0' => []];
      if (isset($userLogin) && isset($userPassword)) {
        $param['0']['name']     = isset($userName) ? $userName : '';
        $param['0']['login']    = $userLogin;
        $param['0']['password'] = password_hash($userPassword, PASSWORD_BCRYPT);
        $param['0']['permission_id'] = isset($userPermission) ? $userPermission : 1;
      }

      $contacts = [];
      isset($userPhone) && $contacts['phone'] = $userPhone;
      isset($userMail) && $contacts['mail'] = $userMail;
      isset($userMoreContact) && $contacts['more'] = $userMoreContact;
      count($contacts) && $param['0']['contacts'] = json_encode($contacts);

      $result['error'] = $db->insert($columns, 'users', $param);
      break;
    case 'changeUser':
      $usersId = isset($usersId) ? json_decode($usersId) : [];

      if (count($usersId)) {
        $param = [];

        $contacts = [];
        isset($userPhone) && $contacts['phone'] = $userPhone;
        isset($userMail) && $contacts['email'] = $userMail;
        isset($userMoreContact) && $contacts['more'] = $userMoreContact;

        foreach ($usersId as $id) {
          isset($userLogin) && $param[$id]['login'] = $userLogin;
          isset($userName) && $param[$id]['name'] = $userName;
          isset($userActivity) && $param[$id]['activity'] = $userActivity;
          count($contacts) && $param[$id]['contacts'] = json_encode($contacts);
        }

        $result['error'] = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'changeUserPassword':
      $usersId = isset($usersId) ? json_decode($usersId) : [];

      if (count($usersId) === 1 && isset($validPass)) {
        $param[$usersId[0]]['password'] = password_hash($validPass, PASSWORD_BCRYPT);

        $result['error'] = $db->insert($columns, 'users', $param, true);
      }
      break;
    case 'delUser':
      $usersId = isset($usersId) ? json_decode($usersId) : [];

      if (count($usersId)) {
        $db->deleteItem('users', $usersId);
      }
      break;


    case 'openOrders': /* TODO когда это отправляется */ break;

    default:
      echo 'SWITCH default DB.php' . var_dump($_REQUEST);
      break;
	}

	$db::close();
}
