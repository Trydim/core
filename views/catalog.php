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
      $propertiesHtml .= "<div class='input-group mb-3'>
        <span class='input-group-text w-50'>$name</span>
        <input class='form-control' type='$type' name='$propName'>
      </div>";
    } else {
      $defOption = '';
      if (isset($prop['values'])) $defOption = "<option value=''>-</option>";
      else $prop['values'] = [['ID' => false, 'name' => 'table empty']];

      $propertiesHtml .= "<div class='input-group mb-3'><span class='input-group-text w-50'>$name</span>"
                         . "<select class='form-select w-50' name='$propName'>" . $defOption;

      foreach ($prop['values'] as $opt) {
        $id = $opt['ID'];
        $name = $opt['name'];
        $propertiesHtml .= "<option value=\"$id\">$name</option>";
      }

      $propertiesHtml .= "</select></div>";
    }
  }
}


$field['content'] = <<<content
<div class="container-fluid">
  <div id="searchField" class="input-group">
    <span class="input-group-text">Поиск:</span>
    <input type="text" class="form-control" name="search" autocomplete="off" data-field="search">
  </div>
  <hr>
  <div class="row">
    <div id="sectionField" class="col-3 overflow-auto">
      <div class="openSection" role="button" data-action="clickSection" data-id="0">Разделы</div>
      <div class="subSection" role="button" data-action="clickSection"></div>
      <div class="controlWrap p-1">
        <button type="button" class="btn btn-success" data-action="createSection" title="Создать раздел">
          <i class="pi pi-plus-circle align-text-bottom" data-action="createSection"></i>
        </button>
        <button type="button" class="btn btn-warning" data-action="openSection" title="Открыть раздел">
          <i class="pi pi-folder-open align-text-bottom" data-action="openSection"></i>
        </button>
        <button type="button" class="btn btn-warning" data-action="changeSection" title="Изменить раздел">
          <i class="pi pi-cog align-text-bottom" data-action="changeSection"></i>
        </button>
        <button type="button" class="btn btn-danger" data-action="delSection" title="Удалить раздел">
          <i class="pi pi-trash align-text-bottom" data-action="delSection"></i>
        </button>
      </div>
    </div>
    <div id="elementsField" class="col">
      <div class="position-relative">
        <div class="d-none" data-field="tableWrap">
          <table class="table table-striped table-hover text-center user-select-none" role="button">
            <thead><tr></tr></thead>
            <tbody></tbody>
          </table>
          <div class="pageWrap"></div>
        </div>
        <div class="mt-1 controlWrap">
          <button type="button" class="btn btn-success" data-action="createElement" title="Создать элемент">
            <i class="pi pi-plus-circle align-text-bottom" data-action="createElement"></i>
          </button>
          <span class="d-none" data-field="btnWrap">
            <button type="button" class="btn btn-warning" data-action="openElement" title="Открыть элемент">
              <i class="pi pi-inbox align-text-bottom" data-action="openElement"></i>
            </button>
            <button type="button" class="btn btn-warning" data-action="changeElements" title="Изменить элемент">
              <i class="pi pi-cog align-text-bottom" data-action="changeElements"></i>
            </button>
            <button type="button" class="btn btn-warning" data-action="copyElement" title="Копировать элемент">
              <i class="pi pi-copy align-text-bottom" data-action="copyElement"></i>
            </button>
            <button type="button" class="btn btn-danger" data-action="delElements" title="Удалить элемент">
              <i class="pi pi-trash align-text-bottom" data-action="delElements"></i>
            </button>

            <span class="float-end">
              <button type="button" class="btn btn-dark" data-action="selectedAll" title="Выделить все">
                <i class="pi pi-check align-text-bottom" data-action="selectedAll"></i>
              </button>
              <button type="button" class="btn btn-dark" data-action="clearId" title="Снять выделение">
                <i class="pi pi-times align-text-bottom" data-action="clearId"></i>
              </button>
              <label class="btn btn-dark" title="Показать выбранные">
                <input type="checkbox" id="elementsSelected" hidden data-target="elementsSelected">
                <i class="pi pi-bars align-text-bottom"></i>        
              </label>
            </span>
          </span>
        </div>

        <div class="position-absolute bottom-0 end-0 bg-light p-1 border rounded"
             data-relation="elementsSelected"
             style="min-width: 230px">
          <div class="position-relative pt-5">
            <label class="btn btn-outline-dark position-absolute top-0 end-0" for="elementsSelected">
              <i class="pi pi-times align-text-bottom"></i>
            </label>
            <div data-field="selectedList"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<hr>
