<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var array $param
 */

$field['content'] = template('parts/usersContent', $param);
$field['pageFooter'] = '<div id="paginator"></div>';

$permission = $param['permission'];

$field['footerContent'] = <<<footerContent
<template id="permission">
  <option value="\${ID}">\${name}</option>
</template>
<template id="tableContactsValue">
  <div>\${key}: \${value}</div>
</template>
<template id="userForm">
  <form action="#">
    <div class="form-group">
      <label class="w-100">Имя пользователя: <input type="text" class="form-control" name="userName"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Доступ: 
        <select class="form-control" name="userPermission">$permission</select>
      </label>
    </div>
    <div class="form-group">
      <label class="w-100">Логин: <input type="text" class="form-control" name="userLogin"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Пароль: <input type="password" class="form-control" name="userPassword"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Телефон: <input type="tel" class="form-control" name="userPhone"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Почта: <input type="email" class="form-control" name="userMail"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Дополнительно: <textarea name="userMoreContact" class="form-control" ></textarea></label>
    </div>
    <div id="changeField">
      <label class="w-100">Активность: <input type="checkbox" name="userActivity"></label>
    </div>
  </form>
</template>

<template id="userChangePassForm">
  <form action="#">
    <!--label>Старый пароль: <input type="password" name="oldPass"></label-->
    <div class="form-group">
      <label class="w-100">Новый пароль: <input type="password" class="form-control" name="newPass"></label>
    </div>
    <div class="form-group">
      <label class="w-100">Повторить пароль: <input type="password" class="form-control" name="repeatPass"></label>
    </div>
  </form>
</template>
footerContent;

$field['footerContent'] .= $main->initDictionary();
