<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var boolean $wrongPass - from controller
 * @var string $login - from Request
 * @var string $pass - from Request
 */

!isset($pageTarget) && $pageTarget = '';
$actionLink = 'index.php';
$wrongString = $wrongPass ? '<div class="alert alert-danger text-center" role="alert"><i class="pi pi-info-circle pi-red me-1"></i>Неправильный логин или пароль</div><br>' : '';

$publicLink = !ONLY_LOGIN && PUBLIC_PAGE ? '<a class="text-primary" href="/' . PUBLIC_PAGE . '">Открытая страница</a>' : '';

/* Исользовать global что бы в базовом шаблоне не использовать структуру (надо будет инструкцию потом написать) */
$field['global'] = <<<global
<main class="position-fixed h-100 w-100">
  <section class="content-center h-100">
    <div class="authincation-content auth-form col-md-5">
      <h4 class="text-center mb-4"><i class="pi pi-user"></i> Авторизация</h4>
      $wrongString
      <form action="$actionLink" method="POST" id="authForm">
        <div class="form-group">
          <label><strong>Логин</strong></label>
          <input name="login" type="text" class="form-control" value="$login">
        </div>
        <div class="form-group mt-1">
          <label><strong>Пароль</strong></label>
          <input name="password" type="password" class="form-control" value="">
        </div>
        <div class="form-row d-flex justify-content-between mt-4 mb-2">
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
          <button type="submit" class="btn btn-primary btn-block" onclick="this.classList.add(f.CLASS_NAME.LOADING)">Подтвердить</button>
        </div>

        <input name="mode" type="hidden" value="auth">
        <input name="authAction" type="hidden" value="login">
        <input name="clientPageTarget" type="hidden" value="$pageTarget">
      </form>
      <div class="new-account mt-3">
        <p>$publicLink</p>
      </div>

    </div>
  </section>
</main>
global;
