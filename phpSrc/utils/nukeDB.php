<?php

require $_SERVER['DOCUMENT_ROOT'] . '/config.php';

if ((isset($_GET['confirm']) || isset($_GET['destroy'])) && isset($dbConfig)) {
  require '../php/libs/rb.php'; // LIBS redbean

  $fileSql = array_values(array_filter(scandir($_SERVER['DOCUMENT_ROOT']), function ($file) {
    return strpos($file, '.sql');
  }));

  R::setup('mysql:host=' . $dbConfig['dbHost'] . ';dbname=' . $dbConfig['dbName'], $dbConfig['dbUsername'], $dbConfig['dbPass']);
  R::fancyDebug(true);

  if (!R::testConnection()) exit ('Не удалось подлючиться к базе данных');

  if (isset($_GET['destroy'])) {
    R::nuke(); // УНИЧТОЖИТЬ ВСЁ. ОСТОРОЖНО

  } else {
    if (count($fileSql)) $fileSql = $fileSql[0];
    else exit('dump базы не найден');

    R::nuke(); // УНИЧТОЖИТЬ ВСЁ. ОСТОРОЖНО

    $op_data = '';
    $lines = file($_SERVER['DOCUMENT_ROOT'] . '/' . $fileSql);

    foreach ($lines as $line) {
      if (substr($line, 0, 2) == '--' || $line == '') continue;// This IF Remove Comment Inside SQL FILE

      $op_data .= $line;
      if (substr(trim($line), -1, 1) == ';') { // Break Line Upto ';' NEW QUERY
        R::exec($op_data);                     //$conn->query($op_data);
        $op_data = '';
      }
    }

    die('<h2 style="color: red">Выполнено!</h2>');
  }
}
?>
<h2>Внимание! База <?= $dbConfig['dbName'] ?> будет уничтожена и импортировано из файла, все изменения потеряны.</h2>
<p>файл *.sql должен лежать в корне сайта</p>
<h3>Создать новую БД из файла?</h3>
<a href="nukeDB.php?destroy=true">Стереть БД</a>
<a href="nukeDB.php?confirm=true">Подтвердить</a>
