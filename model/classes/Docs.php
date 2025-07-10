<?php

//const RESULT_PATH = 'shared/'; // Папка для временных файлов

!defined('PATH_IMG') && define('PATH_IMG', $_SERVER['DOCUMENT_ROOT'] . '/images/');

class Docs {
  const PATH_IMG = ABS_SITE_PATH . 'images/';
  /**
   * Папка для временных файлов
   */
  const RESULT_PATH = 'shared/';

  /**
   * Page orientation
   *
   * @var string [P/L]
   */
  private $pdfOrientation;

  /**
   * @var array
   */
  private $data, $pdfParam;

  /**
   * @var string
   */
  private $docsType, $fileTpl, $filePath, $content, $styleContent, $footerPage = '', $imgPath, $dealImgPath;

  /**
   * @var array
   */
  private $domFooter = [];

  /**
   * @var object
   */
  private $docs;

  /**
   * If true, then use default template
   * @var boolean
   */
  private $useDefault = false;

  /**
   * temp files path, unlink after make pdf
   * @var array
   */
  private $tmpFiles = [];
  /**
   * @var Main|null
   */
  private $main;
  /**
   * @var string
   */
  public $filename;

  /**
   * Docs constructor.
   * @param Main $main
   * @param array $param {library: string, orientation: string, docType: string}
   * @param $data
   * @param string $fileTpl
   */
  public function __construct(Main $main, array $param, $data, string $fileTpl = 'default') {
    $this->main = $main ?? null;

    $this->pdfOrientation = $param['orientation'] ?? 'P';
    $this->docsType = $param['docType'] ?? 'pdf';
    $this->data = $data;

    $this->setFileTpl($fileTpl);
    $this->setDefaultParam();
    $this->getFileName();
    switch ($this->docsType) {
      case 'pdf':
        $this->prepareTemplate();
        $this->initPdf();
        break;
      case 'print':
        $this->prepareTemplate();
        $this->initPrint();
        break;
      case 'excel':
        $this->initExcel();
        $this->setExcelData();
        break;
    }
  }

  private function getFileName() {
    $file = str_replace($this->main->url->getScheme(), '', $this->main->url->getHost())
      . '_' . substr(uniqid(), 9, 4)
      . '_' . date('dmY');

    switch ($this->docsType) {
      case 'pdf': $file .= '.pdf'; break;
      case 'excel': $file .= '.xlsx'; break;
    }
    $this->filename = $file;
  }

  private function setFileTpl($fileTpl) {
    $this->fileTpl = $fileTpl !== 'default' ?
      $fileTpl : (in_array($this->docsType, ['pdf', 'print']) ? 'pdfTpl' : 'excelTpl');

    $path = "public/views/docs/$this->fileTpl.php";
    $fullPath = ($this->main->url->getPath(true) ?? ABS_SITE_PATH) . $path;

    if (file_exists($fullPath)) $this->filePath = $fullPath;
    else {
      $fullPath = $this->main->url->getBasePath(true) . $path;

      if (file_exists($fullPath)) $this->filePath = $fullPath;
      else $this->useDefault = true;
    }
  }

  private function setDefaultParam() {
    $this->pdfParam = [
      'debug'         => DEBUG,
      'format'        => 'A4',
      'margin_left'   => 10,
      'margin_top'    => 5,
      'margin_right'  => 10,
      'margin_bottom' => 5,
      'margin_header' => 0,
      'margin_footer' => 5,
      'orientation'   => $this->pdfOrientation,
    ];

    $this->imgPath = $this->main->getCmsParam(VC::URI_IMG);
    if ($this->main->isDealer()) {
      $this->dealImgPath = $this->main->getCmsParam(VC::DEAL_URI_IMG);
    }
  }

  private function prepareTemplate() {
    if ($this->useDefault) { $this->setPdfDefaultData(); return; }

    $this->setCss();
    $footerPage = '';

    ob_start();
    include $this->filePath;
    $this->content = ob_get_clean();

    $this->footerPage = $footerPage;
  }

  private function setExcelData() {
    if ($this->useDefault) $this->setExcelDefaultData();
    else include $this->filePath;
  }

