<?php


class CmsParam
{
  /**
   * @var array
   */
  private $param = [];

  public function __construct() {}

  private function getIterator() {
    return new class {
      /**
       * @var int
       */
      private $id = 0;

      private $list = [];

      public function set($value) {
        $this->list[] = $value;
      }

      public function get() {
        $result = $this->list[$this->id];

        if (count($this->list) === $this->id + 1) $this->id = 0;
        else $this->id++;

        return $result;
      }
    };
  }

  public function __set($key, $value) {
    if (!isset($this->param[$key])) $this->param[$key] = $this->getIterator();

    $this->param[$key]->set($value);
  }

  public function __get($key) {
    return isset($this->param[$key]) ? $this->param[$key]->get() : null;
  }
}
