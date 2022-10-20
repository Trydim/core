<?php

/**
 * @var Main $main - global
 */

$dbError = isset($_REQUEST['dbError']);
?>
<!DOCTYPE html>
<html lang="en" class="h-100">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Страница не найдена</title>
  <!-- Favicon icon -->
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/core/assets/css/admin.css">

</head>

<body class="h-100">
<div class="authincation h-100">
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
</body>

</html>
