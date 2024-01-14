<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

global $main;

// General setting
!defined('MAIL_TARGET') && define('MAIL_TARGET', 'trydim@mail.ru');
!defined('MAIL_SUBJECT_DEFAULT') && define('MAIL_SUBJECT_DEFAULT', 'Заявка с сайта ' . $_SERVER['SERVER_NAME']);
!defined('ABS_SITE_PATH') && define('ABS_SITE_PATH', $_SERVER['DOCUMENT_ROOT']);

// MailSetting
define('MAIL_TARGET_DEBUG', $main->getCmsParam('MAIL_TARGET_DEBUG') ?? 'trydim@mail.ru');
define('MAIL_SMTP', $main->getCmsParam('MAIL_SMTP') ?? true);
define('MAIL_PORT', $main->getCmsParam('MAIL_PORT') ?? 465);

define('MAIL_HOST', $main->getCmsParam('MAIL_HOST') ?? 'smtp.mail.ru');
define('MAIL_FROM', $main->getCmsParam('MAIL_FROM') ?? 'mail.common@list.ru');
define('MAIL_PASSWORD', $main->getCmsParam('MAIL_PASSWORD') ?? 'Ea4uUCnzBBN269wDJWUx');

/*
define('MAIL_HOST', $main->getCmsParam('MAIL_HOST') ?? 'smtp.yandex.ru');
define('MAIL_FROM', $main->getCmsParam('MAIL_FROM') ?? 'commonserver@yandex.ru');
define('MAIL_PASSWORD', $main->getCmsParam('MAIL_PASSWORD') ?? 'xmbxqxulvhwcqyta');
*/

class Mail {
  /**
   * @var Main
   */
  private $main;

  private $mailTpl, $body = '', $docPath = [], $pdfFileName = [];
  private $mailTarget;
  private $subject, $fromName;
  private $otherMail       = [];
  private $attachmentFiles = [];

  /**
   * @param string $fileName
   * @return string
   */
  private function findFile(string $fileName): string {
    return __DIR__ . '/template/mailTpl.php';
  }

  /**
   * @param string $mailTpl
   */
  public function __construct(Main $main, string $mailTpl) {
    $this->main = $main;
    $this->mailTpl = $mailTpl;

    if (!DEBUG) {
      $setting = $main->getSettings();
      $this->mailTarget = $setting['mailTarget'];
      strlen($setting['mailTargetCopy'] ?? '') && $this->otherMail[] = $setting['mailTargetCopy'];
      strlen($setting['mailFromName'] ?? '') && $this->fromName = $setting['mailFromName'];

      $this->setSubject($setting['mailSubject'] ?? MAIL_SUBJECT_DEFAULT);
    }
  }

  /**
   * @param array $array
   */
  public function prepareMail(array $array = []): void {
    $path = "public/views/docs/$this->mailTpl.php";

    extract($array);
    ob_start();

    do {
      // dealer template
      $prefPath = $this->main->url->getPath(true) . $path;
      if (file_exists($prefPath)) {include $prefPath; break;}
      // public template
      $prefPath = $this->main->url->getBasePath(true) . $path;
      if (file_exists($prefPath)) {include $prefPath; break;}
      // absolute path
      if (file_exists($this->mailTpl)) {include $this->mailTpl; break;}
      // default template
      ob_clean();
      $this->body = $this->getDefaultTemplate();
    } while (false);

    $this->body = ob_get_clean();
  }

  /**
   * @param string $str
   */
  public function setSubject(string $str): void {
    !empty($str) && $this->subject = $str;
  }

  /**
   * @param string|array $emails
   */
  public function addMail($emails): void {
    if (is_string($emails)) $this->otherMail[] = $emails;
    else if (!empty($emails)) $this->otherMail = array_merge($this->otherMail, $emails);
  }

  /**
   * @param string $docPath
   * @param string $fileName
   */
  public function addFile(string $docPath, string $fileName = '') {
    $fileName = !empty($fileName) ? $fileName : basename($docPath);
    $this->docPath[] = $docPath;
    $this->pdfFileName[] = empty($fileName) ? uniqid() . '.pdf' : $fileName;
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
    require_once CORE . 'libs/vendor/autoload.php';
    $mail = new PHPMailer();
    $mail->SMTPDebug = DEBUG;                    // Enable verbose debug output
    $mail->CharSet = "UTF-8";

    try {
      if (MAIL_SMTP) {
        $mail->isSMTP();                         // Send using SMTP
        $mail->Host = MAIL_HOST;                 // Set the SMTP server to send through
        $mail->SMTPAuth = true;                  // Enable SMTP authentication
        $mail->Username = MAIL_FROM;             // SMTP username
        $mail->Password = MAIL_PASSWORD;         // SMTP password
        $mail->SMTPSecure = 'ssl';               // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
        $mail->Port = MAIL_PORT;                 // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above
      }

      // Получатель письма
      if (DEBUG) {
        $this->mailTarget = MAIL_TARGET_DEBUG;
        $this->subject  = 'Тестовое письмо ' . $_SERVER['SERVER_NAME'];
        $this->fromName = 'vistegra.by';
      }

      $mail->addBCC($this->mailTarget ?? MAIL_TARGET_DEBUG);
      $mail->From = MAIL_FROM;
      $mail->FromName = $this->fromName;

      foreach ($this->otherMail as $moreMail) {
        $mail->addBCC($moreMail);
      }

      // -----------------------
      // Mail Body
      // -----------------------

      if (isset($resource))
        for ($i = 1; $i <= count($resource); $i++)
          $mail->AddEmbeddedImage($resource[$i - 1], "pict$i.jpg", "pict$i.jpg", 'base64', 'image/jpeg');

      $mail->Subject = $this->subject ?? MAIL_SUBJECT_DEFAULT;
      $mail->MsgHTML($this->body);
      $mail->AltBody = 'Тестовое сообщение.';

      // Attachment files
      $resource = [];
      foreach ($this->docPath as $index => $filePath) {
        if (is_file($filePath)) {
          $mail->addAttachment($filePath, $this->pdfFileName[$index]);
          $resource[] = $filePath;
        }
      }

      // Other Files
      foreach ($this->attachmentFiles as $file) {
        $mail->addAttachment($file['path'], $file['name'], 'base64', $file['type']);
      }

      $mail->send();

      if (isset($resource)) array_map(function ($item) { unlink($item); }, $resource);

      return true;
    } catch (Exception $e) {
      return "The email has not been sent. Error: $mail->ErrorInfo";
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

  /**
   * @return string
   */
  private function getDefaultTemplate(): string {
    $htmlTemplate = 'Default Template<br>';
    foreach ($_REQUEST as $k => $v) {
      $htmlTemplate .= "<div>$k: $v</div>";
    }
    return $htmlTemplate;
  }

}

