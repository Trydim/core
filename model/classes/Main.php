<?php

namespace cms;

/**
 * Trait Authorization
 * @package cms
 */
trait Authorization {
  private $id, $login, $name;
  private $status = 'no';
  private $sideMenu = [];
  private $admin = true;

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
    $this->setHash($session);
    return $this;
  }

  public function setHash($session) {

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

  public function setSideMenu() {
    if (USE_DATABASE) {
      $menuAccess = isset($this->getSettings('permission')['menuAccess'])
        ? $this->getSettings('permission')['menuAccess']
        : false;

      $menuAccess = $menuAccess ? explode(',', $menuAccess) : [];
      $this->sideMenu = count($menuAccess) ? $menuAccess : ACCESS_MENU;
    } else {
      $filterMenu = ['orders', 'calendar', 'customers', 'users', 'statistic', 'catalog'];
      $this->sideMenu = array_filter($this->sideMenu, function ($m) use ($filterMenu) {
        return !in_array($m, $filterMenu);
      });
    }
    PUBLIC_PAGE && $this->sideMenu = array_merge([PUBLIC_PAGE], $this->sideMenu);
  }

  public function getSideMenu($first = false) {
    if ($first) return array_values($this->sideMenu)[0];
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
    return [];
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

  public function setSettings($key, $value) {
    $this->setting[$key] = $value;
  }

  /**
   * Get one setting or array if have
   * @param $key
   * @return false|mixed|string
   */
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
