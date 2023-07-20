<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var bool $showFilter - from controller
 * @var array $dealers - from controller
 */

?>
<div class="d-flex justify-content-between pb-4" id="actionBtnWrap">
  <div class="">
    <input type="button" class="btn btn-success oneOrderOnly mainOnly" value="<?= gTxt('Edit') ?>" data-action="openOrder">
    <span id="orderBtn">
      <input type="button" class="btn btn-warning mainOnly" value="<?= gTxt('Change status') ?>" data-action="changeStatusOrder">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Pdf" data-action="savePdf">
      <input type="button" class="btn btn-primary oneOrderOnly" value="<?= gTxt('Print') ?>" data-action="printOrder">
      <input type="button" class="btn btn-primary oneOrderOnly" value="<?= gTxt('Send mail') ?>" data-action="sendOrder">
    </span>
  </div>
  <div>
    <input type="button" class="btn btn-danger mainOnly" value="<?= gTxt('Delete') ?>" data-action="delOrders">
  </div>
</div>
<div class="pb-4 d-none" id="confirmField">
  <label><select id="selectStatus" class="d-none form-select" data-action="statusOrders"></select></label>
  <input type="button" class="btn btn-success" value="<?= gTxt('Confirm') ?>" data-action="confirmYes">
  <input type="button" class="btn btn-warning ms-1" value="<?= gTxt('Cancel') ?>" data-action="confirmNo">
</div>
<?php if ($main->getCmsParam('USERS_ORDERS')) { ?>
  <div class="d-flex pb-4" style="justify-content: left">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="orderType" value="order" id="orderTypeO" checked data-action="orderTypeChange">
      <label class="form-check-label" for="orderTypeO" title="<?= gTxt('Orders saved by manager') ?>">
        <?= gTxt('Manager orders') ?>
      </label>
    </div>
    <div class="form-check ms-1">
      <input class="form-check-input" type="radio" name="orderType" value="visit" id="orderTypeV" data-action="orderTypeChange">
      <label class="form-check-label" for="orderTypeV" title="<?= gTxt('Results saved by customers') ?>">
        <?= gTxt('Customer orders') ?>
      </label>
    </div>
  </div>
<?php } ?>
<div class="res-table">
  <div class="row">
    <div class="col input-group">
      <span class="input-group-text"><?= gTxt('Search') ?>:</span>
      <input type="text" id="search" class="form-control" autocomplete="off">
    </div>
    <div class="col input-group">
      <?php if ($showFilter) { ?>
        <span class="input-group-text"><?= gTxt('Filter') ?>:</span>
        <select class="form-select" data-action="filterDealer">
          <option value="0"><?= $main->getCmsParam('PROJECT_TITLE') ?></option>
          <?php foreach ($dealers as $dealer) { ?>
            <option value="<?= $dealer['id'] ?>"><?= $dealer['name'] ?></option>
          <?php } ?>
        </select>
      <?php } ?>
    </div>
  </div>

  <div class="mt-1 position-relative">
    <table id="orderTable" class="text-center table table-striped">
      <thead>
        <tr></tr>
      </thead>
      <tbody></tbody>
    </table>
    <!--<button type="button" class="position-absolute end-0 top-0 btn btn-light pi pi-cog m-2" style="z-index: +1" data-action="setupColumns"></button>-->
  </div>
</div>
<div id="paginator" class="w-100"></div>
