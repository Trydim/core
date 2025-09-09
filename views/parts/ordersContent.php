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
  <div class="kanban-header d-flex">
    <div class="kanban-column">
      <div class="kanban-fz-12"><?= gTxt('Searching') ?></div>
      <input id="searchText" class="form-control kanban-fz-12" placeholder="<?= gTxt('Enter search text') ?>" />
    </div>
    <div class="kanban-column">
      <div class="kanban-fz-12"><?= gTxt('Status') ?></div>
      <select id="filterSelect" class="form-select kanban-fz-12"></select>
    </div>
    <div class="kanban-column">
      <div class="kanban-fz-12"><?= gTxt('Sort By') ?></div>
      <select id="sortField" class="form-select kanban-fz-12">
        <option value="Id"><?= gTxt('By id') ?></option>
        <option value="lastEditDate" selected><?= gTxt('By edit date') ?></option>
      </select>
    </div>
    <div class="kanban-column align-self-end">
      <input id="sortDirectAsc" type="radio" class="btn-check" name="sortDirect" value="Ascending">
      <label for="sortDirectAsc" class="btn btn-sm btn-outline-secondary pi pi-sort-amount-down-alt"></label>
      <input id="sortDirectDesc" type="radio" class="btn-check" name="sortDirect" value="Descending">
      <label for="sortDirectDesc" class="btn btn-sm btn-outline-secondary pi pi-sort-amount-down"></label>
    </div>
  </div>

  <div id="orderKanban" class="control-section">
    <div class="control_wrapper" style="max-width: 100%; overflow-x: auto; overflow-y: hidden">
      <div id="Kanban"></div>
    </div>

    <script id="headerTemplate" type="text/x-jsrender">
      <div class="e-header-text fw-bold text-center w-100">
        <div>${headerText} (${count})</div>
      </div>
    </script>
    <script id="cardTemplate" type="text/x-jsrender">
      <div>
        <div class="e-card-header">${title}</div>
        <div class="">Создан: ${created}</div>
        <div class="mb-2">${edited}</div>
        <div class="">Клиент: <span class="color-main fw-bold">${customerName}</span></div>
        <div class="">Номер клиента: <span class="color-main fw-bold">${phone}</span></div>
        <div class="mb-2">Менеджер: <span class="color-main fw-bold">${userName}</span></div>
        <div class="">Стоимость: <span class="color-main fw-bold">${total}</span></div>

        <div class="e-card-action">
          <span class="e-card-action-btn" data-action="itemOpen">
            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path d="M14.1161 4.54138C14.4686 4.189 14.6666 3.71103 14.6667 3.21262C14.6668 2.71421 14.4688 2.23619 14.1165 1.88372C13.7641 1.53124 13.2861 1.33319 12.7877 1.33313C12.2893 1.33307 11.8113 1.531 11.4588 1.88338L2.56145 10.7827C2.40667 10.9371 2.29219 11.1271 2.22812 11.3361L1.34745 14.2374C1.33022 14.295 1.32892 14.3563 1.34369 14.4146C1.35845 14.473 1.38873 14.5262 1.43132 14.5687C1.4739 14.6112 1.5272 14.6414 1.58556 14.6561C1.64392 14.6708 1.70516 14.6694 1.76279 14.6521L4.66479 13.7721C4.87357 13.7086 5.06357 13.5948 5.21812 13.4407L14.1161 4.54138Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#979797" />
            </svg>
          </span>

          <span class="e-card-action-btn" data-action="itemPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14 4.5V14C14 14.5304 13.7893 15.0391 13.4142 15.4142C13.0391 15.7893 12.5304 16 12 16H11V15H12C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V4.5H11C10.6022 4.5 10.2206 4.34196 9.93934 4.06066C9.65804 3.77936 9.5 3.39782 9.5 3V1H4C3.73478 1 3.48043 1.10536 3.29289 1.29289C3.10536 1.48043 3 1.73478 3 2V11H2V2C2 1.46957 2.21071 0.960859 2.58579 0.585786C2.96086 0.210714 3.46957 0 4 0L9.5 0L14 4.5ZM1.6 11.85H0V15.849H0.791V14.507H1.594C1.88067 14.507 2.12467 14.4493 2.326 14.334C2.52933 14.2173 2.68367 14.0593 2.789 13.86C2.89879 13.6515 2.95417 13.4186 2.95 13.183C2.95 12.933 2.89733 12.7073 2.792 12.506C2.68648 12.307 2.52707 12.1417 2.332 12.029C2.132 11.909 1.888 11.8493 1.6 11.85ZM2.145 13.183C2.1484 13.3147 2.1192 13.4453 2.06 13.563C2.00692 13.6656 1.92392 13.7496 1.822 13.804C1.70551 13.8614 1.5768 13.8895 1.447 13.886H0.788V12.48H1.448C1.666 12.48 1.83667 12.5403 1.96 12.661C2.08333 12.783 2.145 12.957 2.145 13.183ZM3.362 11.85V15.849H4.822C5.22333 15.849 5.556 15.77 5.82 15.612C6.08716 15.4522 6.29577 15.2106 6.415 14.923C6.54567 14.623 6.611 14.2617 6.611 13.839C6.611 13.419 6.54567 13.0607 6.415 12.764C6.29693 12.4799 6.09038 12.2414 5.826 12.084C5.562 11.928 5.227 11.85 4.821 11.85H3.362ZM4.153 12.495H4.716C4.96333 12.495 5.16633 12.5457 5.325 12.647C5.48952 12.7555 5.61389 12.915 5.679 13.101C5.75767 13.3023 5.797 13.5533 5.797 13.854C5.8001 14.0534 5.77724 14.2524 5.729 14.446C5.69451 14.599 5.62768 14.7429 5.533 14.868C5.44599 14.9801 5.33072 15.0671 5.199 15.12C5.04465 15.1777 4.88074 15.2055 4.716 15.202H4.153V12.495ZM7.896 14.258V15.849H7.106V11.85H9.654V12.503H7.896V13.62H9.502V14.258H7.896Z" fill="#979797"/>
            </svg>
          </span>

          <span class="e-card-action-btn" data-action="itemExcel" >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_21_300)">
                <path d="M12.4272 1.088L11.4472 0H4.50006C3.73607 0 3.00006 0.697948 3.00006 1.5L2.95765 3.6392H4.04005V2C4.04005 1.46478 4.47653 1.0952 4.86988 1.0952H11.2667V1.3224V2.32137C11.2667 3.42594 12.1621 4.32137 13.2667 4.32137H13.8584H14.1136V14.1331C14.1136 14.5 13.8584 14.912 13.3752 14.912H4.63956C4.34381 14.912 4.04005 14.6367 4.04005 14.4141V13.824H2.96485V14.5C2.96485 15.5 3.79954 16 4.77392 16H13.5001C14.5001 16 15.1992 15.1064 15.1992 14.193V4.1496L14.9192 3.8456L12.4272 1.088ZM10.1968 8.5336H13.8584V9.6008H10.196L10.1968 8.5336ZM10.1968 6.4008H13.8584V7.4672H10.196L10.1968 6.4008ZM10.1968 10.6672H13.8584V11.7344H10.196L10.1968 10.6672ZM0.800049 4.5008V13.0344H9.17205V4.5008H0.800049ZM4.98645 9.464L4.47445 10.2464H4.98645V11.2H2.41285L4.28005 8.392L2.62565 5.8672H4.00805L4.98725 7.336L5.96565 5.8672H7.34725L5.68965 8.392L7.55925 11.2H6.12485L4.98645 9.464Z" fill="#979797"/>
              </g>
              <defs><clipPath id="clip0_21_300"><rect width="16" height="16" fill="white"/></clipPath></defs>
            </svg>
          </span>

          <span class="e-card-action-btn" data-action="itemView">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.37468 8.232C1.31912 8.08232 1.31912 7.91767 1.37468 7.768C1.91581 6.4559 2.83435 5.33402 4.01386 4.5446C5.19336 3.75517 6.58071 3.33374 8.00001 3.33374C9.41932 3.33374 10.8067 3.75517 11.9862 4.5446C13.1657 5.33402 14.0842 6.4559 14.6253 7.768C14.6809 7.91767 14.6809 8.08232 14.6253 8.232C14.0842 9.54409 13.1657 10.666 11.9862 11.4554C10.8067 12.2448 9.41932 12.6663 8.00001 12.6663C6.58071 12.6663 5.19336 12.2448 4.01386 11.4554C2.83435 10.666 1.91581 9.54409 1.37468 8.232Z" stroke="#979797" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#979797" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
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
<!--        <tr>
          <td class="label">Комментарий (нужен?)</td>
          <td>
            <textarea id="Summary" type="text"  class="w-100" name="Summary" value=${Summary}>${Summary}</textarea>
            <span class="e-float-line"></span>
          </td>
        </tr>-->
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
