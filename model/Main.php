<?php

namespace cms;

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {
	private $login;
	private $status;

	/**
	 * @return mixed
	 */
	public function getLogin() {
		return $this->login;
	}

	public function setLogin($session) {
		$this->login = $session['login'];
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
  private $target;

  /**
   * @return mixed
   */
  public function getTarget() {
    return $this->target;
  }

  /**
   * @param $arr
   */
  public function setDictionary($arr) {
    $this->target = $arr;
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
  }

  public function exist($hookName) {
    return isset($this->hooks[$hookName]);
  }
}

final class Main {
	use Authorization;
	use Hooks;

	public function __construct() {
	}
}

$main = new Main();
