<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $dbConfig - config from public
 * @var string $docType
 * @var string $name
 * @var string $phone
 * @var string $email
 */

require_once 'libs/pdf.php';

$reportVal = isset($reportVal) ? json_decode($reportVal, true) : false;

if (!$reportVal && isset($orderIds)) { // Отчет взять из базы
  $orderIds = json_decode($orderIds);

  require_once 'libs/db.php';
  $db = new RedBeanPHP\db($dbConfig);
  $reportVal = $db->loadOrderById($orderIds);
  isset($reportVal['report_value']) && $reportVal = json_decode($reportVal['report_value'], true);
}

$phone = isset($tel) ? $tel : $phone;
$usePdf = isset($usePdf) || $docType === 'pdf';

if (count($_FILES)) {
  //$filesArray = array_map(function ($files) { return $files; }, $_FILES);
  $filesArray = $_FILES;
}

$usePdf && $pdf = new Pdf($reportVal);
//$usePdf && $pdf->setTemplate($docType);

if (isset($docType)) {
	switch ($docType) {
		case 'pdf':
			$result = $pdf->getPdf();
			break;
		case 'mail':
      $usePdf && $pdfPath = $pdf->getPdf('save');
			require_once 'libs/mail.php';
			$mail = new Mail();
			$param = [
				'name'  => $name,
				'phone' => $phone,
				'email' => $email,
				'data'  => $reportVal
			];
			isset($filesArray) && $mail->addOtherFile($filesArray);
			$mail->prepareMail($param);
			//$mail->setSubject($pdfPath);
      $usePdf && $mail->addPdf($pdfPath);
			$mail->addMail($email);
			$result['mail'] = $mail->send();
			break;
	}
}