  private function initPdf() {
    require_once CORE . 'libs/vendor/autoload.php';

    try {
      $this->docs = new Dompdf\Dompdf($this->pdfParam);

      $this->docs->setPaper('A4', $this->pdfParam['orientation'] === 'P' ? 'portrait' : 'landscape');

      //$this->docs->getOptions()->setDebugLayout(true);
      //$this->docs->getOptions()->setDebugLayoutBlocks(true);
      //$this->docs->getOptions()->setDebugPng(true);
      $this->docs->getOptions()->setIsRemoteEnabled(true);
      $this->docs->getOptions()->setIsPhpEnabled(true);

      $this->docs->loadHtml('<html><head><style>' . ($this->styleContent ?? '') . '</style></head><body>' . $this->content . '</body></html>');
    } catch (\Mpdf\MpdfException $e) {
      echo $e->getMessage();
    }
  }

  private function initPrint() {
    $this->content .= '<style>' . $this->styleContent . '</style>';
  }

  private function initExcel() {
    require_once __DIR__ . '/Xlsxwriter.php';
    $this->docs = new XLSXWriter();
  }

  /**
   * Add separate css to pdf
   */
  private function setCss() {
    $path = "public/views/docs/$this->fileTpl.css";
    $fullPath = ($this->main->url->getPath(true) ?? ABS_SITE_PATH) . $path;

    if (file_exists($fullPath)) {
      $this->styleContent = file_get_contents($fullPath);
    } else {
      $fullPath = $this->main->url->getBasePath(true) . $path;

      if (file_exists($fullPath)) {
        $this->styleContent = file_get_contents($fullPath);
      }
    }
  }

  /**
   * Return file as:
   * save|savePath - save on server in RESULT_PATH;<br>
   * saveUrl - save on server in RESULT_PATH and return HTTP link as string;<br>
   * saveWithUrl - save on server in RESULT_PATH and return HTTP link and filename as array;<br>
   * any other value send to browser
   * @param string $path
   * @param string $dest - "", "save|savePath", "saveUrl", "saveWithUrl"
   * @return array|string
   */
  private function getPdf(string $path, string $dest) {
    if (isset($_REQUEST['resource'])) {
      return [
        'css'  => $this->styleContent,
        'html' => $this->content,
      ];
    }

    $this->docs->render();

    foreach ($this->domFooter as $t) {
      $font = $this->docs->getFontMetrics()->getFont($t['font'], "normal");
      $this->docs->getCanvas()->page_text($t['x'], $t['y'], $t['text'], $font, $t['size'], $t['color'], $t['word_space'], $t['char_space'] ,$t['angle']);
    }

    switch ($dest) {
      default:
        if ($this->main->isSafari()) {
          header('file-name: ' . $this->filename);
          $this->docs->stream($this->filename, ["Attachment" => false]);
          exit();
        }

        return [
          'name'    => $this->filename,
          'pdfBody' => base64_encode($this->docs->output()),
        ];

      case 'save': case 'savePath':
        file_put_contents($path . $this->filename, $this->docs->output());

        return $path . $this->filename;

      case 'saveUrl':
        file_put_contents($path . $this->filename, $this->docs->output());

        return $this->main->url->getUri() . $this::RESULT_PATH . $this->filename;

      case 'saveWithUrl':
        file_put_contents($path . $this->filename, $this->docs->output());

        return [
          'name' => $this->filename,
          'url' => $this->main->url->getUri() . $this::RESULT_PATH . $this->filename
        ];
    }
  }

  /**
   * @param string $path
   * @param string $dest
   * @return array|string
   */
  private function getPrint(string $path, string $dest) {
    switch ($dest) {
      case 'save':
        file_put_contents($path . $this->filename, $this->content);
        return $path . $this->filename;
      case 'S':
      default:
        return [
          'name'      => $this->filename,
          'printBody' => $this->content,
        ];
    }
  }

  /**
   * @param string $path
   * @param string $dest
   * @return array|string
   */
  private function getExcel(string $path, string $dest) {
    switch ($dest) {
      case 'save':
        $this->docs->writeToFile($path . $this->filename);
        return $path . $this->filename;
      case 'S':
      default:
        return [
          'name'    => $this->filename,
          'excelBody' => base64_encode($this->docs->writeToString()),
        ];
    }
  }

