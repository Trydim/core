<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var $param - from controller c_dealers.php
 */

if (!isset($param['isDBEditor'])) { ?>
  <div id="dealerApp" v-cloak></div>
<?php } else { ?>
  <form id="editDb" action="/" method="post" class="container-fluid row">
    <input type="hidden" name="mode" value="DB">
    <input type="hidden" name="cmsAction" value="dealersDatabaseEdit">

    <div class="col-8">
      <label class="d-block mb-1">
        Ключ безопастности
        <input type="password" name="safeKey" value="123">
      </label>

      <label class="w-100">
        <textarea name="sqlText" class="w-100" rows="10"></textarea>
      </label>
      <p class="pointer" onclick="">### - разделение ; $prefix</p>
    </div>
    <div class="col-4">
      <?php foreach ($param['dealerList'] AS $item) { ?>
        <label class="d-block">
          <input type="checkbox" name="selectedDealer[]" value="<?= $item['id'] ?>">
          <?= $item['id'] . '. ' . $item['name'] ?>
        </label>
      <? } ?>
    </div>

    <div class="col-12">
      <button class="btn btn-primary">Выполнить</button>
    </div>
  </form>
  <div id="reportArea"></div>
<?php } ?>

