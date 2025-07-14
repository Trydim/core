<?php

class Properties {

  /**
   * Настройки для дилеров, которые под особым управлением, пока только языки
   *
   * Пока так
   */
  const PROP_CMS_SETTINGS = [
    'prop_locales' => ['table' => 'locales', 'type' => 'multiselect'],
  ];
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

  /**
   * @param $prop
   * @return string
   */
  private function getPropertyName($prop): string {
    return str_replace('prop_', '', $prop);
  }

  /**
   * @param $prop
   * @param $value
   * @return array
   */
  public function getValue($prop, $value): array {
    $cmsParam  = $this::PROP_CMS_SETTINGS[$prop] ?? null;
    $propParam = $cmsParam ?: $this->propSetting[$prop] ?? null;
    $propType = $propParam['type'] ?? '';
    $haveValue = boolValue($value);

    if ($cmsParam === null && $propParam === null) {
      $value = 'Property error';
    } else if ($cmsParam && $haveValue && includes($propType, 'select')) {
      if (!is_array($value)) $value = [$value];
      // TODO дважды в БД лезем
      $value = $this->main->db->loadPropertyTable($cmsParam['table'], $value);
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
