<?php


class FS {
  const UPLOAD_DIR = SHARE_PATH . 'upload';

  const HAVE_NAME = 'exist';

  /**
   * @var Main
   */
  private $main;
  /**
   * @var string
   */
  private $absUploadDir;
  /**
   * @var string
   */
  private $fileUrl;
  /**
   * @var object
   */
  private $param;

  public function __construct(Main $main) {
    $this->main = $main;
    $this->absUploadDir = $main->url->getPath(true) . $this::UPLOAD_DIR . DIRECTORY_SEPARATOR;
    $this->fileUrl = $main->url->getUri() . $this::UPLOAD_DIR . '/';
    $this->param = new class {};
    $this->checkUploadDir();
  }

  private function setFileParam(array $file) {
    $this->param->originalName = $file['name'];
    $this->param->originalFileName = pathinfo($this->param->originalName, PATHINFO_FILENAME);
    $this->param->name = $file['name'];
    $this->param->ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $this->param->type = $file['type'];
    $this->param->size = $file['size'];
  }
  private function setNewName() {
    $name = $this->param->originalFileName . '_' . rand();
    $this->param->name = $name . '.' . $this->param->ext;
  }
  private function checkUploadDir() {
    try {
      if (!is_dir($this->absUploadDir)) mkdir($this->absUploadDir, 0777, true);
    } catch (Exception $e) {
      die('Error create upload directory: ' . $e->getMessage());
    }
  }

  /**
   * @return bool|int - \n
   * false - file not exist
   * self::HAVE_NAME - file exist
   * integer - id file from DB
   */
  private function checkUploadFile() {
    $name = $this->param->name;
    $filePath = $this->absUploadDir . $name;

    // if (!$file['size']) continue; // Проверить все

    if (file_exists($filePath)) {
      //$result['fileExist'] = $result['fileExist'] ?? [];
      //$result['fileExist'][] = $file['name'];

      if ($this->param->size === filesize($filePath)) {
        // Проверить есть файл в БД
        $id = $this->main->db->selectQuery('files', 'ID', " path = '$name' ");

        if (count($id) === 1) return $id[0]; // если есть вернуть ИД?
      }
      return self::HAVE_NAME; // если нету в БД
    }
    return false;
  }

  public function optimize() {
    $name = $this->param->name;
    $ext = $this->param->ext;
    $fileRes = self::createImageFile($this->absUploadDir . $name, $ext);

    // размер
    /*if (imagesx($fileRes) > 1000 || imagesy($fileRes) > 1000) {
      $fileRes = imageResize($fileRes, 1000, 1000, true);
    }*/

    // добавить webp
    if (stripos($ext, 'webp') === false) {
      $name = str_replace('.' . $ext, '.webp', $name);
      imagewebp($fileRes, $this->absUploadDir . $name, 95);
    }

    else if (stripos($ext, 'webp') !== false) { // добавить png
      $name = str_replace('.' . $ext, '.png', $name);
      imagepng($fileRes, $this->absUploadDir . $name, 95);
    }
  }

  static function imageResize($resource, $width, $height, $saveRatio = false) {
    if (is_string($resource) && file_exists($resource)) {
      $resource = self::createImageFile($resource);
    }

    $rWidth = imagesx($resource);
    $rHeight = imagesy($resource);

    if ($saveRatio) {
      if ($width < $height) {
        $ratio = $width / $rWidth;
        $height = ceil($rHeight * $ratio);
      } else {
        $ratio = $height / $rHeight;
        $width = ceil($rWidth * $ratio);
      }
    }

    $destination = imagecreatetruecolor($width, $height);
    $backgroundColor = imagecolorallocate($destination, 255, 255, 255);
    imagefill($destination, 0, 0, $backgroundColor);
    imagefilledrectangle($destination, 0, 0, $width, $height, $backgroundColor);
    imagecopyresized($destination, $resource, 0, 0, 0, 0, $width, $height, $rWidth, $rHeight);
    return $destination;
  }

  static function createImageFile($file, $ext = null) {
    switch ($ext ?? pathinfo($file, PATHINFO_EXTENSION)) {
      default:
      case 'jpg': case 'jpeg': case 'image/jpeg':
      return imagecreatefromjpeg($file);
      case 'png': case 'image/png':
      return imagecreatefrompng($file);
      case 'webp': case 'image/webp':
      return imagecreatefromwebp($file);
    }
  }

  public function saveAllFromRequest(): array {
    $result = [];

    foreach ($_FILES as $key => $file) {
      $result[$key] = $this->saveFromRequest($key);
    }

    return $result;
  }

  /**
   * @param string $key
   * @param ?bool $optimize
   * @return string|integer|object
   * string - error<br>
   * integer - ID from DB <br>
   * object - {name, extension, type}
   */
  public function saveFromRequest(string $key, bool $optimize = false) {
    $file = $_FILES[$key] ?? null;
    if (!isset($file)) return false;

    $this->setFileParam($file);

    $result = $this->checkUploadFile();

    if ($result === self::HAVE_NAME) $this->setNewName();

    $name = $this->param->name;
    $this->param->path = $this->absUploadDir . $name;
    $this->param->uri = $this->fileUrl . $name;
    if (!move_uploaded_file($file['tmp_name'], $this->param->path))
      return 'Moving file error: ' . $this->param-originalName;

    // Конвертация и размер
    if ($optimize) $this->optimize();

    return is_numeric($result) ? $result : $this->param;
  }
}
