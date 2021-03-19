<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $dbConfig - config from public
 * @var string $docsAction
 * @var string $docType
 */

$reportVal = isset($reportVal) ? json_decode($reportVal, true) : false;
$orderIds = isset($orderIds) ? json_decode($orderIds) : false;
!$orderIds && $orderIds = isset($reportVal['orderIds']) && count($reportVal['orderIds']) === 1 ? $reportVal['orderIds'] : false;

if ($orderIds) { // Отчет взять из базы
  require_once 'libs/Db.php';
  $db = new RedBeanPHP\Db($dbConfig);
  $reportVal = $db->loadOrderById($orderIds);
  isset($reportVal['report_value']) && $reportVal = json_decode($reportVal['report_value'], true);
}

!isset($docsAction) && $docsAction = $docType;
$useDocs = isset($usePdf) || in_array($docType, ['pdf', 'excel']);
isset($fileTpl) ? $useDocs = true : $fileTpl = 'default';

if (count($_FILES)) {
  //$filesArray = array_map(function ($files) { return $files; }, $_FILES);
  $filesArray = $_FILES;
}

if ($useDocs) {
  require_once 'libs/Docs.php';
  $docs = new Docs($docType, $reportVal, $fileTpl);
}

if (isset($docsAction)) {
  switch ($docsAction) {
    case 'excel':
    case 'pdf':
      $useDocs && $result = $docs->getDocs();
      break;
    case 'mail':
      $useDocs && $docsPath = $docs->getDocs('save');
      require_once 'libs/Mail.php';
      $mail = new Mail();
      $param = [
        'name'  => isset($name) ? $name: '',
        'phone' => isset($tel) ? $tel : (isset($phone) ? $phone : ''),
        'email' => isset($email) ? $email : '',
        'info'  => isset($info) ? $info : '',
        'data'  => $reportVal,
      ];
      isset($filesArray) && $mail->addOtherFile($filesArray);
      $mail->prepareMail($param);
      //$mail->setSubject($pdfPath);
      $useDocs && $mail->addFile($docsPath);
      $mail->addMail($email);
      $result['mail'] = $mail->send();
      break;
  }
}