<div class="container-fluid" id="optionsField">
  <div class="d-none" data-field="tableWrap">
    <div class="row overflow-auto m-2">
      <table class="table table-striped table-hover text-center user-select-none" role="button">
        <thead><tr></tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="pageWrap"></div>
  </div>
  <div class="mt-1 text-center controlWrap">
    <button type="button" class="btn btn-success" data-action="createOption" title="Добавить вариант">
      <i class="pi pi-plus-circle align-text-bottom" data-action="createOption"></i>
    </button>
    <span class="d-none" data-field="btnWrap">
      <button type="button" class="btn btn-warning" data-action="changeOptions" title="Изменить вариант">
        <i class="pi pi-cog align-text-bottom" data-action="changeOptions"></i>
      </button>
      <button type="button" class="btn btn-warning" data-action="copyOption" title="Копировать вариант">
        <i class="pi pi-copy align-text-bottom" data-action="copyOption"></i>
      </button>
      <button type="button" class="btn btn-danger" data-action="delOptions" title="Удалить вариант">
        <i class="pi pi-trash align-text-bottom" data-action="delOptions"></i>
      </button>
      
      <span class="float-end">
        <button type="button" class="btn btn-dark" data-action="selectedAll" title="Выделить все">
          <i class="pi pi-check align-text-bottom" data-action="selectedAll"></i>
        </button>
        <button type="button" class="btn btn-dark" data-action="clearId" title="Снять выделение">
          <i class="pi pi-times align-text-bottom" data-action="clearId"></i>
        </button>
        <label class="btn btn-dark" title="Показать выбранные">
          <input type="checkbox" id="optionsSelected" hidden data-target="optionsSelected">
          <i class="pi pi-bars align-text-bottom"></i>        
        </label>
      </span>
    </span>
  </div>

  <div class="position-absolute bottom-0 end-0 bg-light p-1 border rounded"
       data-relation="optionsSelected"
       style="min-width: 230px">
    <div class="position-relative pt-5">
      <label class="btn btn-outline-dark position-absolute top-0 end-0" for="optionsSelected">
        <i class="pi pi-times align-text-bottom"></i>
      </label>
      <div data-field="selectedList"></div>
    </div>
  </div>

</div>
content;

$field['footerContent'] .= <<<footerContent
<template id="sectionWrap">
  <ul class="list"></ul>
</template>
<template id="section">
  <li>
    <div class="closeSection" data-action="clickSection" data-id="\${ID}">\${ID} - \${name}</div>
    <div class="subSection"></div>
  </li>
</template>
<template id="itemsTableHead">
  <th><input type="button" class="btn btn-info btn-sm table-th" value="\${name}" data-column="\${column}"></th>
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
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="sName" placeholder="Имя раздела" name="name">
      <label for="sName">Имя раздела</label>
    </div>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="sCode" placeholder="Символьный код раздела" name="code">
      <label for="sCode">Символьный код раздела</label>
    </div>

    <div class="form-floating mb-3">
      <select class="form-select" id="parentId" name="parentId">$sectionElementsHtml</select>
      <label for="parentId">Родительский раздел</label>
    </div>
  </form>
</template>
<template id="elementsForm">
  <form action="#">
    <div class="form-floating my-3 formRow">
      <select class="form-select" id="eType" name="type">$typeElementsHtml</select>
      <label for="eType">Тип элемента</label>
    </div>

    <div class="form-floating mb-3 formRow">
      <input type="text" class="form-control" id="eName" placeholder="Имя" name="name">
      <label for="eName">Имя элемента</label>
    </div>

    <div id="multiChangeField">
      <div class="form-floating mb-3 formRow">
        <select class="form-select" id="eParentId" name="parentId">$sectionElementsHtml</select>
        <label for="eParentId">Родительский раздел(*)</label>
      </div>

      <div class="row">
        <div class="col-6 ps-4">
          <label class="w-100" for="eActivity" role="button">Активность:</label>
        </div>
        <div class="col-6">
          <div class="form-check form-switch mb-3 formRow text-center">
            <input class="form-check-input float-none" type="checkbox" role="switch" name="activity" id="eActivity">
          </div>
        </div>
      </div>

      <div class="form-floating mb-3 formRow">
        <input type="text" class="form-control" id="eSort" placeholder="Сортировка" name="sort">
        <label for="eSort">Сортировка</label>
      </div>
    </div>
  </form>
