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


  private function setPath() {
    $this->param->path = $this->param->name;
    $this->param->uri = $this->fileUrl . $this->param->name;
  }
  private function setFileParam(array $file) {
    $this->param->originalName = $file['name'];
    $this->param->originalFileName = pathinfo($this->param->originalName, PATHINFO_FILENAME);
    $this->param->name = $file['name'];
    $this->param->ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $this->param->type = $file['type'] ?? null;
    $this->param->size = $file['size'] ?? null;
    $this->setPath();
  }
  private function setNewName() {
    $name = $this->param->originalFileName . '_' . rand();
    $this->param->name = $name . '.' . $this->param->ext;
    $this->setPath();
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

  private function move($file) {
    if (!move_uploaded_file($file['tmp_name'], $this->absUploadDir . $this->param->name))
      throw new Error('Moving file error: ' . $this->param->originalName);
  }

  public function optimize() {
    $name = $this->param->name;
    $ext = $this->param->ext;
    $filePath = $this->absUploadDir . $name;

    if (!file_exists($filePath)) {
      $filePath = self::findingFile($name);
    }

    $fileRes = self::createImageFile($filePath, $ext);

    // размер
    if (imagesx($fileRes) > 1000 || imagesy($fileRes) > 1000) {
      $fileRes = self::imageResize($fileRes, 1000, 1000, true);
    }

    // добавить webp
    if (stripos($ext, 'webp') === false) {
      $name = str_replace('.' . $ext, '.webp', $name);
      imagewebp($fileRes, $this->absUploadDir . $name, 95);
    }
    // добавить png
    else if (stripos($ext, 'webp') !== false) {
      $name = str_replace('.' . $ext, '.png', $name);
      imagepng($fileRes, $this->absUploadDir . $name, 95);
    }
  }

  /**
   * @param $fileName {string} - only file name without slash
   * @param $path {string} - path without slash on the end
   * @return false|string
   */
  static function findingFile($fileName, $path = null) {
    $sep = DIRECTORY_SEPARATOR;
    $path = $path ?? ABS_SITE_PATH . self::UPLOAD_DIR;

    if (!is_dir($path)) return false;
    if (file_exists($path . $sep . $fileName)) return $path . $sep . $fileName;

    $arrDir = array_values(array_filter(scandir($path), function ($dir) use ($path, $sep) {
      return !($dir === '.' || $dir === '..' || is_file($path . $sep . $dir));
    }));

    $length = count($arrDir);
    for ($i = 0; $i < $length; $i++) {
      $result = self::findingFile($fileName, $path . $sep . $arrDir[$i]);
      if ($result) return $result;
    }

    return false;
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

  static function createImageFile($filePath, $ext = null) {
    switch ($ext ?? pathinfo($filePath, PATHINFO_EXTENSION)) {
      default:
      case 'jpg': case 'jpeg': case 'image/jpeg':
      return imagecreatefromjpeg($filePath);
      case 'png': case 'image/png':
      return imagecreatefrompng($filePath);
      case 'webp': case 'image/webp':
      return imagecreatefromwebp($filePath);
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
   * @param array $file
   * @return FS
   */
  public function prepareFile(array $file): FS {
    $this->setFileParam($file);

    return $this;
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

    $this->prepareFile($file);
    $result = $this->checkUploadFile();

    if ($result === self::HAVE_NAME) $this->setNewName();
    if (!is_numeric($result)) $this->move($file);

    // Конвертация и размер
    if ($optimize) $this->optimize();

    return is_numeric($result) ? $result : $this->param;
  }
}