  private function setPdfDefaultData() {
    $this->content = '
<style>
.class {
  padding: 0;
  margin: 0;
}
</style>
<div>
  <p>Use "$this->data" for all data</p>
  <p>Use "$this->data" for all data</p>
  <p>Use "$this->imgPath" for link to image</p>
  <p>Use $this->numFormat(\'1000\') for result "1 000"</p>
  
</div>';
  }

  /**
   * Example for Excel
   */
  private function setExcelDefaultData() {
    $data = [
      // Sheet - 1
      [
        'sheetName' => 'sheetName',
        'headerData' => ['header' => 'string', 'type' => 'string', 'comment' => 'string'],
        'headerStyle' => [['font-size' => 12]],
        'rows' => [
          ['c1-text', 'string', 'text'], ['c2-text', '@', 'text'],
          ['c3-integer', 'integer', ''], ['c4-integer', '0', ''], ['c5-price', 'price', ''],
          ['c6-price', '#,##0.00', 'custom'], ['c7-date', 'date', ''],
          ['c8-date', 'YYYY-MM-DD', ''],
        ],
      ]
    ];

    foreach($data as $sheet) {
      $sheetName = gTxt($sheet['sheetName']);

      if (count($sheet['header'] ?? [])) {
        $this->docs->writeSheetHeader($sheetName, $sheet['headerData'], $sheet['headerStyle']);
        //$this->docs->markMergedCell($sheetName, 0, 0, 0, 2);
      }

      foreach ($sheet['rows'] as $row) {
        $this->docs->writeSheetRow($sheetName, $row);
      }
    }
  }

  /**
   * Writes text at the specified x and y coordinates on every page.
   *
   * The strings '{PAGE_NUM}' and '{PAGE_COUNT}' are automatically replaced
   * with their current values.
   *
   * @param float  $x
   * @param float  $y
   * @param string $text       The text to write
   * @param string $font       The font file to use
   * @param float  $size       The font size, in points
   * @param array  $color      Color array in the format `[r, g, b, "alpha" => alpha]`
   *                           where r, g, b, and alpha are float values between 0 and 1
   * @param float  $word_space Word spacing adjustment
   * @param float  $char_space Char spacing adjustment
   * @param float  $angle      Angle to write the text at, measured clockwise starting from the x-axis
   * */
  public function setFooter(float $x, float $y, string $text, $font = 'Helvetica', $size = 16.0, $color = [0, 0, 0], $word_space = 0.0, $char_space = 0.0, $angle = 0.0) {
    $this->domFooter[] = [
      'x'     => $x,
      'y'     => $y,
      'text'  => $text,
      'font'  => $font,
      'size'  => $size,
      'color' => $color,
      'word_space' => $word_space,
      'char_space' => $char_space,
      'angle'      => $angle,
    ];
  }

  /**
   * Add bottom page counter
   * @param string $position
   * @param string $template -
   * @param float  $size       The font size, in points
   */
  public function addPageCounter($position = 'right', $template = '{PAGE_NUM} / {PAGE_COUNT}', $size = 12.0) {
    $isPortrait = $this->pdfOrientation === 'P';
    $getX = function ($x) use ($isPortrait) { return round($x / 100 * ($isPortrait ? 612 : 792)); };
    $getY = function ($y) use ($isPortrait) { return round($y / 100 * ($isPortrait ? 792 : 612)); };

    switch ($position) {
      default: case 'left':
        $x = $getX(3);  $y = $getY(90);
        break;
      case 'right':
        $x = $getX(97); $y = $getY(90);
        break;
    }

    $this->setFooter($x, $y, $template, 'DejaVu Sans', $size);
  }

  /**
   * @param string $dest
   * @return mixed
   */
  public function getDocs(string $dest = 'S') {
    $path = ($this->main->url->getPath(true) ?? ABS_SITE_PATH) . $this::RESULT_PATH;
    if (!is_dir($path)) mkdir($path);

    switch ($this->docsType) {
      default:
      case 'pdf': $result = $this->getPdf($path, $dest); break;
      case 'print': $result = $this->getPrint($path, $dest); break;
      case 'excel': $result = $this->getExcel($path, $dest); break;
    }

    $this->unlinkTmpFiles();
    return $result;
  }

  /**
   * @param        $number
   * @param int    $decimals
   * @param string $decimalSeparator
   * @param string $thousandsSeparator
   * @return string
   */
  public function numFormat($number, int $decimals = 0, string $decimalSeparator = '.', string $thousandsSeparator = ' '): string {
    return number_format(floatval($number), $decimals, $decimalSeparator, $thousandsSeparator);
  }

  /**
   * @param $path
   */
  public function setTmpFile($path) {
    $this->tmpFiles[] = $path;
  }

  /**
   * remove temporary files added during creation pdf
   */
  public function unlinkTmpFiles() {
    array_map(function ($path) {
      unlink($path);
    }, $this->tmpFiles);
  }
}
