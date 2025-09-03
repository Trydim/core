<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var bool $showFilter - from controller
 * @var array $filterOptions - from controller
 */

?>
<div data-relation="orderTemplateTable && !orderTemplateKanban" class="d-none">
  <div class="d-flex justify-content-between mb-4 pt-1 position-sticky top-0 bg-white gap-5 gap-md-0" id="actionBtnWrap" style="z-index: +2">
    <div>
      <input type="button" class="btn btn-success float-start mt-1 mt-md-0 mainOnly" value="<?= gTxt('Edit') ?>" data-action="openOrder">
      <span id="orderBtn">
        <input type="button" class="btn btn-warning float-start ms-1 mt-1 mt-md-0 mainOnly" value="<?= gTxt('Change status') ?>" data-action="changeStatusOrder">
        <input type="button" class="btn btn-primary float-start ms-1 mt-1 mt-md-0" value="Pdf" data-action="savePdf">
        <input type="button" class="btn btn-primary float-start ms-1 mt-1 mt-md-0" value="<?= gTxt('Print') ?>" data-action="printOrder">
        <input type="button" class="btn btn-primary float-start ms-1 mt-1 mt-md-0" value="<?= gTxt('Send mail') ?>" data-action="sendOrder">
      </span>
    </div>
    <div>
      <input type="button" id="deleteOrderBtn" class="btn btn-danger mt-1 mt-md-0 mainOnly" value="<?= gTxt('Delete') ?>" data-action="delOrders">
    </div>
  </div>
  <div class="position-sticky mb-4 pt-1 top-0 bg-white d-none" id="confirmField" style="z-index: +2">
    <label class="d-block d-md-inline-block"><select id="selectStatus" class="d-none form-select" data-action="statusOrders"></select></label>
    <input type="button" class="btn btn-success mt-1 mt-md-0" value="<?= gTxt('Confirm') ?>" data-action="confirmYes">
    <input type="button" class="btn btn-warning ms-1 mt-1 mt-md-0" value="<?= gTxt('Cancel') ?>" data-action="confirmNo">
  </div>
  <?php if ($main->getCmsParam('USERS_ORDERS')) { ?>
    <div class="d-flex mb-4" style="justify-content: left">
      <div class="form-check">
        <input class="form-check-input" type="radio" name="orderType" value="order" id="orderTypeO" checked data-action="orderTypeChange">
        <label class="form-check-label" for="orderTypeO" title="<?= gTxt('Orders saved by manager') ?>">
          <?= gTxt('Orders') ?>
        </label>
      </div>
      <div class="form-check ms-1">
        <input class="form-check-input" type="radio" name="orderType" value="visit" id="orderTypeV" data-action="orderTypeChange">
        <label class="form-check-label" for="orderTypeV" title="<?= gTxt('Results saved by customers') ?>">
          <?= gTxt('Preliminary estimates') ?>
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
          <option value="0"><?= $main->getCmsParam(VC::PROJECT_TITLE) ?></option>
          <?php foreach ($filterOptions as $option) { ?>
            <option value="<?= $option['id'] ?>"><?= $option['name'] ?></option>
          <?php } ?>
        </select>
      </div>
    <?php } ?>
  </div>

  <div class="mt-1 position-relative overflow-auto w-100">
    <button type="button" class="position-absolute top-0 btn btn-light pi pi-cog mt-2 p-2" style="z-index: +1" data-action="setupColumns"></button>
    <table id="orderTable" class="text-center table table-striped mb-0">
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <div class="mt-3" id="paginator"></div>
</div>
<div data-relation="!orderTemplateTable && orderTemplateKanban" class="d-none">
  <div class="d-flex align-items-center px-3 py-1">
    <div class="col-auto me-2"><?= gTxt('Searching') ?></div>
    <div class="col-2">
      <input id="searchText" class="form-control" placeholder="Enter search text" />
    </div>
    <div class="col-auto mx-2"><?= gTxt('Status') ?></div>
    <div class="col-2">
      <select id="filterSelect" class="form-select"></select>
    </div>
    <div class="col-auto mx-2"><?= gTxt('Sort By') ?></div>
    <div class="col-2 mx-2">
      <select id="sortField" class="form-select">
        <option value="Id"><?= gTxt('By id') ?></option>
        <option value="lastEditDate" selected><?= gTxt('By edit date') ?></option>
      </select>
    </div>
    <div class="col-2">
      <select id="sortDirect" class="form-select">
        <option value="Ascending"><?= gTxt('Ascending') ?></option>
        <option value="Descending" selected><?= gTxt('Descending') ?></option>
      </select>
    </div>
  </div>

  <div id="orderKanban" class="control-section">
    <div class="control_wrapper" style="max-width: 100%; overflow-x: auto; overflow-y: hidden">
      <div id="Kanban"></div>
    </div>

    <script id="cardTemplate" type="text/x-jsrender">
      <div class="d-flex flex-column justify-content-between p-1 lh-sm h-100">
        <div class="fw-bold text-center">${title}</div>
        <small class="fst-italic">${edited}</small>
        <div class="my-1">Менеджер: ${userName}</div>
        <div>Клиент: ${customerName}</div>
        <small class="d-block">${Summary}</small>
        <div class="text-end">${total}</div>
      </div>
    </script>
    <script id="dialogTemplate" type="text/x-template">
      <table>
        <tbody>
        <tr>
          <td class="label">Номер</td>
          <td><input id="Id" type="text" class="w-100" name="Id" value="${Id}" disabled required /></td>
        </tr>
        <tr>
          <td class="label">Статус</td>
          <td><input id="Status" type="text" class="w-100" name="Status" value=${Status} required /></td>
        </tr>
        <tr>
          <td class="label">Комментарий (нужен?)</td>
          <td>
            <textarea id="Summary" type="text"  class="w-100" name="Summary" value=${Summary}>${Summary}</textarea>
            <span class="e-float-line"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </script>
  </div>
</div>

<div class="position-fixed bottom-0 end-0 mb-5 d-none" id="selectedArea">
  <div class="d-inline bg-light p-1 me-1" title="<?= gTxt('Selected orders') ?>"></div>
  <button class="btn btn-danger pi pi-times" data-action="resetSelected"></button>
</div>

<div class="position-fixed bottom-0 end-0 m-2 d-none" id="wsConnectIcon">
  <i class="pi pi-circle-fill pi-green"></i>
</div>
