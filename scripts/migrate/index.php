<?php

global $main;
require __DIR__ . '/DealerMigrator.php';

$managersId = null;
$dealerId = null;
$excludeManagerIds = [1, 7];

// 1. Обработка excludeManagerIds
if (!isset($_GET['excludeManagerIds']) || !preg_match('/^[\d,]+$/', $_GET['excludeManagerIds']) ) {
  echo '<b>notice</b>: excludeManagerIds не указаны, будут использованы [1, 7]<br>';
} else {
  $excludeManagerIds = explode(',', $_GET['excludeManagerIds']);
  $excludeManagerIds = array_map('intval', $excludeManagerIds);
  $excludeManagerIds = array_filter($excludeManagerIds);

  echo "<b>notice</b>: excludeManagerIds: " . implode(', ', $excludeManagerIds) . "<br>";
}


// 2. Обработка dealerId
if (isset($_GET['dealerId']) && preg_match('/^\d+$/', $_GET['dealerId']) ) {
  $dealerId = (int)$_GET['dealerId'];
} else {
  echo "<b>error</b>: не указан дилер <br>";
}

// 3. Обработка managersId
if ($dealerId && isset($_GET['managersId']) && preg_match('/^[\d,]+$/', $_GET['managersId']) ) {
  $managersId = explode(',', $_GET['managersId']);
  $managersId = array_map('intval', $managersId);
  $managersId = array_filter($managersId);

  if (empty($managersId)) {
    $managersId = null;
    echo '<b>warning</b>: Некорректные managerIds<br>';
  } else {
    echo "<b>info</b> Стартуем миграцию, менеджеры: " . implode(', ', $managersId) . " в дилера ID = {$dealerId}<br>";
  }
} elseif (isset($_GET['allManagers'])) {
  $managersId = [];
  echo '<b>info</b>Мигрируем всех менджеров<br>';
}


// 4. Запуск миграции (если указаны managersId или dealerId)
if ($managersId !== null && $dealerId !== null) {
  try {
    $migrator = new DealerMigrator($main, 26, $managersId, $excludeManagerIds);
    $result = $migrator->migrate();
    echo $result . "<br>";
  } catch (Exception $e) {
    echo "<b>error</b>: " . $e->getMessage() . '<br>';
    if (isset($migrator)) {
      echo $migrator->getResultMessage();
    }
  }
} else {
  echo '<b>error</b>: Не указаны managersId или dealerId<br>';
}