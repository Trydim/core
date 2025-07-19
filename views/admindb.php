<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var string $tableActive - global
 */

$legendHtml = '';
if (isset($legend[$tableActive])) {
  $legendHtml = "<template id='dataTableLegend'><div>" . $legend[$tableActive] . "</div></template>";
}

$gTxt = 'gTxt';

$field['content'] = <<<main
<div class="d-flex flex-wrap flex-md-nowrap align-items-center mx-2 gap-3">
  <div class="table-name-header">
    <h2 id="tableNameField"></h2>
  </div>
  <div id="btnField" class="px-1">
    <button type="button" class="btn btn-transparent" id="btnSave" disabled>{$gTxt('Save')}</button>
    <button type="button" class="btn btn-transparent" id="btnShowHistory">{$gTxt('Change history')}</button>
  </div>
  <div id="viewField" class="ms-md-auto">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="form" id="formMode" data-action="adminType">
      <label class="form-check-label" for="formMode">{$gTxt('Form mode')}</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="table" id="formTable" data-action="adminType" checked>
      <label class="form-check-label" for="formTable">{$gTxt('Table mode')}</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="adminType" value="config" id="setupMode" data-action="adminType">
      <label class="form-check-label" for="setupMode">{$gTxt('Setup mode (Expert only)')}</label>
    </div>
  </div>
</div>
<div id="insertToDB" class="h-25"></div>
<div class="position-fixed bottom-0 end-0" style="z-index: 10">
  <input type="button" id="legend" class="btn btn-gray m-2" value="{$gTxt('Help')}">
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
temp;

$field['footerContent'] .= $main->initDictionary();
