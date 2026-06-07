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

  private Main $main;
  private mixed $propSetting;

  public function __construct(Main $main) {
    $this->main = $main;
    $this->propSetting = $main->getSettings(VC::DEALER_PROPERTIES);
  }

  private function getPropertyName($prop): string {
    return str_replace('prop_', '', $prop);
  }

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
