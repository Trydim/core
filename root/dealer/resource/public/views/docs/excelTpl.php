<?php
$listData = $this->data['report'] ?? false;
!$listData && $listData = $this->data['rBack']['report'];

$rows = [];
foreach ($listData['base'] as $item) {
  if (!isset($item['code']) || strlen($item['code']) < 1) continue;
  $rows[] = [$item['code'], $item['count']];
}
