<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $main - global
 * @var array $dbConfig - config from public
 * @var string $docsAction
 * @var string $docType
 */

$reportVal = isset($reportVal) ? json_decode($reportVal, true) : false;
$orderIds = isset($orderIds) ? json_decode($orderIds) : false;
!$orderIds && $orderIds = isset($reportVal['orderIds']) ? json_decode($reportVal['orderIds']) : false;
$orderIds = is_array($orderIds) && count($orderIds) === 1 ? $orderIds[0] : false;

$addManager = isset($addManager) || isset($useUser) || isset($addUser);

if ($orderIds || $addManager) {
  require_once 'classes/Db.php';
  $db = new RedBeanPHP\Db($dbConfig);
}

if ($orderIds) { // Отчет взять из базы
  $reportVal = $db->loadOrderById($orderIds);
  $userData = [
    'name' => $reportVal['name'],
    'userId' => $reportVal['userId'],
    'contacts' => $reportVal['contacts'],
  ];
  isset($reportVal['report_value']) && $reportVal = json_decode($reportVal['report_value'], true);
  $reportVal['userData'] = $userData;
}

if ($addManager) { // Данные о менеджере
  if (isset($userData['name'])) {
    $userData = $db->getUser($userData['name'], 'name, contacts');
  } else if (isset($userData['userId'])) {
    $userData = $db->getUserById($userData['userId']);
  } else $userData = $db->getUserByOrderId($main->getLogin('id'));
  if (count($userData)) $reportVal['userData'] = $userData;
}

$docType = isset($docType) ? $docType : '';
!isset($docsAction) && $docsAction = $docType;
$useDocs = isset($usePdf) || in_array($docType, ['pdf', 'excel']);
isset($fileTpl) ? $useDocs = true : $fileTpl = 'default';
$mailTpl = isset($mailTpl) ? $mailTpl : 'mailTpl';

if (count($_FILES)) {
  //$filesArray = array_map(function ($files) { return $files; }, $_FILES);
  $filesArray = $_FILES;
}

if ($useDocs) {
  !$docType && $docType = 'pdf';
  require_once 'classes/Docs.php';
  $docs = new Docs($docType, $reportVal, $fileTpl);
}

if (isset($docsAction)) {
  switch ($docsAction) {
    case 'excel':
    case 'pdf':
      $useDocs && $result = $docs->getDocs($mailTpl);
      break;
    case 'mail':
      $useDocs && $docsPath = $docs->getDocs('save');
      require_once 'classes/Mail.php';
      $mail = new Mail($mailTpl);
      $param = [
        'name'  => isset($name) ? $name: '',
        'phone' => isset($tel) ? $tel : (isset($phone) ? $phone : ''),
        'email' => isset($email) ? $email : '',
        'info'  => isset($info) ? $info : '',
        'data'  => $reportVal,
      ];
      isset($filesArray) && $mail->addOtherFile($filesArray);
      $mail->prepareMail($param);
      $useDocs && $mail->addFile($docsPath);
      isset($email) && $mail->addMail($email);
      $result['mail'] = $mail->send();
      break;
  }
}
