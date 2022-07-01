<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var bool $showFilter - from controller
 * @var array $dealers - from controller
 */

$ordersColumns = $ordersColumns ?? [];
$ordersVisitorColumns = $ordersVisitorColumns ?? [];
?>
<div class="d-flex justify-content-between pb-4" id="actionBtnWrap">
  <div>
    <input type="button" class="btn btn-success oneOrderOnly" value="Редактировать" data-action="openOrder">
    <span id="orderBtn">
      <input type="button" class="btn btn-warning" value="Изменить Статус" data-action="changeStatusOrder">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Pdf" data-action="savePdf">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Печать" data-action="printReport">
      <input type="button" class="btn btn-primary oneOrderOnly" value="Отправить на почту" data-action="sendOrder">
    </span>
  </div>
  <div>
    <input type="button" class="btn btn-danger" value="Удалить" data-action="delOrders">
  </div>
</div>
<div class="pb-4 d-none" id="confirmField">
  <select id="selectStatus" class="d-none d-inline-block w-25 form-select" name="statusId"></select>
  <input type="button" class="btn btn-success" value="Подтвердить" data-action="confirmYes">
  <input type="button" class="btn btn-warning ms-1" value="Отмена" data-action="confirmNo">
</div>
<div class="pb-4 d-none" id="printTypeField">
  <input type="button" class="btn btn-primary"
         data-action="printReport" data-type="printType"
         value="Печать">
  <input type="button" class="btn btn-warning" data-action="cancelPrint" value="Отмена">
</div>
<?php if (isset($param['ordersVisitorColumns'])) { ?>
  <div class="d-flex pb-4" style="justify-content: left">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="orderType" value="order" id="orderTypeO" checked data-action="orderType">
      <label class="form-check-label" for="orderTypeO" title="Заказы сохраненные Менеджерами">
        Сохраненные заказы
      </label>
    </div>
    <div class="form-check ms-1">
      <input class="form-check-input" type="radio" name="orderType" value="visit" id="orderTypeV" data-action="orderType">
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
      <input type="text" id="search" class="form-control" value="" autocomplete="off">
    </div>
    <div class="col input-group">
      <?php if ($showFilter) { ?>
        <span class="input-group-text">Фильтр:</span>
        <select class="form-select" data-action="filterChange">
          <?php foreach ($dealers as $dealer) { ?>
            <option value="<?= $dealer['id'] ?>"><?= $dealer['name'] ?></option>
          <?php } ?>
        </select>
      <?php } ?>
    </div>
  </div>

  <table id="commonTable" class="text-center table table-striped"></table>

  <template id="orderTableTmp">
    <table>
      <thead>
        <tr>
          <th></th>
          <?php foreach ($ordersColumns as $item) { ?>
            <th>
              <input type="button" class="btn btn-info btn-sm table-th" value="<?= $item['name']; ?>" data-column="<?= $item['dbName']; ?>">
            </th>
          <?php } ?>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="checkbox" class="" data-id="${O.ID}"></td>
          <?php foreach ($ordersColumns as $item) { ?>
            <td>${<?= $item['dbName']; ?>}</td>
          <?php } ?>
        </tr>
      </tbody>
    </table>
  </template>

  <?php if (isset($param['ordersVisitorColumns'])) { ?>
  <template id="orderVisitorTableTmp">
    <table>
      <thead>
      <tr>
        <th></th>
        <?php foreach ($ordersVisitorColumns as $item) { ?>
          <th>
            <input type="button" class="btn btn-info btn-sm table-th" value="<?= $item['name']; ?>" data-column="<?= $item['dbName']; ?>">
          </th>
        <?php } ?>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td><input type="checkbox" class="" data-id="${cp_number}"></td>
        <?php foreach ($ordersVisitorColumns as $item) { ?>
          <td>${<?= $item['dbName']; ?>}</td>
        <?php } ?>
      </tr>
      </tbody>
    </table>
  </template>
  <?php } ?>
</div>
<div id="paginator" class="w-100"></div>
