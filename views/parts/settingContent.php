<?php
global $main;
$admin = $main->getSettings('admin');
?>
<div class="row container m-auto" id="settingForm">
  <? if ($admin) { ?>
  <div class="col-6">
    <form action="#" id="mailForm" class="row">
      <div class="col-12 d-flex justify-content-between">
        <p>Почта для получения заказов</p>
        <input type="email" name="orderMail" value="<?= $main->getSettings('orderMail') ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Копия письма</p>
        <input class="mt-1" type="email" name="orderMailCopy" value="<?= $main->getSettings('orderMailCopy') ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Тема письма</p>
        <input class="mt-1" type="text" name="orderMailSubject" value="<?= $main->getSettings('orderMailSubject') ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Имя отправителя</p>
        <input class="mt-1" type="text" name="orderMailFromName" value="<?= $main->getSettings('orderMailFromName') ?>">
      </div>
    </form>
  </div>
  <? } ?>

  <div class="col-6">
    <form action="#" id="userForm">
      <input type="hidden" name="priority" value="<?= $main->getLogin('id') ?>">
      <div class="col-12 d-flex justify-content-between">
        <p>Логин</p>
        <input type="text" name="login" value="<?= $main->getLogin() ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Новый Пароль</p>
        <input class="mt-1" type="password" name="password">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Повторите пароль</p>
        <input class="mt-1" type="password" name="passwordRepeat">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1" >Запретить одновременный вход</p>
        <label class="d-block w-50 text-center">
          <input class="mt-1" type="checkbox" name="onlyOne" <?= $main->getSettings('onlyOne') ? 'checked' : '' ?>>
        </label>
      </div>
    </form>
  </div>

  <? if ($admin) {
    !isset($permStatus) && $permStatus = []; ?>
  <div class="col-6">
    <form action="#" class="row" id="permission">
      <? if (isset($permIds)) { ?>
        <input type="hidden" name="permIds" value="<?= $permIds ?>">
      <? } ?>
      <div class="col-12 d-flex justify-content-between">
        <div>Тип доступа</div>
        <select class="w-50 useToggleOption">
          <? foreach ($permStatus as $item) { ?>
            <option value="<?= $item['ID'] ?>" data-target="perm<?= $item['ID'] ?>"><?= $item['name'] ?></option>
          <? } ?>
        </select>
      </div>
      <? foreach ($permStatus as $item) { ?>
      <div class="col-12 d-flex justify-content-between mt-1 perm<?= $item['ID'] ?>">
        <div>Доступные меню</div>
        <select name="permMenuAccess_<?= $item['ID'] ?>" multiple size="5" class="w-50">
          <? foreach ($main->getSideMenu() as $menu) { ?>
            <option value="<?= $menu ?>"><?= gTxt($menu) ?></option>
          <? } ?>
        </select>
      </div>
      <? } ?>
    </form>
  </div>

  <div class="col-6">
    <form action="#" id="managerForm" class="row">
      <div class="col-12 d-flex justify-content-between">
        <p class="col-8">Дополнительные поля менеджеров</p>
        <div class="col-4">
          <input type="button" data-action="addCustomManagerField" value="+">
          <input type="button" data-action="removeCustomManagerField" value="-">
        </div>
      </div>
      <div class="col-12 d-flex flex-wrap justify-content-between text-center" data-field="customField"></div>
    </form>
  </div>
  <? } ?>

  <input type="button" class="btn btn-primary" value="Сохранить" data-action="save">
</div>

<template id="customField">
  <div class="col-12 d-flex justify-content-between mt-1" data-field="customFieldItem">
    <div class="col-6">
      <input type="text" data-field="key">
    </div>
    <div class="col-6">
      <select class="w-100" data-field="type">
        <option value="string">Текст (~200 символов)</option>
        <option value="textarea">Текст (много)</option>
        <option value="number">Число</option>
        <option value="date">Дата</option>
      </select>
    </div>
  </div>
</template>
