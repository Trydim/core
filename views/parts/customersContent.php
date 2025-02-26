<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var $columns array - from controller
 */

?>
<div class="d-flex justify-content-between mb-4 pt-1 position-sticky top-0 bg-white gap-5 gap-md-0" id="actionBtnWrap" style="z-index: +2">
  <div class="d-inline-flex flex-wrap gap-1">
    <input type="button" class="btn btn-success" value="<?= gTxt('Add') ?>" data-action="addCustomer">
    <input type="button" class="btn btn-warning" value="<?= gTxt('Change') ?>" data-action="changeCustomer">
  </div>
  <div>
    <input type="button" class="btn btn-danger" value="<?= gTxt('Delete') ?>" data-action="delCustomer">
  </div>
</div>
<div class="d-none pb-3" id="confirmField">
  <input type="button" class="btn btn-success" value="<?= gTxt('Confirm') ?>" data-action="confirmYes">
  <input type="button" class="btn btn-warning" value="<?= gTxt('Cancel') ?>" data-action="confirmNo">
</div>
<div class="res-table overflow-auto w-100">
  <div class="input-group">
    <span class="input-group-text"><?= gTxt('Search') ?>:</span>
    <input type="text" id="search" class="form-control" value="" autocomplete="off">
  </div>

  <table id="customersTable" class="text-center table table-striped">
    <thead>
      <tr>
        <th></th>
        <?php foreach ($columns as $item) { ?>
          <th>
            <input type="button" class="btn btn-info btn-sm table-th" value="<?= $item['name']; ?>" data-column="<?= $item['dbName']; ?>">
          </th>
        <?php } ?>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" class="" data-id="${id}"></td>
        <?php foreach ($columns as $item) { ?>
          <td>${<?= $item['dbName']; ?>}</td>
        <?php } ?>
      </tr>
    </tbody>
    <tfoot>
      <tr></tr>
    </tfoot>
  </table>
</div>
<div id="paginator" class="w-100"></div>