</template>
<template id="optionsForm">
  <form action="#" class="row">
    <div class="col">
      <div class="input-group my-3 onlyOne">
        <span class="input-group-text">Имя варианта</span>
        <input type="text" class="form-control" name="name">
      </div>

      <div class="input-group mb-3">
        <span class="input-group-text">Единица измерения</span>
        <select class="form-select" name="unitId">$unitsOptionsHtml</select>
      </div>

      <div class="form-label text-center">Входная цена</div>
      <div class="input-group mb-3">
        <span class="input-group-text">Валюта</span>
        <select class="form-select" name="moneyInputId">$moneyOptionsHtml</select>
        <span class="input-group-text onlyOne">Цена</span>
        <input type="number" class="form-control onlyOne" name="inputPrice" value="0">
      </div>

      <div class="form-label text-center">Розничная цена</div>
      <div class="input-group mb-3">
        <span class="input-group-text">Валюта</span>
        <select class="form-select" name="moneyOutputId">$moneyOptionsHtml</select>
        <span class="input-group-text">Наценка, %</span>
        <input type="number" class="form-control" name="outputPercent" value="30">
        <span class="input-group-text onlyOne">Цена</span>
        <input type="number" class="form-control onlyOne" name="outputPrice" value="0">
      </div>
      
      <div class="input-group mb-3">
        <span class="input-group-text">Сортировка</span>
        <input type="text" class="form-control" name="sort" value="100">
        <span class="input-group-text">Активность</span>
        <div class="input-group-text">
          <input class="form-check-input mt-0" type="checkbox" name="activity">
        </div>
        <span class="input-group-text onlyMany">Открыть параметры (*)</span>
        <div class="input-group-text onlyMany">
          <input type="checkbox" class="form-check-input mt-0" id="property">
        </div>
      </div>
      
      <div class="row onlyOne">
        <div class="col-12">
          <input type="file" class="d-none" name="files" id="uploadFile" multiple>
          <label class="btn btn-warning" for="uploadFile">Загрузить</label>
          <input type="button" class="btn btn-warning chooseFile" value="Выбрать">
          <div id="fileField" class="overflow-auto" style="max-height: 300px"></div>
        </div>
        <div class="col" id="fileField"></div>
      </div>
    </div>
    
    <div data-field="property" class="col d-none overflow-auto" style="max-height: 90vh">
      <div class="form-label text-center mb-3">Параметры</div>
      $propertiesHtml
    </div>
  </form>
</template>
<template id="chooseFileTmp">
  <div class="d-flex my-1 justify-content-between border-bottom \${error}">
    <span class="flex-fill bold text-center">\${name}</span>
    <span class="table-basket__cross btn btn-sm btn-danger" data-id="\${index}" data-action="removeFile">
      <i class="pi pi-times align-text-bottom" data-action="removeFile"></i>
    </span>
  </div>
</template>
<template id="chooseLoadedFileTmp">
  <div class="col-12 col-lg-4 card">
    <label class="w-100" role="button" for="files-\${id}">
      <img class="card-img-top img-fluid" src="\${image}" alt="\${name}">
    </label>
    <div class="card-body d-flex">
      <div class="form-check mx-auto">
        <input class="form-check-input" type="checkbox" name="files[]" value="\${id}" id="files-\${id}">
        <label class="form-check-label" for="files-\${id}" role="button">\${name}</label>
      </div>
    </div>
  </div>
</template>
footerContent;

unset($typeElementsHtml, $types, $sectionElementsHtml, $section);
unset($unitsOptionsHtml, $units, $moneyOptionsHtml, $money, $propertiesHtml, $properties);
