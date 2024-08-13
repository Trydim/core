<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var string $permission from user.php
 */

?>
<div class="d-flex justify-content-between pb-4" id="actionBtnWrap">
  <div class="d-inline-flex flex-wrap gap-1">
    <input type="button" class="btn btn-success" value="<?= gTxt('Add') ?>" data-action="addUser">
    <input type="button" class="btn btn-warning" value="<?= gTxt('Change') ?>" data-action="changeUser">
    <input type="button" class="btn btn-warning" value="<?= gTxt('Change password') ?>" data-action="changeUserPassword">
  </div>
  <div>
    <input type="button" class="btn btn-danger" value="<?= gTxt('Delete') ?>" data-action="delUser">
  </div>
</div>
<div class="text-center d-none" id="confirmField">
  <select id="selectPermission" class="d-none"><?= $permission; ?></select>
  <input type="button" class="btn btn-success" value="<?= gTxt('Confirm') ?>" data-action="confirmYes">
  <input type="button" class="btn btn-warning" value="<?= gTxt('Cancel') ?>" data-action="confirmNo">
</div>
<div class="res-table overflow-auto w-100">
  <table id="usersTable" class="text-center table table-striped">
    <thead>
      <tr>
        <th></th>
        <?php if (isset($columns)) foreach ($columns as $item) { ?>
          <th>
            <input type="button" class="btn btn-info btn-sm table-th" value="<?= $item['name']; ?>" data-column="<?= $item['dbName']; ?>">
          </th>
        <?php } ?>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" class="" data-id="${ID}"></td>
        <?php if (isset($columns)) foreach ($columns as $item) { ?>
          <td>${<?= $item['dbName']; ?>}</td>
        <?php } ?>
      </tr>
    </tbody>
    <tfoot>
      <tr></tr>
    </tfoot>
  </table>
</div>
<div id="paginator" class="w-100"></div>
