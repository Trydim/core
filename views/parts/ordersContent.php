<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var bool $showFilter - from controller
 * @var array $dealers - from controller
 */

?>
<div class="d-flex justify-content-between pb-4" id="actionBtnWrap">
  <div class="">
    <input type="button" class="btn btn-success oneOrderOnly mainOnly" value="Редактировать" data-action="openOrder">
    <span id="orderBtn">
      <input type="button" class="btn btn-warning mainOnly" value="Изменить Статус" data-action="changeStatusOrder">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Pdf" data-action="savePdf">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Печать" data-action="printOrder">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Отправить на почту" data-action="sendOrder">
    </span>
  </div>
  <div>
    <input type="button" class="btn btn-danger mainOnly" value="Удалить" data-action="delOrders">
  </div>
</div>
<div class="pb-4 d-none" id="confirmField">
  <label><select id="selectStatus" class="d-none form-select" data-action="statusOrders"></select></label>
  <input type="button" class="btn btn-success" value="Подтвердить" data-action="confirmYes">
  <input type="button" class="btn btn-warning ms-1" value="Отмена" data-action="confirmNo">
</div>
<?php if (isset($param['ordersVisitorColumns'])) { ?>
  <div class="d-flex pb-4" style="justify-content: left">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="orderType" value="order" id="orderTypeO" checked data-action="orderTypeChange">
      <label class="form-check-label" for="orderTypeO" title="Заказы сохраненные Менеджерами">
        Сохраненные заказы
      </label>
    </div>
    <div class="form-check ms-1">
      <input class="form-check-input" type="radio" name="orderType" value="visit" id="orderTypeV" data-action="orderTypeChange">
      <label class="form-check-label" for="orderTypeV" title="Уникальные расчеты посетителей">
        Пользовательские заказы
      </label>
    </div>
  </div>
<?php } ?>
<div class="res-table">
  <div class="row">
    <div class="col input-group">
      <span class="input-group-text">Поиск:</span>
      <input type="text" id="search" class="form-control" autocomplete="off">
    </div>
    <div class="col input-group">
      <?php if ($showFilter) { ?>
        <span class="input-group-text">Фильтр:</span>
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
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
    <!--<button type="button" class="position-absolute end-0 top-0 btn btn-light pi pi-cog m-2" style="z-index: +1" data-action="setupColumns"></button>-->
  </div>

  <?php if (isset($param['ordersVisitorColumns'])) { ?>
    <table id="orderVisitorTableTmp">
      <thead><tr></tr></thead>
      <tbody></tbody>
    </table>
  <?php } ?>

  <template id="orderColumnsTableTmp">
    <div>
      <?php foreach ($ordersColumns as $item) { ?>
        <div class="input-group mb-3">
          <div class="input-group-text">
            <input class="form-check-input mt-0" id="<?= $item['dbName'] ?>" type="checkbox" value="<?= $item['dbName'] ?>">
          </div>
          <label class="input-group-text flex-grow-1" for="<?= $item['dbName'] ?>">
            <?= $item['name']; ?>
          </label>
        </div>
      <?php } ?>
    </div>
  </template>

</div>
<div id="paginator" class="w-100"></div>
