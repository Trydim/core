<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $types - from controller
 * @var $section - from controller
 * @var $units - from controller
 * @var $money - from controller
 * @var $properties - from controller
 */

$typeElementsHtml = '';
foreach ($types as $opt) {
  $code = $opt['symbolCode'];
  $name = $opt['name'];
  $typeElementsHtml .= "<option value=\"$code\">$name</option>";
}


$sectionElementsHtml = '<option value="0">Верхний уровень</option>';
foreach ($section as $opt) {
  $id = $opt['ID'];
  $name = $opt['name'];
  $sectionElementsHtml .= "<option value=\"$id\">$name</option>";
}


$unitsOptionsHtml = '';
foreach ($units as $opt) {
  $id = $opt['ID'];
  $name = $opt['shortName'];
  $unitsOptionsHtml .= "<option value=\"$id\">$name</option>";
}


$moneyOptionsHtml = '';
foreach ($money as $opt) {
  $id = $opt['ID'];
  $name = $opt['name'];
  $moneyOptionsHtml .= "<option value=\"$id\">$name</option>";
}


$propertiesHtml = '';
if ($properties) {
  foreach ($properties as $propName => $prop) {
    $name = $prop['name'];
    if (isset($prop['type'])) {
      $type = $prop['type'];
      $propertiesHtml .= "<div class='row'>
        <label class='col'>$name</label><div class='col'>
        <input class='w-100' type='$type' name='$propName'></div>
      </div>";
    } else {
      $defOption = '';
      if (isset($prop['values'])) $defOption = "<option value=''>-</option>";
      else $prop['values'] = [['ID' => false, 'name' => 'table empty']];

      $propertiesHtml .= "<div class='row'><label class='col'>$name</label>"
                         . "<div class='col'><select class='w-100' name='$propName'>" . $defOption;

      foreach ($prop['values'] as $opt) {
        $id = $opt['ID'];
        $name = $opt['name'];
        $propertiesHtml .= "<option value=\"$id\">$name</option>";
      }

      $propertiesHtml .= "</select></div></div>";
    }
  }
}


$field['content'] = <<<content
<div class="container-fluid">
  <div class="row">
    <div id="sectionField" class="col-3 overflow-auto bg-style-sheet">
      <div class="openSection" data-action="clickSection" data-id="0">Разделы</div>
      <div class="subSection"></div>
      <div class="controlWrap">
        <input class="btn btn-success" type="button" value="Создать раздел" data-action="createSection">
        <input class="btn btn-warning" type="button" value="Открыть раздел" data-action="openSection">
        <input class="btn btn-warning" type="button" value="Изменить раздел" data-action="changeSection">
        <input class="btn btn-danger" type="button" value="Удалить раздел" data-action="delSection">
      </div>
    </div>
    <div class="col-9">
      <div class="d-none bg-style-sheet" id="elementsField">
        <table class="text-center table table-striped" style="cursor: pointer; user-select: none">
          <thead><tr></tr></thead>
          <tbody></tbody>
        </table>
        <div class="text-center pageWrap"></div>
        <div class="mt-1 controlWrap">
          <input class="btn btn-success" type="button" value="Создать элемент" data-action="createElements">
          <input class="btn btn-warning" type="button" value="Открыть элемент" data-action="openElements">
          <input class="btn btn-warning" type="button" value="Изменить элемент" data-action="changeElements">
          <input class="btn btn-warning" type="button" value="Копировать элемент" data-action="copyElements">
          <input class="btn btn-danger" type="button" value="Удалить элемент" data-action="delElements">
          <input class="btn btn-dark" type="button" value="Выделенить все" data-action="selectedAll">
          <input class="btn btn-dark" type="button" value="Снять выделение" data-action="clearId">
        </div>
      </div>
    </div>
  </div>
</div>
<hr>
<div class="container-fluid d-none bg-style-sheet" id="optionsField">
  <div class="row m-2" style="overflow: auto">
    <table class="text-center table table-striped" style="cursor: pointer">
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <div class="text-center pageWrap"></div>
  <div class="mt-1 text-center controlWrap">
    <input class="btn btn-success" type="button" value="Добавить вариант" data-action="createOptions">
    <input class="btn btn-warning" type="button" value="Изменить вариант" data-action="changeOptions">
    <input class="btn btn-warning" type="button" value="Копировать вариант" data-action="copyOptions">
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
    <div class="closeSection border-dark" data-action="clickSection" data-id="\${ID}">\${ID} - \${name}</div>
    <div class="subSection"></div>
  </li>
</template>
<template id="itemsTableHead">
  <th><input type="button" class="btn btn-info btn-sm table-th" value="\${name} ↑↓" data-ordercolumn="\${name}"></th>
