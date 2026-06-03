<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main
 * @var array $param - ['permission', 'managerField']
 */

$main->addControllerField(VC::BASE_CONTENT, template('parts/usersContent', $param));

// Users/Manager custom field
$managerField = [];

ob_start(); ?>
<template id="tableContactsValue">
  <div class="d-flex align-items-center justify-content-start gap-2"><div>${key}:</div><div>${value}</div></div>
</template>
<template id="userForm">
  <form action="#">
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="pName" placeholder="<?= gTxt('Full name') ?>" name="name" required>
      <label for="pName"><?= gTxt('Full name') ?></label>
    </div>

    <?php if (!empty($param['permission'])) { ?>
      <div class="form-floating mb-3">
        <select class="form-select" id="permissionId" name="permissionId">
          <?php foreach ($param['permission'] as $item) { ?>
            <option value="<?= $item['id'] ?>"><?= gTxt($item['name']) ?></option>
          <?php } ?>
        </select>
        <label for="permissionId"><?= gTxt('Permissions') ?></label>
      </div>
    <?php } ?>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="pLogin" placeholder="<?= gTxt('Login') ?>" name="login">
      <label for="pLogin"><?= gTxt('Login') ?></label>
    </div>

    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="pPassword" placeholder="<?= gTxt('Password') ?>" name="password" required>
      <label for="pPassword"><?= gTxt('Password') ?></label>
    </div>

    <div class="form-floating mb-3">
      <input type="tel" class="form-control" id="pPhone" placeholder="<?= gTxt('Phone') ?>" name="phone">
      <label for="pPhone"><?= gTxt('Phone') ?></label>
    </div>

    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="pEmail" placeholder="<?= gTxt('Email') ?>" name="email">
      <label for="pEmail"><?= gTxt('Email') ?></label>
    </div>

    <?php foreach ($param['managerField'] ?? [] as $k => $item) {
      $rndId = uniqid();
      switch ($item['type']) {
        case 'textarea': ?>
          <div class="form-floating managerField mb-3">
            <textarea id="<?= $rndId ?>" class="form-control" name="<?= $k ?>"></textarea>
            <label for="<?= $rndId ?>"><?= $item['name'] ?></label>
          </div>
        <?php break;
        case 'string': case 'number': case 'date': default: ?>
          <div class="form-floating managerField mb-3">
            <input id="<?= $rndId ?>" type="<?= $item['type'] ?>" class="form-control" name="<?= $k ?>">
            <label for="<?= $rndId ?>"><?= $item['name'] ?></label>
          </div>
        <?php break;
        case 'checkbox': ?>
          <div class="row managerField">
            <div class="col-12 col-md-6 ps-4">
              <label class="w-100" for="<?= $rndId ?>" role="button"><?= $item['name'] ?>:</label>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-check form-switch mb-3 text-center">
                <input type="checkbox" id="<?= $rndId ?>" class="form-check-input float-none" name="<?= $k ?>">
              </div>
            </div>
          </div>
        <?php break;
        case 'list': ?>
          <div class="form-floating managerField mb-3">
            <select name="<?= $k ?>" class="form-select">
              <?php foreach ($item['options'] as $option) { if (empty($option)) continue; ?>
                <option value="<?= htmlspecialchars($option) ?>"><?= htmlspecialchars($option) ?></option>
              <?php } ?>
            </select>
            <label id="<?= $rndId ?>"><?= $item['name'] ?></label>
          </div>
        <?php break;
        case 'csvTable':
          $o = $item['options'];
          $managerField[$k] = [];
          $data = loadCSV([$o['saveKey'] => $o['saveKey'], $o['showKey'] => $o['showKey']], $o['table']);

          if ($o['multiselect'] ?? false) { ?>
            <div class="form-control managerField mb-3" style="height: 60px; overflow: hidden auto; resize: vertical">
              <?php foreach ($data as $row) {
              $rndId = uniqid();
              $dK = $row[$o['saveKey']];
              $dV = $row[$o['showKey']];

              $managerField[$k][$dK] = $dV; ?>
                <div class="form-check">
                  <input type="checkbox" id="<?= $rndId ?>" class="form-check-input" name="<?= $k ?>" value="<?= $dK ?>">
                  <label class="form-check-label" for="<?= $rndId ?>"><?= $dV ?></label>
                </div>
              <?php } ?>
            </div>
          <?php } else { ?>
            <div class="form-floating managerField mb-3">
              <select class="form-select" name="<?= $k ?>">
                <?php foreach ($data as $row) {
                $dK = $row[$o['saveKey']];
                $dV = $row[$o['showKey']];

                $managerField[$k][$dK] = $dV; ?>
                  <option value="<?= htmlspecialchars($dK) ?>"><?= htmlspecialchars($dV) ?></option>
                <?php } ?>
              </select>
              <label id="<?= $rndId ?>"><?= $item['name'] ?></label>
            </div>
          <?php }
        break;
      }
    } ?>

    <div id="changeField" class="row">
      <div class="col-12 col-md-6 ps-4">
        <label class="w-100" for="pActivity" role="button"><?= gTxt('Activity') ?>:</label>
      </div>
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
      <input type="password" class="form-control" id="changePassword" placeholder="<?= gTxt('New password') ?>" name="newPass" required>
      <label for="changePassword"><?= gTxt('New password') ?></label>
    </div>

    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="repeatPassword" placeholder="<?= gTxt('Repeat password') ?>" name="repeatPass" required>
      <label for="repeatPassword"><?= gTxt('Repeat password') ?></label>
    </div>
  </form>
</template>
<?php $main->addControllerField(VC::BASE_FOOTER_CONTENT, ob_get_clean());

$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->getFrontContent('dataManagerField', $managerField))
     ->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary());
