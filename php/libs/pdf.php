<?php if ( !defined('PDF_LIBRARY')) define('PDF_PDF_LIBRARY', 'mpdf');

/* Папка  для временных файлов */
define('RESULT_PATH', '/temp/');

class Pdf {

	//private const RESULT_PATH = '/temp/';

	// Create name for new pdf file (Work only if DESTINATION=save)
  // if position = 0, then will use not
	private $PDF_NAME = [
		'name'      => [
			'position' => 0,
			'value'    => ''
		],
		'unique'    => [
			'position'    => 1,
			'countSymbol' => 5,
		],
		'date'      => [
			'position' => 3,
			'format'   => 'dmY', // 'd.m.y' = '31.12.20' / 'Ymd' = '20010310' / 'H:i:s' = '23:59:59'
		],
		'extension' => '.pdf',
	];

	private $pdfTpl = 'pdfTpl'; // Шаблон pdf по умолчанию
	private $data = []; // Отчет глобальный для вставки в шаблон
	private $content;
	private $pdfParam; // Param
	private $pdf;
	private $pdfName;

	private function getFileName() {
		$arr = $this->PDF_NAME;
		$file = '';
		for($i = 1 ; $i < 4; $i++) {
			if($arr['name']['position'] === $i) $file .= $arr['name']['value'];
			if($arr['unique']['position'] === $i) $file .= substr(uniqid(), 0, $arr['unique']['countSymbol']);
			if($arr['date']['position'] === $i) $file .= date($arr['date']['format']);
		}
		if(isset($arr['extension'])) $file .= $arr['extension'];
		else $file .= '.pdf';
		$this->pdfName = $file;
	}

	private function setDefaultParam () {
		$this->pdfParam = [
			'format'       => 'A4',
			'margin_left'   => 10,
			'margin_top'    => 10,
			'margin_right'  => 5,
			'margin_bottom' => 5,
			'margin_header' => 0,
			'margin_footer' => 5,
		];

		$this->imgPath = ABS_SITE_PATH . PATH_IMG; // Public img
	}

	private function prepareTemplate() {
		//extract($this->data);
		ob_start();

    if (file_exists(ABS_SITE_PATH . "public/views/docs/$this->pdfTpl.php")) {
      include(ABS_SITE_PATH . "public/views/docs/$this->pdfTpl.php");
    } else if (file_exists(CORE . "views/docs/$this->pdfTpl.php")) {
      include(CORE . "views/docs/$this->pdfTpl.php");
    }

		$this->content = ob_get_clean();
	}

	private function initPDF() {
		require_once __DIR__ . '/vendor/autoload.php';

		switch (PDF_LIBRARY) {
			case 'mpdf':
				try {
					$this->pdf = new Mpdf\Mpdf($this->pdfParam);
					//$mpdf->useOnlyCoreFonts = true;
					//$mpdf->SetDisplayMode('fullpage');

					$this->setCss();

					//$mpdf->SetHTMLHeader('');
					//$mpdf->SetHTMLFooter('<div class="footerPage"><b>{PAGENO} из {nbpg} стр.</b></div>');

					
					$this->pdf->WriteHTML($this->content, \Mpdf\HTMLParserMode::HTML_BODY);
				}	catch (\Mpdf\MpdfException $e) {
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
					$this->pdf = new Spipu\Html2Pdf\Html2Pdf('P', $format, 'ru', true, 'UTF-8', $param);

					//$this->pdf->pdf->SetDisplayMode('fullpage');
					$this->pdf->setDefaultFont('freesans');

					$this->pdf->writeHTML($this->content);
				} catch (Spipu\Html2Pdf\Exception\Html2PdfException $e) {
					$this->pdf->clean();
					$formatter = new Spipu\Html2Pdf\Exception\ExceptionFormatter($e);
					$errorMsg  = $formatter->getHtmlMessage();
				}
				break;
		}
	}

	private function setCss() {
		$cssPath = ABS_SITE_PATH . '/views/docs/' . $this->pdfTpl . '.css';
		if(file_exists($cssPath)) {
			$stylesheet = file_get_contents($cssPath);
			$this->pdf->WriteHTML($stylesheet,\Mpdf\HTMLParserMode::HEADER_CSS);
		}
	}

	public function __construct($data, $pdfTpl = 'pdfTpl') {
		$this->pdfTpl = $pdfTpl;
		$this->data = $data;

		$this->setDefaultParam();
		$this->getFileName();
		$this->prepareTemplate();
		$this->initPDF();
	}

	/**
	 *
	 * What do with pdf file:
	 * save - save on server in RESULT_PATH, any other value send to browser
	 * I - inline, D - DOWNLOAD, F - save local file, S - string
	 * @param string $dest
	 *
	 * @return mixed
	 */
	public function getPdf($dest = 'S') {
		$path = str_replace('//', '/', $_SERVER['DOCUMENT_ROOT'] . SITE_PATH . RESULT_PATH);
		if(!is_dir($path)) mkdir($path);

		switch (PDF_LIBRARY) {
			case 'mpdf':
				/** Default: \Mpdf\Output\Destination::INLINE
				 * 				Values:
				 * 	\Mpdf\Output\Destination::INLINE, or "I"
				 * 	send the file inline to the browser. The plug-in is used if available. The name given by $filename is used when one selects the “Save as” option on the link generating the PDF.
				 * 	\Mpdf\Output\Destination::DOWNLOAD, or "D"
				 * 	send to the browser and force a file download with the name given by $filename.
				 * 	\Mpdf\Output\Destination::FILE, or "F"
				 * 	save to a local file with the name given by $filename (may include a path).
				 * 	\Mpdf\Output\Destination::STRING_RETURN, or "S"
				 * 	return the document as a string. $filename is ignored.
				 */
				if($dest === 'save') {
					$this->pdf->Output($path . $this->pdfName, 'F');
					return $path . $this->pdfName;
				} else {
					return [
						'name' => $this->pdfName,
						'pdfBody' => base64_encode($this->pdf->Output('', 'S')),
					];
				}
				break;
			case 'html2pdf':
				/** Destination where to send the document. It can take one of the following values:
				 * I: send the file inline to the browser (default). The plug-in is used if available. The name given by name is used when one selects the "Save as" option on the link generating the PDF.
				 * D: send to the browser and force a file download with the name given by name.
				 * F: save to a local server file with the name given by name.
				 * S: return the document as a string (name is ignored).
				 * FI: equivalent to F + I option
				 * FD: equivalent to F + D option
				 * E: return the document as base64 mime multi-part email attachment (RFC 2045)
				 * */
				if($dest === 'save') {
					$this->pdf->output($path . $this->pdfName);
					return $path . $this->pdfName;
				} else {
					return [
						'name' => $this->pdfName,
						'pdfBody' => base64_encode($this->pdf->Output('', 'S')),
					];
				}
				break;
		}
	}

  /**
   * @param $total
   * @param string $spacer
   * @param int $precision
   *
   * @return string|string[]|null
   */
  public function setNumFormat($total, $spacer = ' ', $precision = 2) {
    is_numeric($total) && $total = round(floatval($total), $precision);
    return preg_replace('/\B(?=(\d{3})+(?!\d))/', $spacer, $total);
  }
}
