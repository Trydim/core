<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$isGlobal = true;
$sitePath = $main->url->getUri();
$login    = $_REQUEST['login'] ?? '';
$dealers  = $dealers ?? [];
?>
<main class="position-fixed h-100 w-100">
  <section class="content-center h-100">
    <div class="authentication-content auth-form col-10 col-md-5">
      <h4 class="text-center mb-4"><i class="pi pi-user"></i> Авторизация</h4>
      <?php if ($main->checkStatus('error')) { ?>
        <div class="alert alert-danger text-center" role="alert">
          <i class="pi pi-info-circle pi-red me-1"></i>Неправильный логин или пароль
        </div><br>
      <?php } ?>

      <form action="<?= $sitePath ?>index.php" method="POST" id="authForm">

        <div class="form-group mt-1 mb-2">
          <label><strong>Логин</strong></label>
          <input name="login" type="text" class="form-control" value="<?= $login ?>">
        </div>
        <div class="form-group mt-1 mb-2">
          <label><strong>Пароль</strong></label>
          <input name="password" type="password" class="form-control" value="">
        </div>
        <div class="form-row d-flex justify-content-between mt-4 mb-2 d-none">
          <div class="form-group">
            <div class="form-check ml-2">
              <input class="form-check-input" type="checkbox" name="remember" id="basic_checkbox_1">
              <label class="form-check-label" for="basic_checkbox_1">Запомнить меня</label>
            </div>
          </div>
          <div class="form-group">
            <a href="forgot">Забыли пароль?</a>
          </div>
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-primary btn-block w-100" onclick="this.classList.add('loading-st1')">Подтвердить</button>
        </div>

        <input name="mode" type="hidden" value="auth">
        <input name="cmsAction" type="hidden" value="login">
      </form>
      <?php if (!$main->getCmsParam(VC::ONLY_LOGIN) && PUBLIC_PAGE) { ?>
        <div class="new-account mt-3">
          <a class="text-primary" href="<?= $sitePath ?>">Открытая страница</a>
        </div>
      <?php } ?>
    </div>
  </section>
</main>
