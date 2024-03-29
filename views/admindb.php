<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $tableActive - global
 */

$legendHtml = '';
if (isset($legend[$tableActive])) {
  $legendHtml = "<template id='dataTableLegend'><div>" . $legend[$tableActive] . "</div></template>";
}

$field['content'] = <<<main
<div class="d-flex align-items-center justify-content-around pt-3">
  <div class="text-center mr-5">
    <h2 id="tableNameField"></h2>
  </div>
  <div id="btnField">
    <button type="button" class="btn btn-primary" id="btnSave" disabled>Сохранить</button>
    <button type="button" class="btn btn-primary d-none" id="btnRefresh">Обновить Конфиг</button>
  </div>
  <div></div>
  <div id="viewField" class="gap-1" hidden>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="form" id="formMode" disabled data-action="adminType">
      <label class="form-check-label" for="formMode">Режим форм</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="table" id="formTable" checked data-action="adminType">
      <label class="form-check-label" for="formTable">Режим таблицы</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="config" id="setupMode" disabled data-action="adminType">
      <label class="form-check-label" for="setupMode">Настройка формы (Для опытных)</label>
    </div>
  </div>
</div>
<div id="insertToDB" class="h-25"></div>
<div class="position-fixed bottom-0 end-0" style="z-index: 10">
  <input type="button" id="legend" class="btn btn-outline-primary m-1" value="Помощь">
</div>
main;

$field['footerContent'] = <<<temp
$legendHtml
<template id="formViewsTmp">
  <form action="#"></form>
</template>
<template id="formRowTmp">
  <div class="d-flex justify-content-between">
    <p data-field="description" style="width: 30%"></p>
    <div data-field="params" class="d-flex justify-content-around" style="width: 70%"></div>
  </div>
</template>
<template id="formParamTmp">
  <section>
    <div data-type="string" class="w-100 text-center">
      <input type="text" class="w-90">
    </div>
    <div data-type="number" class="w-100 text-center">
      <button type="button" class="w-10 inputChange actionMinus">-</button>
      <input type="number" class="w-70" name="number">
      <button type="button" class="w-10 inputChange actionPlus">+</button>
    </div>
    <div data-type="simpleList" class="w-100 text-center">
      <select class="w-90"></select>
    </div>
    <div data-type="relationTable" class="w-100 text-center">
      <select class="w-90"></select>
    </div>
    <div data-type="checkbox" class="w-100 text-center">
      <input type="checkbox" class="w-90">
    </div>
    <div data-type="color" class="w-100 text-center">
      <input type="color" class="w-90">
    </div>
    <div data-type="textarea" class="w-100 text-center">
      <textarea class="w-100" cols="5"></textarea>
    </div>
  </section>
</template>
<template id="tablesListTmp">
  <li><label><input type="radio" name="tablesList" value="\${name}">\${name}</label></li>
</template>
<template id="columnName">
  <p>\${columnName} - \${type} (\${key} Null-\${null})</p>
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
  <div class="mb-2 border w-100">
    <div>
      <small data-field="id"></small>
      <span data-field="desc"></span>
    </div>
    <div class="d-flex justify-content-around" data-field="params"></div>
  </div>
</template>
<template id="rowParamTemplate">
  <div role="button">
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
        <select class="useToggleOption" name="type" data-action="selectChange">
          <option value="string" data-target="">Строка</option>
          <option value="number" data-target="typeNumber">Число</option>
          <option value="simpleList" data-target="simpleList">Простой Список</option>
          <option value="relationTable" data-target="relationTable">Справочник</option>
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
    <div class="d-flex flex-column simpleList">
      <p>В каждой строке 1 значение!</p>
      <p>ключ=значение.</p>
      <div class="d-fle x justify-center">
        <textarea name="listItems" cols="30" rows="5"></textarea>
      </div>  
    </div>
    <div class="relationTable">
      <div class="d-flex justify-content-between">
        <label>Таблица (файл)</label>
        <select name="dbTable" data-field="dbTables" data-action="selectDbTables"></select>
      </div>
      <div class="d-flex justify-content-between">
        <label>Поля зависимостей(колонка)</label>
        <select name="tableCol" data-field="tableCol"></select>
      </div>
      <div class="d-flex justify-content-between">
        <label>Множественный</label>
        <input type="checkbox" name="multiple" value="true">
      </div>
    </div>
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
