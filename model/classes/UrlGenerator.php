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

  private $host;

  /**
   * @var
   */
  private $coreUri;

  /**
   * @var
   */
  private $fullUri;

  /**
   * UrlGenerator constructor.
   * @param string $corePath
   */
  public function __construct(string $corePath) {
    $this->absolutePath = str_replace('\\', '/', ABS_SITE_PATH);
    $this->corePath = str_replace('\\', '/', $corePath);

    $this->setSitePath();
    $this->setScheme();
    $this->setHost();
    $this->setCoreUri();
    $this->setFullUri();
  }

  private function setSitePath() {
    $sitePath = str_replace($_SERVER['DOCUMENT_ROOT'], '/', $this->absolutePath);

    $this->sitePath = str_replace('//', '/', $sitePath);
  }

  private function setScheme() {
    $this->scheme = ($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://';
  }

  private function setHost() {
    $this->host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'];
  }

  private function setCoreUri() {
    $sitePath = trim(str_replace('/', ' ', $this->sitePath));
    $siteLevel = count(explode(' ', $sitePath));
    //$corePath = trim(str_replace($_SERVER['DOCUMENT_ROOT'] . '/', ' ', $this->corePath));
    //$coreLevel = count(explode(' ', $corePath));

    $coreUri = str_repeat('../', $siteLevel) . 'core/';
    $this->coreUri = $this->scheme . $this->host . $this->getSitePath() . $coreUri;
  }

  private function setFullUri() {
    $this->fullUri = $this->scheme . $this->host . $this->getSitePath();
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
    return $this->corePath . '/';
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
  public function getUri() {
    return $this->fullUri;
  }
}
