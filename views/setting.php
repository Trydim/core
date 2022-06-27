<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var $admin - from controller
 */

$isAdmin = $main->getLogin('admin');

ob_start();
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

  <div class="col-12 text-center">
    <p-button v-tooltip.bottom="'Сохранить'" icon="pi pi-save" class="p-button-primary m-3"
              label="Сохранить" @click="saveSetting"
    ></p-button>
  </div>

  <?php if ($main->availablePage('catalog')) { ?>
    <hr>
    <setting-properties :query="query" :query-param="queryParam" @update="updateProperties"></setting-properties>
  <?php } ?>
</div>
<?php
$field['content'] = ob_get_clean();
