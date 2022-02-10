<?php
global $main;
$isAdmin = $main->getLogin('admin');
?>
<div class="row container m-auto" id="settingForm">
  <?php if ($isAdmin) { ?>
    <setting-mail :prop-mail="mail" @update="updateMail"></setting-mail>
  <?php } ?>

  <setting-user :user-fields="managerFields" @update="updateUser"></setting-user>

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
    <!-- Остальные опции -->
  <?php } ?>

  <div class="col-12 text-center">
    <p-button v-tooltip.bottom="'Сохранить'" icon="pi pi-save" class="p-button-primary m-3"
              label="Сохранить" @click="saveSetting"
    ></p-button>
  </div>

  <?php if ($main->availablePage('catalog')) { ?>
    <hr>
    <setting-properties @update="updateProperties"></setting-properties>
  <?php } ?>
</div>
