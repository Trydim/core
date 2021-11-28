<?php
global $main;
$admin = $main->getSettings('admin');
$catalogProperties = in_array('catalog', $main->getSideMenu());
?>
<div class="row container m-auto" id="settingForm">
  <?php if ($admin) { ?>
  <div class="col-6 border">
    <form action="#" id="mailForm" class="col">
      <div class="form-floating my-3">
        <input type="text" class="form-control" id="orderMail" placeholder="Почта"
               name="orderMail" value="<?= $main->getSettings('orderMail') ?>">
        <label for="orderMail">Почта для получения заказов</label>
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="orderMailCopy" placeholder="Почта"
               name="orderMailCopy" value="<?= $main->getSettings('orderMailCopy') ?>">
        <label for="orderMailCopy">Копия письма</label>
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="orderMailSubject" placeholder="Почта"
               name="orderMailSubject" value="<?= $main->getSettings('orderMailSubject') ?>">
        <label for="orderMailSubject">Тема письма</label>
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="orderMailFromName" placeholder="Почта"
               name="orderMailFromName" value="<?= $main->getSettings('orderMailFromName') ?>">
        <label for="orderMailFromName">Имя отправителя</label>
      </div>
    </form>
  </div>
  <?php } ?>

  <div class="col-6 border">
    <form action="#" id="userForm" class="col">
      <input type="hidden" name="priority" value="<?= $main->getLogin('id') ?>">
      <div class="form-floating my-3">
        <input type="text" class="form-control" id="login" placeholder="Почта"
               name="login" value="<?= $main->getLogin() ?>">
        <label for="login">Логин</label>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" placeholder="Почта" name="password">
        <label for="password">Новый Пароль</label>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="passwordRepeat" placeholder="Почта" name="passwordRepeat">
        <label for="passwordRepeat">Повторите пароль</label>
      </div>

      <div class="form-floating mb-3 d-none">
        <input type="checkbox" class="form-control" id="onlyOne" placeholder="Почта" name="onlyOne" <?= $main->getSettings('onlyOne') ? 'checked' : '' ?>>
        <label for="onlyOne">Запретить одновременный вход</label>
      </div>
    </form>
  </div>

  <?php if ($admin && USE_DATABASE) {
    !isset($permStatus) && $permStatus = []; ?>
  <div class="col-6 border">
    <form action="#" class="col" id="permission">
      <?php if (isset($permIds)) { ?>
        <input type="hidden" name="permIds" value="<?= $permIds ?>">
      <?php } ?>
      <div class="input-group my-3">
        <span class="input-group-text">Добавить тип доступа</span>
        <input type="text" class="form-control" placeholder="Менеджер" name="permType">
        <button type="button" class="btn btn-outline-secondary" data-action="addPermType">
          <i class="pi pi-plus-circle pi-green align-text-bottom" data-action="addPermType"></i>
        </button>
      </div>

      <div class="input-group mb-3">
        <span class="input-group-text">Тип доступа</span>
        <select class="form-select" data-field="permTypes">
          <?php foreach ($permStatus as $item) { ?>
            <option value="<?= $item['ID'] ?>" data-target="perm<?= $item['ID'] ?>"><?= $item['name'] ?></option>
          <?php } ?>
        </select>
        <button type="button" class="btn btn-outline-secondary" data-action="removePermType">
          <i class="pi pi-trash pi-red align-text-bottom" data-action="removePermType"></i>
        </button>
      </div>
      <?php foreach ($permStatus as $item) { ?>
      <div class="input-group mb-3" data-relation="perm<?= $item['ID'] ?>">
        <span class="input-group-text">Доступные меню</span>
        <select class="form-select" name="permMenuAccess_<?= $item['ID'] ?>" multiple size="5">
          <?php foreach ($main->getSideMenu() as $menu) { ?>
            <option value="<?= $menu ?>"><?= gTxt($menu) ?></option>
          <?php } ?>
        </select>
      </div>
      <?php } ?>
    </form>
  </div>

  <div class="col-6 border">
    <form action="#" id="managerForm" class="col">
      <div class="input-group my-3">
        <span class="input-group-text flex-grow-1">Дополнительные поля менеджеров</span>
        <button type="button" class="btn btn-outline-secondary" data-action="addCustomManagerField">
          <i class="pi pi-plus-circle align-text-bottom pi-green" data-action="addCustomManagerField"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" data-action="removeCustomManagerField">
          <i class="pi pi-times-circle align-text-bottom pi-red" data-action="removeCustomManagerField"></i>
        </button>
      </div>
      <div class="col" data-field="customField"></div>
    </form>
  </div>
  <?php } ?>

  <?php if ($admin && USE_DATABASE) { ?>
    <div class="col-6 border">
      <form action="#" id="rateForm" class="col">
        <div class="input-group my-3">
          <span class="input-group-text flex-grow-1">Автоматически обновлять курсы</span>
          <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" name="autoRefresh" checked data-target="manualRefresh">
          </div>
        </div>
        <div class="col-12 text-center mb-3" data-relation="!manualRefresh">
          <input type="button" class="btn btn-primary" value="Редактировать курсы" data-action="loadRate">
        </div>
      </form>
    </div>
  <?php } ?>

  <?php if ($admin && false) { ?>
    <div class="col-6 border">
      <div class="col-12 text-center">Статусы</div>
      <div class="col-12">
        <select name="">

        </select>
      </div>
    </div>
  <? } ?>

  <div class="col-12 text-center">
    <input type="button" class="btn btn-primary m-3" value="Сохранить" data-action="save">
  </div>

  <?php if ($catalogProperties) { ?>
    <div class="col-12" id="propertiesWrap">
      <hr>
      <details>
        <summary data-action="loadProperties">
          Редактировать параметры каталога
        </summary>
        <div>
          <table id="propertiesTable" class="table table-striped table-hover text-center">
            <thead>
            <tr>
              <th></th>
              <th>Свойство</th>
              <th>Код</th>
              <th>Тип</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td><input type="checkbox" class="" data-id="${property}"></td>
              <td>${name}</td>
              <td>${property}</td>
              <td>${type}</td>
            </tr>
            </tbody>
          </table>
          <div class="my-3 text-center">
            <input class="btn btn-success" type="button" value="Добавить" data-action="createProperty">
            <input class="btn btn-warning" type="button" value="Изменить" data-action="changeProperty">
            <input class="btn btn-danger" type="button" value="Удалить" data-action="delProperties">
          </div>
        </div>
      </details>
    </div>
  <?php } ?>
