<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (!defined('MAIN_ACCESS')) die('access denied!');

// General setting

// To
define('MAIL_TARGET', 'trydim@mail.ru');
define('MAIL_SUBJECT', 'Заявка с сайта');
// From
define('MAIL_SMTP', true);
define('MAIL_HOST', 'smtp.yandex.ru');
define('MAIL_PORT', 465);
define('MAIL_FROM', 'noreplycalcby@yandex.ru');
define('MAIL_PASSWORD', '638ch1');
//define('MAIL_FROM', 'commonserver@yandex.ru');
//define('MAIL_PASSWORD', 'xmbxqxulvhwcqyta');
define('MAIL_FROM_USER', 'calc.by');

require_once 'vendor/autoload.php';

class Mail {
  private $cpNumber   = 1;
  private $mailTpl    = '', $body = '', $docPath = '', $pdfFileName = '';
  private $mailTarget = MAIL_TARGET;
  private $subject         = MAIL_SUBJECT;
  private $otherMail       = [];
  private $attachmentFiles = [];

  public function __construct($mailTpl = 'mailTpl') {
    $this->mailTpl = $mailTpl;

    if (!DEBUG && file_exists(SETTINGS_PATH)) {
      $setting = getSettingFile();
      $this->mailTarget = $setting['orderMail'];
      isset($setting['orderMailCopy']) && $this->otherMail[] = $setting['orderMailCopy'];
    }
  }

  public function prepareMail($array) {
    if (!count($array)) return;

    extract($array);
    ob_start();

    if (file_exists(ABS_SITE_PATH . 'public/views/docs/' . $this->mailTpl . '.php'))
      include ABS_SITE_PATH . "public/views/docs/$this->mailTpl.php";
    else if (file_exists(CORE . "views/docs/$this->mailTpl.php"))
      include CORE . "views/docs/$this->mailTpl.php";

    $this->body = ob_get_clean();
  }

  public function setSubject($str) {
    $this->subject = $str;
  }

  public function addMail($email) {
    $this->otherMail[] = $email;
  }

  public function addFile($docPath, $fileName = "") {
    $this->docPath = $docPath;
    $this->pdfFileName = $fileName !== '' ? $fileName : uniqid() . '.pdf';
    //'КП_' . $this->cpNumber . '_' . date('dmY') . '.pdf';
  }

  public function addOtherFile($files) {
    $that = $this;
    array_map(function ($file) use (&$that) {
      if (!is_file($file['tmp_name'])) return;
      $that->attachmentFiles[] = [
        'path' => $file['tmp_name'],
        'name' => $file['name'],
        'type' => $file['type'],
        //$encoding = self::ENCODING_BASE64,
      ];
    }, $files);
  }

  public function send() {
    $mail = new PHPMailer();
    try {
      if (MAIL_SMTP) {
        $mail->isSMTP();                         // Send using SMTP
        $mail->SMTPDebug = DEBUG;                // Enable verbose debug output
        $mail->Host = MAIL_HOST;                 // Set the SMTP server to send through
        $mail->SMTPAuth = true;                  // Enable SMTP authentication
        $mail->Username = MAIL_FROM;             // SMTP username
        $mail->Password = MAIL_PASSWORD;         // SMTP password
        $mail->SMTPSecure = 'ssl';               // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
        $mail->Port = MAIL_PORT;                 // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above
      }
      $mail->CharSet = "UTF-8";
      $mail->From = MAIL_FROM;
      $mail->FromName = MAIL_FROM_USER;

      // Получатель письма
      !DEBUG && $mail->addBCC($this->mailTarget);
      foreach ($this->otherMail as $moreMail)
        $mail->addBCC($moreMail);

      // -----------------------
      // Mail Body
      // -----------------------
      $mail->isHTML(true);

      if (isset($resource))
        for ($i = 1; $i <= count($resource); $i++)
          $mail->AddEmbeddedImage($resource[$i - 1], "pict$i.jpg", "pict$i.jpg", 'base64', 'image/jpeg');

      $mail->Subject = $this->subject;
      $mail->Body = $this->body;
      $mail->AltBody = 'Тестовое сообщение.';

      // Attachment files
      if (is_file($this->docPath)) {
        $mail->addAttachment($this->docPath, $this->pdfFileName);
        $resource = [$this->docPath];
      }

      // Other Files
      foreach ($this->attachmentFiles as $file) {
        $mail->addAttachment($file['path'], $file['name'], 'base64', $file['type']);
      }

      $mail->send();

      if (isset($resource)) array_map(function ($item) { unlink($item); }, $resource);

      return true;
    } catch (Exception $e) {
      return 'Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}';
    }
  }

  /*
private function createImg($img) {
  define('PATH', '../'); // ссылки приходят относительно index.php - указать путь
  // стоит добавить проверку на адекватность
  $arrResource = [];
  foreach ($img as $items) {
    $size = getimagesize(PATH . $items[0]);
    if($size) {
      $resultImg = @imagecreatetruecolor($size[0], $size[1]);
      foreach ($items as $img) {
        if($layerImg = imagecreatefrompng( PATH . $img ))
          imagecopy($resultImg, $layerImg, 0, 0, 0, 0, $size[0], $size[1]);
      }
      $filename = uniqid() . '.jpg';
      imagejpeg($resultImg, $filename, 50);
      array_push($arrResource, $filename);
    }
  }
  return $arrResource;
}*/

}
