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

  $managerFieldHtml .= '<div class="form-floating managerField mb-3">' . $input .
                       '<label id="' . $rndId . '">' . $item['name'] .'</label></div>';
}

$field['footerContent'] .= '
<template id="permission">
  <option value="${ID}">${name}</option>
</template>
<template id="tableContactsValue">
  <div>${key}: ${value}</div>
</template>
<template id="userForm">
  <form action="#">
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="pName" placeholder="' . gTxt('Name') . '" name="name" required>
      <label for="pName">' . gTxt('Name') . '</label>
    </div>

    <div class="form-floating mb-3">
      <select class="form-select" id="permissionId" name="permissionId">$permission</select>
      <label for="permissionId">' . gTxt('Permission') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="pLogin" placeholder="' . gTxt('Login') . '" name="login" required>
      <label for="pLogin">' . gTxt('Login') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="pPassword" placeholder="' . gTxt('Password') . '" name="password" required>
      <label for="pPassword">' . gTxt('Password') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="tel" class="form-control" id="pPhone" placeholder="' . gTxt('Phone') . '" name="phone" required>
      <label for="pPhone">' . gTxt('Phone') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="pEmail" placeholder="' . gTxt('Email') . '" name="email" required>
      <label for="pEmail">' . gTxt('Email') . '</label>
    </div>' .
    $managerFieldHtml
    . '<div id="changeField" class="row">
      <div class="col-6 ps-4">
        <label class="w-100" for="pActivity" role="button">' . gTxt('Activity') . ':</label>
      </div>
      <div class="col-6">
        <div class="form-check form-switch mb-3 formRow text-center">
          <input class="form-check-input float-none" type="checkbox" role="switch" name="activity" id="pActivity">
        </div>
      </div>
    </div>
  </form>
</template>
<template id="userChangePassForm">
  <form action="#">
    <!--label>Старый пароль: <input type="password" name="oldPass"></label-->
    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="changePassword" placeholder="' . gTxt('New password') . '" name="newPass" required>
      <label for="changePassword">' . gTxt('New password') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="repeatPassword" placeholder="' . gTxt('Repeat password') . '" name="repeatPass" required>
      <label for="repeatPassword">' . gTxt('Repeat password') . '</label>
    </div>
  </form>
</template>';

$field['footerContent'] .= $main->initDictionary();