</div>

<?php if ($catalogProperties) { ?>
<template id="propertiesCreateTmp">
  <form action="#" id="temp">
    <div class="input-group my-3">
      <span class="input-group-text">Название свойства</span>
      <input type="text" class="form-control" placeholder="Название свойства" name="tableName">
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text">Код свойства</span>
      <input type="text" class="form-control" placeholder="Название свойства" name="tableCode">
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text">Код свойства</span>
      <select class="form-select useToggleOption" name="dataType" data-field="propertyType">
        <optgroup label="Простые">
          <option value="s_text" data-target="">Текст (~200 символов)</option>
          <option value="s_textarea">Текст (много)</option>
          <option value="s_number">Число</option>
          <option value="s_date">Дата</option>
          <option value="s_bool">Флаг (Да/Нет)</option>
        </optgroup>
        <optgroup label="Составные">
          <option value="h_select" data-target="selectField">Справочник</option>
        </optgroup>
      </select>
    </div>

    <div class="form-group" data-relation="selectField">
      <div class="input-group mb-3">
        <span class="input-group-text flex-grow-1">Дополнительные поля параметра (имя есть)</span>
        <button type="button" class="btn btn-outline-secondary" data-action="addCol">
          <i class="pi pi-plus-circle align-text-bottom pi-green" data-action="addCol"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" data-action="remCol">
          <i class="pi pi-times-circle align-text-bottom pi-red" data-action="remCol"></i>
        </button>
      </div>
      <div class="col-12" data-field="propertiesCols">
        <div class="input-group mb-3" data-field="propertiesColItem">
          <input type="text" class="form-control" data-field="key">
          <select class="form-select" data-field="type">
            <option value="string">Текст (~200 символов)</option>
            <option value="textarea">Текст (много)</option>
            <option value="double">Число</option>
            <option value="money">Число</option>
            <option value="date">Дата</option>
            <option value="file">Файл</option>
            <option value="bool">Флаг</option>
          </select>
        </div>
      </div>
    </div>
  </form>
</template>
<?php } ?>
