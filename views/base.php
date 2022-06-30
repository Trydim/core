<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $vars extract param
 */

global $main, $target;
$isAuth = $main->checkStatus();

if (!isset($global)) {
  $pageHeader = $pageHeader ?? template('parts/header');
  $pageFooter = $pageFooter ?? ($isAuth ? template('parts/footer'): '');
  $sideLeft = $sideLeft ?? ($isAuth ? template('parts/sidemenu') : '');
  $sideRight = $sideRight ?? '';
}
$footerContentBase = $footerContentBase ?? template('parts/footerBase');

$jsGlobalConst = json_encode([
  'DEBUG'         => DEBUG,
  'CSV_DEVELOP'   => $main->getCmsParam('CSV_DEVELOP') ?: false,
  'SITE_PATH'     => $main->url->getBaseSitePath(),
  'MAIN_PHP_PATH' => $main->url->getBaseSitePath() . 'index.php',
  'PUBLIC_PAGE'   => PUBLIC_PAGE,
  'URI_IMG'       => URI_IMG,
  'AUTH_STATUS'   => $isAuth,
  'INIT_SETTING'  => $main->frontSettingInit,
]);

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?= $headContent ?? '' ?>
  <title><?= $pageTitle ?? 'VistegraCMS' ?></title>
  <link rel="icon" href="<?= $main->url->getSitePath() ?>favicon.ico">
  <?php if ($isAuth || $target === 'login') { ?>
    <link rel="stylesheet" href='<?= CORE_CSS ?>admin.css?ver=9ae425560d6'>
  <?php } else { ?>
    <style>.main-wrapper {--theme-sidebar-width: 0;}</style>
  <?php } ?>

  <?php array_map(function ($item) { ?>
    <link rel="stylesheet" href="<?= $item ?>">
  <?php }, $cssLinks ?? []); ?>

  <script>
    window.CMS_CONST = '<?= $jsGlobalConst ?>'
  </script>
</head>

<!-- dark -->
<!-- horizontal -->
<body data-theme-version="light" data-layout="vertical">

<div id="preloader">
  <div class="sk-three-bounce">
    <div class="sk-child sk-bounce1"></div>
    <div class="sk-child sk-bounce2"></div>
    <div class="sk-child sk-bounce3"></div>
  </div>
</div>

<?php if (!isset($global)) { ?>
  <main class="main-wrapper mx-auto" id="mainWrapper">
    <?= $pageHeader; ?>

    <div class="container-content">
      <?= $sideLeft ?>

      <section class="content-body">
        <div class="px-md-4 pt-md-4 pb-5 h-100"><?= $content ?? '' ?></div>
        <?= $pageFooter ?>
      </section>
      <?php if ($sideRight) { ?>
        <section id="sideRight" class="col-md-3 col-lg-2 d-md-block"><?= $sideRight ?></section>
      <?php } ?>
    </div>

  </main>
<?php } else echo $global; ?>

<script defer type="module" src='<?= CORE_JS ?>src.js?ver=35453966479'></script>
<script defer type="module" src='<?= CORE_JS ?>main.js?ver=684eab4bb6f'></script>

<?php array_map(function ($item) { ?>
  <script defer type="module" src="<?= $item ?>"></script>
<?php }, $jsLinks ?? []); ?>

<?= $footerContent ?? '' ?>
<?= $footerContentBase ?>
</body>
</html>
