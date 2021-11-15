<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var array $param
 * @var array $permission
 * @var array $managerField
 */

$field['content'] = template('parts/usersContent', $param);

// Users/Manager custom field
$managerFieldHtml = '';
foreach ($managerField as $k => $item) {
  $rndId = uniqid();
  switch ($item['type']) {
    case 'textarea':
      $input = '<textarea name="' . $k . '" class="form-control"></textarea>';
      break;
    case 'string': case 'number': case 'date': default:
      $input = '<input id="' . $rndId . '" type="' . $item['type'] . '" class="form-control" name="' . $k . '">';
      break;
  }

  $managerFieldHtml .= '<div class="form-floating managerField">' . $input .
                       '<label id="' . $rndId . '">' . $item['name'] .'</label></div>';
}

$field['footerContent'] = <<<footerContent
<template id="permission">
  <option value="\${ID}">\${name}</option>
</template>
<template id="tableContactsValue">
  <div>\${key}: \${value}</div>
</template>
<template id="userForm">
  <form action="#">
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="pName" placeholder="Имя" name="name">
      <label for="pName">Имя</label>
    </div>
    
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">Доступ</span>
      <select class="form-control form-select" name="permissionId">$permission</select>
    </div>
    
    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="pLogin" placeholder="Логин" name="login">
      <label for="pLogin">Логин</label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="pPassword" placeholder="Пароль" name="password">
      <label for="pPassword">Пароль</label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="tel" class="form-control" id="pPhone" placeholder="Телефон" name="phone">
      <label for="pPhone">Телефон</label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="pEmail" placeholder="Почта" name="email">
      <label for="pEmail">Почта</label>
    </div>
    
    $managerFieldHtml
    
    <div id="changeField" class="form-check">
      <input class="form-check-input" type="checkbox"  name="activity" id="pActivity">
      <label class="form-check-label" for="pActivity">Активность</label>
    </div>
  </form>
</template>
<template id="userChangePassForm">
  <form action="#">
    <!--label>Старый пароль: <input type="password" name="oldPass"></label-->
    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="changePassword" placeholder="Новый пароль" name="newPass">
      <label for="changePassword">Новый пароль</label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="changePassword" placeholder="Повторить пароль" name="repeatPass">
      <label for="changePassword">Повторить пароль</label>
    </div>
  </form>
</template>
footerContent;

$field['footerContent'] .= $main->initDictionary();
