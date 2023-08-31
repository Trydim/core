<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var bool $showFilter - from controller
 * @var array $filterOptions - from controller
 */

?>
<div class="d-flex justify-content-between pb-4" id="actionBtnWrap">
  <div>
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
<div class="d-flex">
  <div class="col input-group">
    <span class="input-group-text"><?= gTxt('Search') ?>:</span>
    <input type="text" id="search" class="form-control" autocomplete="off">
  </div>
  <?php if ($showFilter) { ?>
    <div class="col input-group ms-3">
      <span class="input-group-text"><?= gTxt('Filter') ?>:</span>
      <select class="form-select" data-action="filter<?= ucfirst($showFilter) ?>">
        <option value="0"><?= $main->getCmsParam('PROJECT_TITLE') ?></option>
        <?php foreach ($filterOptions as $option) { ?>
          <option value="<?= $option['id'] ?>"><?= $option['name'] ?></option>
        <?php } ?>
      </select>
    </div>
  <?php } ?>
</div>

<div class="mt-1 position-relative">
  <button type="button" class="position-absolute top-0 btn btn-light pi pi-cog mt-2 p-2" style="z-index: +1" data-action="setupColumns"></button>
  <table id="orderTable" class="text-center table table-striped">
    <thead><tr></tr></thead>
    <tbody></tbody>
  </table>
</div>
<div id="paginator"></div>

<div class="position-fixed bottom-0 end-0 mb-5 d-none" id="selectedArea">
  <div class="d-inline bg-light p-1 me-1" title="<?= gTxt('Selected orders') ?>"></div>
  <button class="btn btn-danger pi pi-times" data-action="resetSelected"></button>
</div>
