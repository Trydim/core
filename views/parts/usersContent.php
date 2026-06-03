<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $permission from user.php
 */

$columns = ['id', 'permissionName', 'login', 'name', 'contacts', 'registerDate', 'activity'];

?>
<div class="d-flex justify-content-between mb-4 pt-1 position-sticky top-0 bg-white gap-5 gap-md-0" id="actionBtnWrap" style="z-index: +2">
  <div class="d-inline-flex flex-wrap gap-1">
    <input type="button" class="btn btn-success" value="<?= gTxt('Add') ?>" data-action="addUser">
    <input type="button" class="btn btn-warning" value="<?= gTxt('Change') ?>" data-action="changeUser">
    <input type="button" class="btn btn-warning" value="<?= gTxt('Change password') ?>" data-action="changeUserPassword">
  </div>
  <div>
    <input type="button" class="btn btn-danger" value="<?= gTxt('Delete') ?>" data-action="delUser">
  </div>
</div>

<!--<div class="col-6">
  <div class=" input-group">
    <span class="input-group-text"><?= gTxt('Search') ?>:</span>
    <input type="text" id="search" class="form-control" autocomplete="off">
  </div>
</div>-->

<div class="res-table overflow-auto w-100">
  <table id="usersTable" class="text-center table table-striped">
    <thead>
      <tr>
        <th></th>
        <?php foreach ($columns as $item) { ?>
          <th>
            <input type="button" class="btn btn-outline btn-sm table-th" value="<?=  gTxtDB('users', $item) ?>" data-column="<?= $item ?>">
          </th>
        <?php } ?>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" data-id="${id}"></td>
        <?php foreach ($columns as $item) { ?><td>${<?= $item ?>}</td><?php } ?>
      </tr>
    </tbody>
    <tfoot>
      <tr></tr>
    </tfoot>
  </table>
</div>
<div id="paginator" class="w-100"></div>
