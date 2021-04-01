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
<div class="d-flex pb-4" style="justify-content: left">
  <div>
    <label title="Удобный для редактирования">
      <input type="radio" name="adminType" value="form" data-action="adminType">
      Режим форм</label>
  </div>
  <div class="ml-1">
    <label title="Редактирования в режиме таблицы">
      <input type="radio" name="adminType" value="table" checked data-action="adminType">
      Режим таблицы</label>
  </div>
  <div class="ml-1">
    <label title="Настройка режима форм">
      <input type="radio" name="adminType" value="config" data-action="adminType">
      Настройка формы (Для опытных)</label>
  </div>
</div>
<div class="d-flex justify-center">
  <div id="btnField">
    <input type="button" class="btn btn-primary d-none" value="Добавить" id="btnAddMore">
    <input type="button" class="btn btn-primary" value="Сохранить" id="btnSave" disabled>
  </div>
</div>
<div id="insertToDB" style="min-height: 100px"></div>
main;

$field['footerContent'] = <<<temp
<template id="FormViesTmp">
  <form action="#">
    
  </form>
</template>
<template id="FormRowTmp">
  <div class="d-flex justify-content-between">
    <p data-field="description"></p>
    <div data-field="params" class="d-flex justify-content-around"></div>
  </div>
</template>
<template id="FormParamTmp">
  <section>
    <div data-type="string">
      <input type="text">
    </div>
    <div data-type="number">
      <button type="button" class="inputChange" data-change="-1" data-input="width">-</button>
      <input type="number" class="" name="width">
      <button type="button" class="inputChange" data-change="1" data-input="width">+</button>
    </div>
    <div data-type="select">
      <select name="" id=""></select>
    </div>
    <div data-type="checkbox">
      <input type="checkbox">
    </div>
    <div data-type="color">
      <input type="color">
    </div>
  </section>
</template>
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
<template id="rowTemplate">
  <div class="mb-2 border">
    <div>
      <small data-field="id"></small>
      <span data-field="desc"></span>
    </div>
    <div class="d-flex justify-content-around" data-field="params"></div>
  </div>
</template>
<template id="rowParamTemplate">
  <div style="cursor: pointer">
    <label>
      <span data-field="key"></span>
      <span data-field="type"></span>
      <input type="checkbox" hidden data-action="editField">
    </label>
  </div>
</template>
<template id="editParamModal">
  <form action="#">
    <div data-field="setting" class="d-flex flex-column">
    <div class="d-flex w-100">
      <label>Тип:
        <select class="useToggleOption" name="type">
          <option value="string" data-target="">Строка</option>
          <option value="number" data-target="typeNumber">Число</option>
          <option value="select" data-target="typeSelect">Список</option>
          <option value="checkbox" data-target="typeCheckbox">Чекбокс</option>
          <option value="color" data-target="">Цвет</option>
        </select>
      </label>
    </div>
    <div class="d-flex flex-column typeNumber">
      <label>минимум<input type="number" value="0" name="min"></label>
      <label>максимум<input type="number" value="1000000000" name="max"></label>
      <label>шаг<input type="number" value="1" name="step"></label>
    </div>
    <div class="d-flex flex-column typeSelect">
      <div class="d-flex justify-center">
        <input type="button" value="+" data-action="add"> 
        <input type="button" value="-" data-action="remove">
      </div>
      <div class="d-flex flex-column" data-field="option"></div>
    </div>
    <div class="d-flex flex-column typeCheckbox">
      <label>Зависимое поле<input type="text" placeholder="ID зависимого поля" name="relTarget"></label>
      <label>Отображать, если активен<input type="checkbox" checked name="relativeWay"></label>
    </div>
  </div>
  </form>
</template>
temp;

$field['footerContent'] .= $main->initDictionary();
