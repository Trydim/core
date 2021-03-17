<?php

namespace cms;

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {
  private $id, $login, $name;
  private $status = 'no';
  private $permission = [], $sideMenu = [];

  /**
   * @param $field
   * @return mixed
   */
  public function getLogin($field = 'login') {
    return $this->$field;
  }

  public function setLogin($session) {
    $this->login = $session['login'];
    $this->name  = $session['name'];
    $this->id    = $session['priority'];
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

  public function setPermission($permission) {
    isset($permission['menuAccess']) && $permission['menuAccess'] = explode(',', $permission['menuAccess']);
    count($permission) && $this->permission = $permission;
  }

  /**
   * @param string $key
   * @return array
   */
  public function getPermission($key = '') {
    if (isset($this->permission[$key])) return $this->permission[$key];
    if ($key) return ACCESS_MENU;
    return $this->permission;
  }

  public function setSideMenu() {
    $this->sideMenu = isset($this->permission['menuAccess'])
      ? $this->permission['menuAccess']
      : ACCESS_MENU;

    //if (!in_array('setting', $this->sideMenu)) $this->sideMenu[] = 'setting';
  }

  public function getSideMenu() {
    return $this->sideMenu;
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
  private function includeFromSetting() {
    if (isset($this->setting['managerSetting'])) {
      $list = $this->setting['managerSetting'];
      return array_reduce(array_keys($list), function ($r, $k) use ($list) {
        $r[$k] = $list[$k]['name'];
        return $r;
      }, []);
    }
  }

  public function initDictionary() {
    $mess = [];
    include ABS_SITE_PATH . 'lang/dictionary.php';
    $mess = array_merge($mess, $this->includeFromSetting());
    $mess = json_encode($mess);
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

  private $setting = [];

  private function loadSetting() {
    $this->setting = getSettingFile();
  }

  public function getSettings($key) {
    if ($key === 'json') return json_encode($this->setting);
    if (isset($this->setting[$key])) return $this->setting[$key];
    return false;
  }

  public function __construct() {
    $this->loadSetting();
  }
}

$main = new Main();
