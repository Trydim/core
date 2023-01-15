<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $main - global
 * @var string $cmsAction - extract from query in main.php
 * @var string $docType - from query
 */

$data = [];

// Если есть отчет
$reportValue = json_decode($reportValue ?? '[]', true);
// Если есть номер заказа
$orderId = empty($reportValue) ? ($orderId ?? false) : false;
// Посмотреть номер заказа в отчете
!$orderId && $orderId = isset($reportValue['orderId']) ? json_decode($reportValue['orderId']) : false;

// Данные о менеджере
// ---------------------------------------------------------------------------------------------------------------------
if (isset($addManager)) {
  if (isset($reportValue['name'])) { // Имя пользователя - неправильно
    $userData = $main->db->getUser($reportValue['userId'] ?? $reportValue['name'], 'name, contacts');
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
  } else $customerData = $customer ?? [];

  if (count($customerData)) {
    $userData['contacts'] = json_decode($customerData['contacts'] ?? '{}', true);
    $data['customerData'] = $userData;
  }
  unset($customerData);
}

// Отчет загрузить из БД по ИД
// ---------------------------------------------------------------------------------------------------------------------
if ($orderId) {
  $reportValue = $main->db->loadOrdersById($orderId);

  $reportValue['id']           = $reportValue['ID'];

  $reportValue['contacts']       = json_decode($reportValue['contacts'], true);
  $reportValue['importantValue'] = json_decode($reportValue['importantValue'], true);
  $reportValue['saveValue']      = json_decode($reportValue['saveValue'], true);
  $reportValue['reportValue']    = json_decode($reportValue['reportValue'], true);

  $data['order'] = $reportValue;
  $data['reportValue'] = &$reportValue['reportValue'];
} else if ($reportValue) {
  $data['reportValue'] = $reportValue;
}

$cmsAction = $cmsAction ?? 'mail';
$docType = $docType ?? $cmsAction;

// Создание документа
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
    $docType && $main->response->setContent($docs->getDocs($mailTpl ?? 'mailTpl'));
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

    if (file_exists($fileTpl)) $main->response->setContent(['style' => file_get_contents($fileTpl)]);
    break;
}
