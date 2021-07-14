<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $units - from controller
 * @var $money - from controller
 * @var $properties - from controller
 */


$unitsOptionsHtml = '';
foreach ($units as $opt) {
  $id = $opt['ID'];
  $name = $opt['short_name'];
  $unitsOptionsHtml .= "<option value=\"$id\">$name</option>";
}


$moneyOptionsHtml = '';
foreach ($money as $opt) {
  $id = $opt['ID'];
  $name = $opt['name'];
  $moneyOptionsHtml .= "<option value=\"$id\">$name</option>";
}


$propertiesHtml = '';
foreach ($properties as $propName => $prop) {
  if (isset($prop['type'])) {
    $name = $prop['name'];
    $type = $prop['type'];
    $propertiesHtml .= "<div class='row'>
      <label class='col'>$name</label><div class='col'>
      <input class='w-100' type='$type' name='$propName'></div>
    </div>";
  } else {
    $propertiesHtml .= "<div class='row'><label class='col'>$propName</label>"
                       . "<div class='col'><select class='w-100' name='$propName'>"
                       . "<option value='no'>-</option>";

    foreach ($prop['values'] as $opt) {
      $id = $opt['ID'];
      $name = $opt['name'];
      $propertiesHtml .= "<option value=\"$id\">$name</option>";
    }

    $propertiesHtml .= "</select></div></div>";
  }
}


$field['content'] = <<<content
<div class="container-fluid">
  <div class="row">
    <div class="col-3 overflow-auto bg-style-sheet">
      <div id="sectionField" class="openSection" data-id="0">Разделы</div>
      <div class="subSection"></div>
      <div class="controlWrap" id="footerBtn">
        <input class="btn btn-success" type="button" value="Создать раздел" data-action="createSection">
        <input class="btn btn-warning" type="button" value="Открыть раздел" data-action="openSection">
        <input class="btn btn-warning" type="button" value="Изменить раздел" data-action="changeSection">
        <input class="btn btn-danger" type="button" value="Удалить раздел" data-action="delSection">
      </div>
    </div>
    <div class="col-9">
      <div class="d-none bg-style-sheet" id="elementsField">
        <table class="text-center table table-striped" data-type="elements">
          <thead><tr></tr></thead>
          <tbody></tbody>
        </table>
        <div class="text-center pageWrap"></div>
        <div class="mt-1 controlWrap">
          <input class="btn btn-success" type="button" value="Создать элемент" data-action="createElements">
          <input class="btn btn-warning" type="button" value="Открыть элемент" data-action="openElements">
          <input class="btn btn-warning" type="button" value="Изменить элемент" data-action="changeElements">
          <input class="btn btn-danger" type="button" value="Удалить элемент" data-action="delElements">
        </div>
      </div>
    </div>
  </div>
</div>
<hr>
<div class="container-fluid d-none bg-style-sheet" id="optionsField">
  <div class="row m-2" style="overflow: auto">
    <table class="text-center table table-striped" data-type="options">
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <div class="text-center pageWrap"></div>
  <div class="mt-1 text-center controlWrap">
    <input class="btn btn-success" type="button" value="Добавить вариант" data-action="createOptions">
    <input class="btn btn-warning" type="button" value="Изменить вариант" data-action="changeOptions">
    <input class="btn btn-danger" type="button" value="Удалить вариант" data-action="delOptions">
  </div>
</div>
content;

$field['footerContent'] .= <<<footerContent
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
  <th><input type="button" class="btn btn-info btn-sm table-th" value="\${name} ↑↓" data-ordercolumn="\${name}"></th>
</template>
<template id="itemsTableRowsCheck">
  <td><input type="checkbox" data-id="\${id}"></td>
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
    <div class="row">
      <label class="col">Имя варианта:</label>
      <div class="col"><input class="w-100" type="text" name="O.name"></div>  
    </div>
    
    <div class="row">
      <label class="col">Единица измерения:</label>
      <div class="col"><select class="w-100" name="U.ID">$unitsOptionsHtml</select></div>  
    </div>
          
    <div class="row">
      <div class="col-12 text-center">Входная цена</div>
      <div class="col">
        <label>Валюта: <br><select name="MI.ID">$moneyOptionsHtml</select></label>
      </div>
      <div class="col">
        <label>Сумма: <br><input type="number" name="input_price" value="0"></label>
      </div>
    </div>
    
    <div>
      <div class="col text-center">Розничная цена</div>
      <div class="col row">
        <label class="col">Валюта: <br><select name="MO.ID">$moneyOptionsHtml</select></label>
        <label class="col">Наценка, %:<br><input type="number" name="output_percent"></label>
        <label class="col">Сумма:<br><input type="number" name="output_price" value="0"></label>
      </div>
    </div>
    
    <div id="changeField">
      <div class="row">
        <label class="col">Активность:</label>
        <div class="col"><input class="w-100" type="checkbox" name="O.activity"></div>     
      </div>
      <div class="row">
        <label class="col">Сортировка:</label>
        <div class="col"><input class="w-100" type="number" name="sort"></div>     
      </div>
    </div>
    
    <div data-field="properties">
      <div class="col-12 text-center">Параметры</div>
      $propertiesHtml
    </div>
  </form>
</template>
<template id="onePageInput">
  <input type="button" value="\${pageValue}" class="ml-1 mr-1" data-action="page" data-page="\${page}">
</template>
footerContent;
