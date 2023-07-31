<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$isGlobal = true;
$dbError = isset($_REQUEST['dbError']);
?>
<div class="authentication" style="height: 100vh">
  <div class="container-fluid h-100">
    <div class="row justify-content-center h-100 align-items-center">
      <div class="col-md-5">
        <?php if (!$dbError) { ?>
        <div class="form-input-content text-center">
          <div class="mb-5">
            <a class="btn btn-primary" href="<?= $main->url->getUri() ?>">Главная</a>
          </div>
          <h1 class="error-text font-weight-bold">404</h1>
          <h4 class="mt-4">
            <i class="pi pi-ban pi-danger"></i> Страница не найдена!
          </h4>
          <p>You may have mistyped the address or the page may have moved.</p>
        </div>
        <?php } else { ?>
        <div class="form-input-content text-center">
          <div class="mb-5">
            <a class="btn btn-primary" href="/">Главная</a>
          </div>
          <h1 class="error-text font-weight-bold">500</h1>
          <h4 class="mt-4">
            <i class="pi pi-ban pi-danger"></i> Ошибка подключения Базы Данных!
          </h4>
          <p>Обратитесь к администратору!</p>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>
</div>
