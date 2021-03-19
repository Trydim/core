<?php
//$admin = false;

!isset($admin) && $admin = true;
!isset($userId) && $userId = '';
!isset($login) && $login = '';
!isset($orderMail) && $orderMail = '';
!isset($orderMailCopy) && $orderMailCopy = '';
?>
<div class="row" id="settingForm">
  <? if ($admin) { ?>
  <div class="col-6">
    <form action="#" id="mailForm" class="row">
      <div class="col-12 d-flex justify-content-between">
        <p>Почта для отправки заказов</p>
        <input type="email" name="orderMail" value="<?= $orderMail ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Копия письма</p>
        <input class="mt-1" type="email" name="orderMailCopy" value="<?= $orderMailCopy ?>">
      </div>
    </form>
  </div>
  <? } ?>

  <div class="col-6">
    <form action="#" id="userForm">
      <input type="hidden" name="priority" value="<?= $userId ?>">
      <div class="col-12 d-flex justify-content-between">
        <p>Логин</p>
        <input type="text" name="login" value="<?= $login ?>">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Новый Пароль</p>
        <input class="mt-1" type="password" name="password">
      </div>
      <div class="col-12 d-flex justify-content-between">
        <p class="mt-1">Повторите пароль</p>
        <input class="mt-1" type="password" name="passwordRepeat">
      </div>
    </form>
  </div>

  <div class="col-6">
    <form action="#" id="customForm" class="row">
      <div class="col-12 d-flex justify-content-between">
        <p>Тестовое поле</p>
        <input type="email" name="testField" value="test value">
      </div>
    </form>
  </div>

  <? if ($admin) { ?>
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
