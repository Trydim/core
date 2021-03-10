<?php

namespace cms;

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {
  private $id, $login;
  private      $status;

  /**
   * @param $field
   * @return mixed
   */
  public function getLogin($field = 'login') {
    return $this->$field;
  }

  public function setLogin($session) {
    $this->login = $session['login'];
    $this->id = $session['priority'];
    $this->setLoginStatus('ok');
    return $this;
  }

  /**
   * @param $status
   *
   * @return bool
   */
  public function checkStatus($status) {
    return $this->status === $status;
  }

  public function getLoginStatus() {
    return $this->status;
  }

  public function setLoginStatus($status) {
    $this->status = $status;
    return $this;
  }

}

/**
 * Trait Page
 * @package cms
 */
trait Page {
  private $target;

  /**
   * @return mixed
   */
  public function getTarget() {
    return $this->target;
  }

  /**
   * @param mixed $get
   */
  public function setTarget($get) {
    $this->target = (isset($get['targetPage']) && $get['targetPage'] !== '') ?
      str_replace('/', '', $get['targetPage']) : HOME_PAGE;
  }
}

/**
 * Trait dictionary
 * @package cms
 */
trait Dictionary {
  public function initDictionary() {
    include ABS_SITE_PATH . 'lang/dictionary.php';
    $mess = isset($mess) ? json_encode($mess) : false;
    return $mess ? "<input type='hidden' id='dictionaryData' value='$mess'>" : '';
  }
}

/**
 * Trait dictionary
 * @package cms
 */
trait Hooks {
  private $hooks = [];

  public function addAction($hookName, $callable) {
    if (!is_string($hookName) || !is_callable($callable)) return;

    $this->hooks[$hookName] = $callable;
  }

  public function execAction($hookName, ...$args) {
    if ($this->exist($hookName)) {
      $func = $this->hooks[$hookName];

      if (!isset($args) || !is_array($args)) {
        $args = [];
      }

      if (isset($func)) {
        return $func(...$args);
      }
    }
    return false;
  }

  public function exist($hookName) {
    return isset($this->hooks[$hookName]);
  }
}

final class Main {
  use Authorization;
  use Dictionary;
  use Hooks;

  public function __construct() {
  }
}

$main = new Main();
