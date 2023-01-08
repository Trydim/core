<?php

class Properties {
  /**
   * @var Main
   */
  private $main;
  private $propSetting;

  private $data = [];

  public function __construct(Main $main, $table = 'option') {
    $this->main = $main;
    $this->propSetting = $main->getSettings($this->getSettingField($table));
  }

  /**
   * @param string $table - option/dealer
   */
  private function getSettingField($table) {
    switch ($table) {
      default: case 'option': return VC::OPTION_PROPERTIES;
      case 'dealer': return VC::DEALER_PROPERTIES;
    }
  }
  private function getPropertyName($prop) {
    return str_replace('prop_', '', $prop);
  }

  private function setPropertyTable($prop) {
    $propParam = $this->propSetting[$prop] ?? null;
    $name = $this->getPropertyName($prop);

    if ($propParam === null) {
      $list = 'Property table error';
    } else if ($propParam['type'] === 'select') {
      $simple = false;
      $list = $this->main->db->loadTable($prop);
      $list = array_reduce($list, function ($r, $row) { $r[$row['ID']] = $row; return $r; }, []);
    } else {
      $simple = true;
    }

    $this->data[$prop] = [
      'name' => $name,
      'simple' => $simple ?? null,
      'list' => $list ?? null,
    ];
  }

  /**
   * @param $prop
   * @param $value
   * @return array
   */
  public function getValue($prop, $value): array {
    if (!isset($this->data[$prop])) $this->setPropertyTable($prop);

    if ($this->data[$prop]['simple'] === false) {
      $value = $this->data[$prop]['list'][$value] ?? ('select error value: ' . $value);
    }

    return [$this->data[$prop]['name'], $value];
  }
}
