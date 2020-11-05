<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');
$field['content']       = <<<content
<div class="container-fluid">
  <div class="row">
    <div class="col-3 overflow-auto">
      <div id="sectionField" class="openSection" data-id="0">Разделы</div>
      <div class="subSection"></div>
      <div class="controlWrap" id="footerBtn">
        <input type="button" value="Создать раздел" data-action="createSection">
        <input type="button" value="Открыть раздел" data-action="openSection">
        <input type="button" value="Изменить раздел" data-action="changeSection">
        <input type="button" value="Удалить раздел" data-action="delSection">
      </div>
    </div>
    <div class="col-9">
      <div class="d-none" id="elementsField" data-field="elements">
        <table class="text-center">
          <thead><tr></tr></thead>
          <tbody></tbody>
        </table>
        <div class="text-center pageWrap">
          <input type="button" value="<" data-action="new">
          <div id="elementsPageWrap" class="d-inline-flex"></div>
          <input type="button" value=">" data-action="old">
          <select data-action="count">
            <option value="1">1 запись</option>    
            <option value="2">2 записи</option>    
            <option value="5">5 записей</option>    
            <option value="20" selected>20 записей</option>    
          </select>
        </div>
        <div class="mt-1 controlWrap">
          <input type="button" value="Создать элемент" data-action="createElements">
          <input type="button" value="Открыть элемент" data-action="openElements">
          <input type="button" value="Изменить элемент" data-action="changeElements">
          <input type="button" value="Удалить элемент" data-action="delElements">
        </div>
      </div>
    </div>
  </div>
</div>
<hr>
<div class="container-fluid d-none" id="optionsField" data-field="options">
  <div class="row">
    <table  class="text-center">
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <div class="text-center pageWrap">
    <input type="button" value="<" data-action="new">
    <div id="optionsPageWrap" class="d-inline-flex"></div>
    <input type="button" value=">" data-action="old">
    <select data-action="count">
      <option value="1">1 запись</option>    
      <option value="2">2 записи</option>    
      <option value="5">5 записей</option>    
      <option value="20" selected>20 записей</option>    
    </select>
  </div>
  <div class="mt-1 text-center controlWrap">
    <input type="button" value="Добавить вариант" data-action="createOptions">
    <input type="button" value="Изменить вариант" data-action="changeOptions">
    <input type="button" value="Удалить вариант" data-action="delOptions">
  </div>
</div>
content;

$field['footerContent'] = <<<footerContent
<template id="sectionWrap">
  <ul class="list" style="cursor: pointer"></ul>
</template>
<template id="section">
  <li style="cursor: pointer">
    <div class="closeSection border-dark" data-id="\${ID}">\${ID} - \${name}</div>
    <div class="subSection"></div>
  </li>
</template>
<template id="itemsTableHead">
  <th><input type="button" value="\${name} ↑↓" data-ordercolumn="\${name}"></th>
</template>
<template id="itemsTableRowsCheck">
  <td><input type="checkbox" data-id="\${ID}"></td>
</template>
<template id="sectionForm">
  <form action="#">
    <label>Имя раздела: <br><input type="text" name="sectionName"></label>
    <br><label>Символьный код раздела: <br><input type="text" name="sectionCode"></label>
    <br><label>Родительский раздел:<br><input type="text" name="sectionParent"></label>
  </form>
</template>
<template id="elementForm">
  <form action="#">
    <label>Тип элемента: <input type="text" name="elementType"></label>
    <br><label>Имя элемента: <input type="text" name="elementName"></label>
    <div id="changeField">
      <br><label>Родительский раздел(*): <input type="text" name="sectionParent"></label>
      <br><label>Активность: <input type="checkbox" name="elementActivity"></label>
      <br><label>Сортировка: <input type="number" name="elementSort"></label>
    </div>
  </form>
</template>
<template id="optionForm">
  <form action="#">
    <label>Имя варианта: <input type="text" name="optionName"></label>
    <br><label>Единица измерения: <select name="unitId">
            <option value="1">Штука</option>
            <option value="2">МП</option>
          </select></label>
    <div>Входная цена
        <br><label> валюта: 
          <select name="moneyInputId">
            <option value="1">USD</option>
            <option value="2">RUB</option>
          </select></label>
        <br><label> сумма: <input type="number" name="moneyInput" value="0"></label>
    </div>
    <div>Розничная цена
      <br><label> валюта: <select name="moneyOutputId">
            <option value="1">USD</option>
            <option value="2">RUB</option>
          </select></label>
      <br><label> наценка, %: <input type="number" name="outputPercent"></label>
      <br><label> сумма: <input type="number" name="moneyOutput"></label>
    </div>
    <div id="changeField">
      <br><label>Активность: <input type="checkbox" name="optionActivity"></label>
      <br><label>Сортировка: <input type="number" name="optionSort"></label>
    </div>
  </form>
</template>
<template id="onePageInput">
  <input type="button" value="\${pageValue}" class="ml-1 mr-1" data-action="page" data-page="\${page}">
</template>
footerContent;
