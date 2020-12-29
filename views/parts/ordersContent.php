<?php if ( !defined('MAIN_ACCESS')) die('access denied!'); ?>
<div class="d-flex justify-content-between p-bottom" id="actionBtnWrap">
  <div>
    <input type="button" class="btn btn-success oneOrderOnly" value="Редактировать" data-action="openOrder">
    <input type="button" class="btn btn-warning" value="Изменить Статус" data-action="changeStatusOrder">
    <input type="button" class="btn btn-primary oneOrderOnly" value="Pdf" data-action="savePdf">
    <input type="button" class="btn btn-primary  oneOrderOnly" value="Печать" data-action="printOrder">
    <input type="button" class="btn btn-primary oneOrderOnly" value="Отправить на почту" data-action="sendOrder">
  </div>
  <div>
    <input type="button" class="btn btn-danger" value="Удалить" data-action="delOrders">
  </div>
</div>
<div class="d-none p-bottom" id="confirmField">
  <select id="selectStatus" class="d-none custom-select select-status" name="status_id"></select>
  <input type="button" class="btn btn-success" value="Подтвердить" data-action="confirmYes">
  <input type="button" class="btn btn-warning" value="Отмена" data-action="confirmNo">
</div>
<div class="p-bottom d-none" id="printTypeField">
<? for ($i = 1; $i <= PRINT_BTN; $i++) { ?>
  <input type="button" class="btn btn-primary"
         data-action="printReport" data-type="printType<?= $i ?>"
         value="<?= gTxt('printType' . $i) ?>">
<? } ?>
  <input type="button" class="btn btn-warning" data-action="cancelPrint" value="Отмена">
</div>
<div class="res-table">

  <div class="form-group">
    <label class="w-100">Поиск: <input type="text" id="search" name="search" value="" class="form-control" autocomplete="off"></label>
  </div>

  <table id="orderTable" class="text-center table table-striped">
    <thead>
    <tr>
      <th></th>
      <?php if(isset($columns)) foreach ($columns as $item) { ?>
        <th>
          <input type="button" class="btn btn-info btn-sm table-th" value="<?= $item['name']; ?> ↑↓" data-ordercolumn="<?= $item['dbName']; ?>">
        </th>
      <?php } ?>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>
        <input type="checkbox" class="" data-id="${O.ID}"></td>
      <?php if(isset($columns)) foreach ($columns as $item) { ?>
        <td>${<?= $item['dbName']; ?>}
      </td>
      <?php } ?>
    </tr>
    </tbody>
    <tfoot><tr></tr></tfoot>
  </table>
</div>
