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
			str_replace('/', '', $get['targetPage']) : 'home';
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

class Main {
	use Authorization;

	public function __construct() {
	}
}