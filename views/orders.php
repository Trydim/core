<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

// $auth = template('parts/authBlock');
// $field['pageHeader'] = <<<pageHeader

// pageHeader;

$field['pageFooter'] = <<<pageFooter
<div class="text-center flex-footer footer" id="footerBlock">
  <button type="button" class="btn-arrow" data-action="new">&laquo;</i></button>
  <div id="onePageBtn" class="flex-footer"></div>
  <button type="button" class="btn-arrow" data-action="old">&raquo;</i></button>  

  <select class="select-width custom-select" data-action="count">
    <option value="1">1 запись</option>    
    <option value="2">2 записи</option>    
    <option value="5">5 записей</option>    
    <option value="20" selected>20 записей</option>    
  </select>   
</nav>
</div>
pageFooter;

$field['footerContent'] .= <<<footerContent
<template id="changeStatus">
  <option value="\${ID}">\${name}</option>
</template>
<template id="tableImportantValue">
  <div>\${key} - \${value}</div>
</template>
<template id="onePageInput">
  <input type="button" value="\${pageValue}" class="ml-1 mr-1 input-paginator" data-action="page" data-page="\${page}">
</template>
<template id="sendMailTmp">
  <div class="d-flex">
    <form action="#" id="authForm" class="w-100">
      <div class="modal-content__form">
        <div class="form-group w-100">
          <label class="w-100 bold">Почта:
            <input type="text" id="email" name="email" class="form-control">
          </label>
        </div>      
      </div>
    </form>
  </div>
</template>
<template id="noFoundSearchMsg">
  <tr><td colspan="15">не найдено</td></tr>
</template>
<!--template id="orderOpenForm">
  <div>
    <div>Дата создания - \${create_date}</div>
    <div>Дата редактирования - \${last_edit_date}</div>
    <div>Закачик - \${customer}</div>
    <div>Менеджер - \${name}</div>
    <div>Статус - \${status}</div>
    <div>\${important_value}</div>
    <div>\${report_value}</div>
    <div>\${total}</div>
  </div>
</template-->
footerContent;

$field['footerContent'] .= template('docs/printTpl');