</template>
<template id="imageTableCell">
  <td class="d-flex flex-wrap" style="max-height: 80px; overflow-y: auto"></td>
</template>
<template id="imageTableItem">
  <div class="col-6"><img src="\${src}" title="\${name} \${format}" style="width: 100%; height: auto"></div>
</template>
<template id="itemsTableRowsCheck">
  <td><input type="checkbox" data-id="\${id}"></td>
</template>
<template id="sectionForm">
  <form action="#">
    <div class="row mb-1">
      <div class="col">Имя раздела:</div>
      <div class="col"><input class="w-100" type="text" name="name"></div>  
    </div>
    <div class="row mb-1">
      <div class="col">Символьный код раздела:</div>
      <div class="col"><input class="w-100" type="text" name="code"></div>
    </div>
    <div class="row">
      <div class="col">Родительский раздел:</div>
      <div class="col"><select class="w-100" type="text" name="parentId">$sectionElementsHtml</select></div>
    </div>
  </form>
</template>
<template id="elementsForm">
  <form action="#">
    <div class="row mb-1 formRow">
      <div class="col">Тип элемента:</div>
      <div class="col"><select class="w-100" name="type">$typeElementsHtml</select></div>
    </div>
    <div class="row mb-1 formRow">
      <div class="col">Имя элемента:</div>
      <div class="col"><input type="text" class="w-100" name="name"></div>
    </div>
    <div id="multiChangeField">
      <div class="row mb-1 formRow">
        <div class="col">Родительский раздел(*):</div>
        <div class="col"><select class="w-100" name="parentId">$sectionElementsHtml</select></div>
      </div>
      <div class="row mb-1 align-items-center formRow">
        <div class="col">Активность:</div>
        <label class="col text-center h-100"><input type="checkbox" name="activity" checked></label>
      </div>
      <div class="row mb-1 formRow">
        <div class="col">Сортировка:</div>
        <div class="col"><input type="number" class="w-100" name="sort" value="100"></div>
      </div>
    </div>
  </form>
</template>
<template id="optionsForm">
  <form action="#" class="row">
    <div class="col">
      <div class="row onlyOne">
        <label class="col">Имя варианта:</label>
        <div class="col"><input class="w-100" type="text" name="name"></div>  
      </div>
      
      <div class="row">
        <label class="col">Единица измерения:</label>
        <div class="col"><select class="w-100" name="unitId">$unitsOptionsHtml</select></div>  
      </div>
            
      <div class="row">
        <div class="col-12 text-center">Входная цена</div>
        <div class="col">
          <label>Валюта: <br><select name="moneyInputId">$moneyOptionsHtml</select></label>
        </div>
        <div class="col onlyOne">
          <label>Цена: <br><input type="number" name="inputPrice" value="0"></label>
        </div>
      </div>
      
      <div>
        <div class="col text-center">Розничная цена</div>
        <div class="col row">
          <label class="col">Валюта: <br><select name="moneyOutputId">$moneyOptionsHtml</select></label>
          <label class="col">Наценка, %:<br><input type="number" name="outputPercent" value="30"></label>
          <label class="col onlyOne">Сумма:<br><input type="number" name="outputPrice" value="0"></label>
        </div>
      </div>
      
      <div class="row">
        <label class="col">Активность:</label>
        <div class="col"><input class="w-100" type="checkbox" name="activity" checked></div>     
      </div>
      <div class="row">
        <label class="col">Сортировка:</label>
        <div class="col"><input class="w-100" type="number" name="sort" value="100"></div>     
      </div>
      
      <div class="row onlyMany">
        <label class="col">Открыть параметры (*):</label>
        <div class="col"><input class="w-100" type="checkbox" id="properties"></div>     
      </div>
      
      <div class="row onlyOne">
        <div class="col">
          <input type="file" class="d-none" name="files" id="uploadFile" multiple>
          <label class="btn btn-warning" for="uploadFile">Загрузить</label>
          <input type="button" class="btn btn-warning" name="chooseFile" value="Выбрать">
          <div id="fileField"></div>
        </div>
        <div class="col" id="fileField"></div>
      </div>
    </div>
    
    <div data-field="property" class="col d-none">
      <div class="col-12 text-center">Параметры</div>
      $propertiesHtml
    </div>
  </form>
</template>
<template id="onePageInput">
  <input type="button" value="\${pageValue}" class="ml-1 mr-1" data-action="page" data-page="\${page}">
</template>
footerContent;

unset($typeElementsHtml, $types, $sectionElementsHtml, $section);
unset($unitsOptionsHtml, $units, $moneyOptionsHtml, $money, $propertiesHtml, $properties);
