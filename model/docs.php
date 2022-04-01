<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $main - global
 * @var string $docsAction - from query
 * @var string $docType - from query
 */

$data = [];

// Если есть отчет
$reportVal = isset($reportVal) ? json_decode($reportVal, true) : false;
// Если есть номер заказа
$orderId = empty($reportVal) ? ($orderId ?? false) : false;
// Посмотреть номер заказа в отчете
!$orderId && $orderId = isset($reportVal['orderId']) ? json_decode($reportVal['orderId']) : false;

// Данные о менеджере
// ---------------------------------------------------------------------------------------------------------------------
if (isset($addManager)) {
  if (isset($reportVal['name'])) { // Имя пользователя - неправильно
    $userData = $main->db->getUser($reportVal['userId'] ?? $reportVal['name'], 'name, contacts');
  } else if ($orderId) { // Менеджер из сохраненного заказа
    $userData = $main->db->getUserByOrderId($orderId);
  } else { // Текущий пользователь
    $userData = $main->db->getUserById($main->getLogin('id'));
  }

  if (count($userData)) {
    $userData['contacts'] = json_decode($userData['contacts'], true);
    $data['userData'] = $userData;
  }
  unset($userData);
}

// Данные о клиенте
// ---------------------------------------------------------------------------------------------------------------------
if (isset($addCustomer)) {
  if (isset($customerId)) {
    $customerData = $main->db->selectQuery('customer', '*', " ID = $customerId");
  } else if ($orderId) { // Заказчик из сохраненного заказа
    $customerData = $main->db->loadCustomerByOrderId($orderId);
  } else $customerData = $customer ?? '';

  if (count($customerData)) {
    $userData['contacts'] = json_decode($customerData['contacts'] ?? '{}', true);
    $data['customerData'] = $userData;
  }
  unset($customerData);
}

// Отчет загрузить из БД по ИД
// ---------------------------------------------------------------------------------------------------------------------
if ($orderId) {
  $reportVal = $main->db->loadOrderById($orderId);

  $reportVal['id']           = $reportVal['ID'];
  $reportVal['customerName'] = $reportVal['C.name'];

  $reportVal['contacts']       = json_decode($reportVal['contacts'], true);
  $reportVal['importantValue'] = json_decode($reportVal['importantValue'], true);
  $reportVal['saveValue']      = json_decode($reportVal['saveValue'], true);
  $reportVal['reportValue']    = json_decode($reportVal['reportValue'], true);

  $data['order'] = $reportVal;
  $data['reportValue'] = &$reportVal['reportValue'];
} else if ($reportVal) {
  $data['reportValue'] = $reportVal;
}

$docsAction = $docsAction ?? 'mail';
$docType = $docType ?? false;

// Создание документа
// ---------------------------------------------------------------------------------------------------------------------
if ($docType) {
  $docs = new Docs([
    'docType' => $docType,
    'library' => $main->getCmsParam('PDF_LIBRARY'),
    'orientation' => $pdfOrientation ?? $main->getCmsParam('PDF_ORIENTATION'),
  ], $data, $fileTpl ?? 'default');
}

if (isset($docsAction)) {
  switch ($docsAction) {
    case 'excel':
    case 'pdf':
    case 'print':
      $docType && $result = $docs->getDocs($mailTpl ?? 'mailTpl');
      break;
    case 'mail':
      $docType && $docsPath = $docs->getDocs('save');
      $mail = new Mail($mailTpl ?? 'mailTpl');
      $param = [
        'name'  => $name ?? '',
        'phone' => $tel ?? $phone ?? '',
        'email' => $email ?? '',
        'info'  => $info ?? '',
        'data'  => $data,
      ];
      count($_FILES) && $mail->addOtherFile($_FILES);
      $mail->prepareMail($param);
      $docType && $mail->addFile($docsPath);
      isset($email) && $mail->addMail($email);
      $result['mail'] = $mail->send();
      break;
    case 'getPrintStyle':
      $fileTpl = $fileTpl ?? 'printTpl.css';

      if (file_exists(ABS_SITE_PATH . 'public/views/docs/' . $fileTpl)) {
        $result['style'] = file_get_contents(ABS_SITE_PATH . 'public/views/docs/' . $fileTpl);
      }
      break;
  }
}
