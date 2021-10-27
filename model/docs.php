<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $main - global
 * @var array $dbConfig - config from public
 * @var string $docsAction
 * @var string $docType
 */

$data = [];

$reportVal = isset($reportVal) ? json_decode($reportVal, true) : false;
$orderIds = isset($orderIds) ? json_decode($orderIds) : false;
!$orderIds && $orderIds = isset($reportVal['orderIds']) ? json_decode($reportVal['orderIds']) : false;
$orderIds = is_array($orderIds) && count($orderIds) === 1 ? $orderIds[0] : false;

$addManager = isset($addManager) || isset($useUser) || isset($addUser);

if ($orderIds || $addManager) {
  require_once 'classes/Db.php';
  $db = new RedBeanPHP\Db($dbConfig);
}

// Отчет загрузить из БД по ИД
if ($orderIds) {
  $reportVal = $db->loadOrderById($orderIds);

  $reportVal['id']           = $reportVal['ID'];
  $reportVal['customerName'] = $reportVal['C.name'];

  $reportVal['contacts']       = json_decode($reportVal['contacts'], true);
  $reportVal['importantValue'] = json_decode($reportVal['importantValue'], true);
  $reportVal['saveValue']      = json_decode($reportVal['saveValue'], true);
  $reportVal['reportValue']    = json_decode($reportVal['reportValue'], true);

  $data = [
    'order'       => $reportVal,
    'reportValue' => &$reportVal['reportValue'],
  ];
} else if ($reportVal) {
  $data['reportValue'] = $reportVal;
}

// Данные о менеджере
if ($addManager) {
  if (isset($reportVal['name'])) {
    $userData = $db->getUser($reportVal['name'], 'name, contacts');
  } else if (isset($reportVal['userId'])) {
    $userData = $db->getUserById($reportVal['userId']);
  } else {
    $userData = $db->getUserByOrderId($main->getLogin('id'));
}

  if (count($userData)) {
    $userData['contacts']  = json_decode($userData['contacts'], true);
    $data['userData'] = $userData;
  }
}

!isset($docsAction) && $docsAction = $docType;
$docType = isset($docType) ? $docType : false;
isset($usePdf) && $docType = 'pdf';
isset($useExcel) && $docType = 'excel';
$docType === 'mail' && $docType = false;

$mailTpl = isset($mailTpl) ? $mailTpl : 'mailTpl';

if (count($_FILES)) {
  //$filesArray = array_map(function ($files) { return $files; }, $_FILES);
  $filesArray = $_FILES;
}

if ($docType && $docType !== 'mail') {
  require_once 'classes/Docs.php';
  $docs = new Docs($docType, $data, isset($fileTpl) ? $fileTpl : 'default');
}

if (isset($docsAction)) {
  switch ($docsAction) {
    case 'excel':
    case 'pdf':
    case 'print':
      $docType && $result = $docs->getDocs($mailTpl);
      break;
    case 'mail':
      $docType && $docsPath = $docs->getDocs('save');
      require_once 'classes/Mail.php';
      $mail = new Mail($mailTpl);
      $param = [
        'name'  => $name ?? '',
        'phone' => $tel ?? ($phone ?? ''),
        'email' => $email ?? '',
        'info'  => $info ?? '',
        'data'  => $data,
      ];
      isset($filesArray) && $mail->addOtherFile($filesArray);
      $mail->prepareMail($param);
      $docType && $mail->addFile($docsPath);
      isset($email) && $mail->addMail($email);
      $result['mail'] = $mail->send();
      break;

    case 'getPrintStyle':
      $fileTpl = isset($fileTpl) ? $fileTpl : 'printTpl.css';

      if (file_exists(ABS_SITE_PATH . 'public/views/docs/' . $fileTpl)) {
        ob_start();
        include(ABS_SITE_PATH . 'public/views/docs/' . $fileTpl);
        $result['style'] = ob_get_clean();
      }
      break;
  }
}
