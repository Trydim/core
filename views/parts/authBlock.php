<?php global $main;
if (isset($main)) { ?>
  <div class="auth-block">
	<?php if ($main->checkStatus('ok')) { ?>
    <div>
      <?= $main->getLogin(); ?>
      <input type="button" data-action="exit" value="выйти">
    </div>
  <?php } else { ?>
		<a href="<?= SITE_PATH?>login">Войти</a>
  <?php } ?>
  </div>
<?php } ?>
