<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main
 * @var array $param - ['columns', 'permission', 'managerField']
 */

$field['content'] = template('parts/usersContent', $param);

// Users/Manager custom field
$managerFieldHtml = '';
$managerField = [];
foreach ($param['managerField'] as $k => $item) {
  $rndId = uniqid();
  switch ($item['type']) {
    case 'textarea':
      $input = '<textarea name="' . $k . '" class="form-control"></textarea>';
      break;
    case 'string': case 'number': case 'date': default:
      $input = '<input id="' . $rndId . '" type="' . $item['type'] . '" class="form-control" name="' . $k . '">';
      break;
    case 'checkbox':
      $managerFieldHtml .= '<div class="row managerField">
        <div class="col-12 col-md-6 ps-4">
          <label class="w-100" for="' . $rndId . '">' . $item['name'] .':</label>
        </div>
        <div class="col-12 col-md-6">
          <div class="form-check form-switch mb-3 text-center">
            <input type="checkbox" id="' . $rndId . '" class="form-check-input float-none" name="' . $k . '">
          </div>
        </div>
      </div>';
      continue 2;
    case 'list':
      $input = '<select name="' . $k . '" class="form-select">';
      foreach ($item['options'] as $option) {
        if (empty($option)) continue;
        $input .= '<option value="' . htmlspecialchars($option) . '">' .  htmlspecialchars($option) . '</option>';
      }
      $input .= '</select>';
      break;
    case 'csvTable':
      $o = $item['options'];
      $managerField[$k] = [];
      $data = loadCSV([$o['saveKey'] => $o['saveKey'], $o['showKey'] => $o['showKey']], $o['table']);

      if ($o['multiselect'] ?? false) {
        $managerFieldHtml .= '<div class="form-control managerField mb-3" style="height: 60px; overflow: hidden auto; resize: vertical">'; //  ' . ($o['multiselect'] ?? false ? 'multiple style="resize: vertical"' : '') . '>'
        foreach ($data as $row) {
          $rndId = uniqid();
          $dK = $row[$o['saveKey']];
          $dV = $row[$o['showKey']];

          $managerField[$k][$dK] = $dV;
          $managerFieldHtml .= '
          <div class="form-check">
            <input type="checkbox" id="' . $rndId . '" class="form-check-input"  name="' . $k . '" value="' . $dK . '">
            <label class="form-check-label" for="' . $rndId . '">' . $dV .'</label>
          </div>';
        }
        $managerFieldHtml .= '</div>';
        continue 2;
      } else {
        $input = '<select class="form-select" name="' . $k . '">';
        foreach ($data as $row) {
          $dK = $row[$o['saveKey']];
          $dV = $row[$o['showKey']];

          $managerField[$k][$dK] = $dV;
          $input .= '<option value="' . htmlspecialchars($dK) . '">' . htmlspecialchars($dV) . '</option>';
        }
        $input .= '</select>';
      }

      break;
  }

  $managerFieldHtml .= '<div class="form-floating managerField mb-3">' . $input .
                       '<label id="' . $rndId . '">' . $item['name'] .'</label></div>';
}
unset($k, $dK, $dV, $item, $rndId, $data, $o, $row, $input);

$field[VC::BASE_FOOTER_CONTENT] .= $main->getFrontContent('dataManagerField', $managerField);

$field[VC::BASE_FOOTER_CONTENT] .= '
<template id="permission">
  <option value="${ID}">${name}</option>
</template>
<template id="tableContactsValue">
  <div class="d-flex align-items-center justify-content-center gap-2"><div>${key}:</div><div>${value}</div></div>
</template>
<template id="userForm">
  <form action="#">
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="pName" placeholder="' . gTxt('User name') . '" name="name" required>
      <label for="pName">' . gTxt('User name') . '</label>
    </div>

    <div class="form-floating mb-3">
      <select class="form-select" id="permissionId" name="permissionId">' . $param['permission'] . '</select>
      <label for="permissionId">' . gTxt('Permission') . '</label>
    </div>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="pLogin" placeholder="' . gTxt('Login') . '" name="login">
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
      <div class="col-12 col-md-6 ps-4">' . gTxt('Activity') . ':</div>
      <div class="col-12 col-md-6">
        <div class="form-check form-switch mb-3 text-center">
          <label class="w-100">
            <input class="form-check-input float-none" type="checkbox" role="switch" name="activity" id="pActivity">
          </label>
        </div>
      </div>
    </div>
  </form>
</template>
<template id="userChangePassForm">
  <form action="#">
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

$field[VC::BASE_FOOTER_CONTENT] .= $main->initDictionary();
