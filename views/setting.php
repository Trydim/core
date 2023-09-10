<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$isAdmin = $main->getLogin('isAdmin');
?>
<div class="row container m-auto" id="settingForm">
  <?php if ($isAdmin) { ?>
    <setting-mail :prop-mail="mail" @update="updateMail"></setting-mail>
  <?php } ?>

  <setting-user :user-data="user" :user-fields="managerFields" @update="updateUser"></setting-user>

  <?php if ($main->availablePage('users') && $isAdmin) { ?>
    <setting-permission @update="updatePermission"></setting-permission>

    <setting-manager-field :prop-fields="managerFields" @update="updateManagerFields"></setting-manager-field>
  <?php } ?>

  <?php if ($isAdmin && USE_DATABASE) { ?>
    <setting-rate @update="updateRate"></setting-rate>
  <?php } ?>

  <?php if ($isAdmin && $main->availablePage('orders')) { ?>
    <setting-order-status :prop-status-def="statusDefault" @update="updateOrderStatus"></setting-order-status>
  <?php } ?>

  <?php if ($isAdmin) { ?>
    <setting-other :prop-other-fields="otherFields" @update="updateOtherFields"></setting-other>
  <?php } ?>

  <?php if ($isAdmin && $main->availablePage('orders') && false) { ?>
    <setting-tokens @update=""></setting-tokens>
  <?php } ?>

  <div class="col-12 text-center">
    <p-button v-tooltip.bottom="$t('Save')" icon="pi pi-save" class="p-button-primary m-3" :label="$t('Save')" @click="saveSetting"></p-button>
  </div>
  <hr>

  <?php if ($main->availablePage('catalog')) { ?>
    <setting-properties type="catalog" :query="query" :query-param="queryParam" @update="updateProperties"></setting-properties>
  <?php } ?>

  <?php if ($main->availablePage('dealers')) { ?>
    <setting-properties type="dealer" title="" :query="query" :query-param="queryParam" @update="updateDealersProperties"></setting-properties>
  <?php } ?>
</div>
