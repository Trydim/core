<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $dbConfig - config from public
 * @var string $name
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
$pdf = new Pdf($reportVal);
//$pdf->setTemplate($docType);

if (isset($docType)) {
	switch ($docType) {
		case 'pdf':
			$result = $pdf->getPdf();
			break;
		case 'mail':
			$pdfPath = $pdf->getPdf('save');
			require_once 'libs/mail.php';
			$mail = new Mail();
			$param = [
				'name'  => $name,
				'phone' => $phone,
				'email' => $email,
				'data'  => $reportVal
			];
			$mail->prepareMail($param);
			//$mail->setSubject($pdfPath);
      $mail->addPdf($pdfPath);
			$mail->addMail($email);
			$result['mail'] = $mail->send();
			break;
	}
}
