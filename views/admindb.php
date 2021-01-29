<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

if (!DB_TABLE_IN_SIDEMENU) { // Если таблицы не в подменю
  $field['sideRight'] = <<<sideRight
<ul id="DBTablesWrap"></ul>
<div>
  <h2></h2>
  <input type="button" value="Показать" id="btnRowsAdd" data-dbaction="showTable">
  <input type="button" value="Скачать CSV" id="btnLoadCSV" data-dbaction="loadCVS" class="fade">
  <input type="button" value="Удалить" id="btnRowsDel" data-dbaction="showDelete">
</div>
sideRight;
}

$field['content'] = <<<main
<div class="text-center">
  <h2 id="tableNameField"></h2>
</div>
<div class="d-flex">
  <div id="btnField" class="fade">
    <input type="button" class="btn btn-primary" value="Добавить" id="btnAddMore">
    <input type="button" class="btn btn-primary" value="Сохранить" id="btnSave" disabled>
  </div>
</div>
<div id="insertToDB"></div>
main;

$field['footerContent'] = <<<temp
<template id="tablesListTmp">
  <li><label><input type="radio" name="tablesList" value="\${name}">\${name}</label></li>
</template>
<template id="columnsList">
  <table id="tableTempName">
    <thead>
    <tr id="columnName">
      <th class="text-center">\${columnName} - \${type} (\${key}\${null})</th>
    </tr>
    </thead>
    <tbody id="columnValue">
    <tr>
      <td><input type="text" name="col_\${columnName}[]" data-column="\${columnName}" value="\${\${columnName}}"></td>
    </tr>
    </tbody>
  </table>
</template>
<template id="tablesCsv">
  <table>
    <tbody id="columnValue">
    <tr>
      <td><input type="text" value=""></td>
    </tr>
    </tbody>
  </table>
</template>
<template id="emptyTable">
  <p>Таблица пустая</p>
</template>
<template id="btnRow">
  <input type="button" class="btnDel" value="X">
</template>
<template id="btnDelCancel">
  <input type="button" value="Отменить" class="">
</template>
temp;

$field['footerContent'] .= $main->initDictionary();
