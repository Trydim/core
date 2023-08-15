<?php

/* Папка для временных файлов */
  const RESULT_PATH = 'shared/';
!defined('PATH_IMG') && define('PATH_IMG', $_SERVER['DOCUMENT_ROOT'] . '/images/');

class Docs {
  const PATH_IMG = ABS_SITE_PATH . 'images/';
  /**
   * Папка для временных файлов
   */
  const RESULT_PATH = 'shared/';

  /**
   * What library use
   *
   * @var string [dompdf/mpdf/html2pdf]
   */
  private $pdfLibrary;

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
  private $docsType, $fileTpl, $filePath, $content, $styleContent, $footerPage = '', $imgPath, $dealImgPath, $fileName;

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
   * Docs constructor.
   * @param Main $main
   * @param array $param {library: string, orientation: string, docType: string}
   * @param $data
   * @param string $fileTpl
   */
  public function __construct(Main $main, array $param, $data, string $fileTpl = 'default') {
    $this->main = $main ?? null;

    $this->pdfLibrary = $param['library'] ?? 'dompdf';
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
        $this->pdfLibrary = 'print';
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
    $this->fileName = $file;
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

    switch ($this->pdfLibrary) {
      case 'dompdf':
        try {
          $this->docs = new Dompdf\Dompdf($this->pdfParam);

          $this->docs->setPaper('A4', $this->pdfParam['orientation'] === 'P' ? 'portrait' : 'landscape');

          //$this->docs->getOptions()->setDebugLayout(true);
          //$this->docs->getOptions()->setDebugPng(true);
          $this->docs->getOptions()->setIsRemoteEnabled(true);
          $this->docs->getOptions()->setIsPhpEnabled(true);

          $this->docs->loadHtml('<style>' . ($this->styleContent ?? '') . '</style>' . $this->content);
        } catch (\Mpdf\MpdfException $e) {
          echo $e->getMessage();
        }
        break;
      case 'mpdf':
        try {
          $this->docs = new Mpdf\Mpdf($this->pdfParam);
          //$this->docs->charset_in = 'cp1252';
          //$this->pdf->useOnlyCoreFonts = true;
          //$this->pdf->SetDisplayMode('fullpage');

          $this->docs->WriteHTML($this->styleContent, \Mpdf\HTMLParserMode::HEADER_CSS);

          //$this->pdf->SetHTMLHeader('');
          $this->docs->SetHTMLFooter($this->footerPage);

          $this->docs->WriteHTML($this->content, \Mpdf\HTMLParserMode::HTML_BODY);
        } catch (\Mpdf\MpdfException $e) {
          echo $e->getMessage();
        }
        break;
      case 'html2pdf':
        try {
          $format = $this->pdfParam['format'];
          $param = [
            $this->pdfParam['margin_left'],
            $this->pdfParam['margin_top'],
            $this->pdfParam['margin_right'],
            $this->pdfParam['margin_bottom'],
          ];
          $this->docs = new Spipu\Html2Pdf\Html2Pdf($this->pdfOrientation, $format, 'ru', true, 'UTF-8', $param);

          DEBUG && $this->docs->setModeDebug();
          $this->docs->setDefaultFont('freesans');

          $this->docs->writeHTML('<style>' . $this->styleContent . '</style>');
          $this->docs->writeHTML($this->content);

        } catch (Spipu\Html2Pdf\Exception\Html2PdfException $e) {
          $this->docs->clean();
          $formatter = new Spipu\Html2Pdf\Exception\ExceptionFormatter($e);
          echo $formatter->getHtmlMessage();
        }
        break;
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
      $this->styleContent = file_get_contents($path);
    } else {
      $fullPath = $this->main->url->getBasePath(true) . $path;

      if (file_exists($fullPath)) {
        $this->styleContent = file_get_contents($path);
      }
    }
  }

  private function getFunc() {
    switch ($this->docsType) {
      case 'pdf': return 'Pdf';
      case 'print': return 'Print';
      case 'excel': return 'Excel';
    }
    return false;
  }

  /**
   * Return file as:
   * save - save on server in RESULT_PATH, any other value send to browser
   * I - inline, D - DOWNLOAD, F - save local file, S - string
   * @param string $path
   * @param string $dest
   * @return array|false|string
   */
  private function getPdf(string $path, string $dest) {
    if (isset($_REQUEST['resource'])) {
      return [
        'css'  => $this->styleContent,
        'html' => $this->content,
      ];
    }

    switch ($this->pdfLibrary) {
      case 'dompdf':
        $this->docs->render();

        if ($dest === 'save') {
          file_put_contents($path . $this->fileName, $this->docs->output());
          return $path . $this->fileName;
        } else {
          if ($this->main->isSafari()) {
            $this->docs->stream($this->fileName, ["Attachment" => false]);
            exit();
          }

          return [
            'name'    => $this->fileName,
            'pdfBody' => base64_encode($this->docs->output()),
          ];
        }
      case 'mpdf':
      /** Default: \Mpdf\Output\Destination::INLINE
       *        Values:
       *  \Mpdf\Output\Destination::INLINE, or "I"
       *  send the file inline to the browser. The plug-in is used if available. The name given by $filename is used when one selects the “Save as” option on the link generating the PDF.
       *  \Mpdf\Output\Destination::DOWNLOAD, or "D"
       *  send to the browser and force a file download with the name given by $filename.
       *  \Mpdf\Output\Destination::FILE, or "F"
       *  save to a local file with the name given by $filename (may include a path).
       *  \Mpdf\Output\Destination::STRING_RETURN, or "S"
       *  return the document as a string. $filename is ignored.
       */
        if ($dest === 'save') {
          $this->docs->Output($path . $this->fileName, 'F');
          return $path . $this->fileName;
        } else {
          return [
            'name'    => $this->fileName,
            'pdfBody' => base64_encode($this->docs->Output('', 'S')),
          ];
        }
      case 'html2pdf':
      /** Destination where to send the document. It can take one of the following values:
       * I: send the file inline to the browser (default). The plug-in is used if available. The name given by name is used when one selects the "Save as" option on the link generating the PDF.
       * D: send to the browser and force a file download with the name given by name.
       * F: save to a local server file with the name given by name.
       * S: return the document as a string (name is ignored).
       * FI: equivalent to F + I option
       * FD: equivalent to F + D option
       * E: return the document as base64 mime multi-part email attachment (RFC 2045)
       */
        if ($dest === 'save') {
          $this->docs->output($path . $this->fileName, 'F');
          return $path . $this->fileName;
        } else {
          return [
            'name'    => $this->fileName,
            'pdfBody' => base64_encode($this->docs->Output('', 'S')),
          ];
        }
    }
    return false;
  }

  /**
   * @param string $path
   * @param string $dest
   * @return array|string
   */
  private function getPrint(string $path, string $dest) {
    switch ($dest) {
      case 'save':
        file_put_contents($path . $this->fileName, $this->content);
        return $path . $this->fileName;
      case 'S':
      default:
        return [
          'name'      => $this->fileName,
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
        $this->docs->writeToFile($path . $this->fileName);
        return $path . $this->fileName;
      case 'S':
      default:
        return [
          'name'    => $this->fileName,
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
   * @param string $dest
   * @return mixed
   */
  public function getDocs(string $dest = 'S') {
    $path = ($this->main->url->getPath(true) ?? ABS_SITE_PATH) . $this::RESULT_PATH;
    if (!is_dir($path)) mkdir($path);

    $func = 'get' . $this->getFunc();
    $result = $this->$func($path, $dest);

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
