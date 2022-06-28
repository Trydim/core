<?php

class UrlGenerator {

  /**
   * absolute path set in index.php
   * @var string
   */
  private $absolutePath;

  /**
   * relative path from "Document Root"
   * @var string
   */
  private $sitePath;

  /**
   * absolute core path
   * @var string
   */
  private $corePath;

  /**
   * http or https
   * @var string
   */
  private $scheme;

  /**
   * @var string
   */
  private $host;

  /**
   * @var string
   */
  private $method;

  /**
   * @var string
   */
  private $coreUri;

  /**
   * @var string
   */
  private $fullUri;

  /**
   * @var string
   */
  private $dealerUri;

  /**
   * UrlGenerator constructor.
   * @param string $corePath
   */
  public function __construct(string $corePath) {
    $this->absolutePath = str_replace('\\', '/', ABS_SITE_PATH);
    $this->corePath = str_replace('\\', '/', $corePath);
    $this->method = $_SERVER['REQUEST_METHOD'];

    $this->setSitePath();
    $this->setScheme();
    $this->setHost();
    $this->setFullUri();
    $this->setCoreUri();
    $this->setDealerUri();
  }

  private function setSitePath() {
    $sitePath = str_replace($_SERVER['DOCUMENT_ROOT'], '/', $this->absolutePath);

    $this->sitePath = str_replace('//', '/', $sitePath);
  }

  private function setScheme() {
    $https = $_SERVER['HTTPS'] ?? false;
    $this->scheme = ($https ? 'https' : 'http') . '://';
  }

  private function setHost() {
    $this->host = $this->scheme . $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'];
  }

  private function setFullUri() {
    $this->fullUri = $this->getHost() . $this->getSitePath();
  }

  private function setCoreUri() {
    // Определять автоматом.
    /*$sitePath = trim(str_replace('/', ' ', $this->sitePath));
    $siteLevel = count(explode(' ', $sitePath));
    //$corePath = trim(str_replace($_SERVER['DOCUMENT_ROOT'] . '/', ' ', $this->corePath));
    //$coreLevel = count(explode(' ', $corePath));*/
    //$coreUri = str_repeat('../', $siteLevel) . 'core/';

    $this->coreUri = $this->getFullUri() . $this->corePath;
  }

  private function setDealerUri() {
    global $main;

    if ($main->isDealer()) {
      $this->dealerUri = $this->getFullUri() . $main->getCmsParam('dealerPath');
    }
  }

  /**
   * @return string
   */
  public function getSitePath() {
    return $this->sitePath;
  }

  /**
   * @return string
   */
  public function getCorePath() {
    return $this->corePath;
  }

  /**
   * @return string
   */
  public function getCoreUri() {
    return $this->coreUri;
  }

  /**
   * @return string
   */
  public function getHost() {
    return $this->host;
  }

  /**
   * @return string
   */
  public function getFullUri() {
    return $this->fullUri;
  }

  public function getDealerUri() {
    return $this->dealerUri;
  }
}
