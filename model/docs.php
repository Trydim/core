<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 * @var string $docType - from query
 */

$data = [];
$cmsAction = $cmsAction ?? 'mail';
$docType   = $docType ?? $cmsAction;

$reportValue = json_decode($reportValue ?? '[]', true);
// Sent order id if report is empty
$orderId = empty($reportValue) ? ($orderId ?? false) : false;
// Get order id from report value
!$orderId && $orderId = isset($reportValue['orderId']) ? json_decode($reportValue['orderId']) : false;

// Manager data from data base
// ---------------------------------------------------------------------------------------------------------------------
if (isset($addManager)) {
  if (isset($reportValue['name'])) { // Имя пользователя - неправильно
    $userData = $main->db->getUser($reportValue['userId'] ?? $reportValue['name'], 'name, contacts');
  } else if ($orderId) { // Менеджер из сохраненного заказа
    $userData = $main->db->getUserByOrderId($orderId);
  } else { // Текущий пользователь
    $userData = $main->db->getUserById($main->getLogin('id'));
  }

  if (count($userData)) $data['userData'] = $userData;
  unset($userData);
}

// Customer data from data base
// ---------------------------------------------------------------------------------------------------------------------
if (isset($addCustomer)) {
  if (isset($customerId)) {
    $customerData = $main->db->selectQuery('customers', '*', " ID = $customerId");
  } else if ($orderId) { // Заказчик из сохраненного заказа
    $customerData = $main->db->loadCustomerByOrderId($orderId);
  } else $customerData = $customer ?? [];

  if (count($customerData)) {
    $customerData['contacts'] = json_decode($customerData['contacts'] ?? '{}', true);
    $data['customerData'] = $customerData;
  }
  unset($customerData);
}

// If the report is empty, then the order is loaded by order id
// ---------------------------------------------------------------------------------------------------------------------
if ($orderId && count($reportValue) === 0) {
  $reportValue = $main->db->loadOrdersById($orderId, true);

  $reportValue['id'] = $reportValue['ID'];

  $data['order'] = $reportValue;
  $data['reportValue'] = &$reportValue['reportValue'];
} else if (count($reportValue)) {
  $data['reportValue'] = $reportValue['reportValue'] ?? $reportValue;
}

// Create docs
// ---------------------------------------------------------------------------------------------------------------------
if (in_array($docType, ['excel', 'pdf', 'print'])) {
  $docs = new Docs(
    $main,
    [
      'docType' => $docType,
      'library' => $main->getCmsParam('PDF_LIBRARY'),
      'orientation' => $pdfOrientation ?? 'P',
    ],
    $data,
    $fileTpl ?? 'default'
  );
} else $docType = false;

switch ($cmsAction) {
  case 'excel':
  case 'pdf':
  case 'print':
    $docType && $main->response->setContent($docs->getDocs($main->url->request->get('fileMode', '')));
    break;
  case 'mail':
    $docType && $docsPath = $docs->getDocs('save');
    $mail = new Mail($main, $mailTpl ?? 'mailTpl');
    $param = [
      'name'  => $name ?? '',
      'phone' => $tel ?? $phone ?? '',
      'email' => $email ?? '',
      'info'  => $info ?? '',
      'data'  => $data,
    ];
    count($_FILES) && $mail->addOtherFile($_FILES);
    $mail->setSubject($mailSubject ?? $subject ?? '');
    $mail->prepareMail($param);
    $docType && $mail->addFile($docsPath);

    $otherMail = $otherMail ?? [];
    isset($email) && !empty($email) && $otherMail[] = $email;
    $mail->addMail($otherMail);
    $main->response->setContent(['mail' => $mail->send()]);
    break;
  case 'getPrintStyle':
    $fileTpl = ABS_SITE_PATH . 'public/views/docs/' . ($fileTpl ?? 'printTpl.css');

    $main->response->setContent(['style' => file_exists($fileTpl) ? file_get_contents($fileTpl) : '']);
    break;
}
