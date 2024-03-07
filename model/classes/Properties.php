<?php

class Properties {
  /**
   * @var Main
   */
  private $main;
  private $propSetting;

  //private $data = []; Хранить всю таблицу свойства

  public function __construct(Main $main, $table = 'option') {
    $this->main = $main;
    $this->propSetting = $main->getSettings($this->getSettingField($table));
  }

  /**
   * @param string $table - option/dealer
   */
  private function getSettingField(string $table): string {
    switch ($table) {
      default: case 'option': return VC::OPTION_PROPERTIES;
      case 'dealer': return VC::DEALER_PROPERTIES;
    }
  }
  private function getPropertyName($prop) {
    return str_replace('prop_', '', $prop);
  }

  /**
   * @param $prop
   * @param $value
   * @return array
   */
  public function getValue($prop, $value): array {
    $propParam = $this->propSetting[$prop] ?? null;
    $propType = $propParam['type'] ?? '';
    $haveValue = boolValue($value);

    if ($propParam === null) {
      $value = 'Property error';
    } else if ($haveValue && includes($propType, 'select')) {
      if (!is_array($value)) $value = [$value];
      $value = $this->main->db->loadPropertyTable($prop, $value);
    } else if ($haveValue && $propType === 'table') {
      $res = [];

      if (is_array($value)) {
        foreach ($value as $row) {
          $res[] = array_combine($propParam['columns'], $row);
        }
      }

      $value = $res;
    }

    return [$this->getPropertyName($prop), $value];
  }
}
