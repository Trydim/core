<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var array $vars extract param
 */

$isAuth = $main->checkStatus();

if (!isset($global)) {
  $pageHeader = $pageHeader ?? template('parts/header');
  $pageFooter = $pageFooter ?? ($isAuth ? template('parts/footer'): '');
  $sideLeft = $sideLeft ?? ($isAuth ? template('parts/sidemenu') : '');
  $sideRight = $sideRight ?? '';
}
$footerContentBase = $footerContentBase ?? '';

$jsGlobalConst = json_encode([
  'DEBUG'         => DEBUG,
  'CSV_DEVELOP'   => $main->getCmsParam('CSV_DEVELOP') ?: false,
  'SITE_PATH'     => $main->url->getBasePath(),
  'MAIN_PHP_PATH' => $main->url->getBasePath() . 'index.php',
  'PUBLIC_PAGE'   => PUBLIC_PAGE,
  'URI_IMG'       => $main->getCmsParam(VC::URI_IMG),
  'URI_SHARED'    => $main->url->getBaseUri() . $main->getCmsParam('SHARE_PATH'),
  'AUTH_STATUS'   => $isAuth,
  'IS_DEAL'       => $main->isDealer(),
  'DEAL_URI_IMG'  => $main->getCmsParam(VC::DEAL_URI_IMG),
  'DEAL_URI_SHARED' => $main->url->getUri(true) . $main->getCmsParam('SHARE_PATH'),
  'INIT_SETTING'  => $main->frontSettingInit,
  'BASE_LANG'     => $main::$BASE_LANG,
]);

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title><?= $pageTitle ?? 'VistegraCMS' ?></title>
  <link rel="icon" href="<?= $main->url->getPath() ?>favicon.ico">
  <?php if ($isAuth || $main->url->getRoute() === 'login') { ?>
    <link rel="stylesheet" href='<?= CORE_CSS ?>admin.css?ver=1.2'>
  <?php } else { ?>
    <style>.main-wrapper {--theme-sidebar-width: 0;}</style>
  <?php }

  array_map(function ($item) { ?>
    <link rel="stylesheet" href="<?= $item ?>">
  <?php }, $cssLinks ?? []); ?>

  <script>
    window.CMS_CONST = '<?= $jsGlobalConst ?>'
  </script>

  <link rel="prefetch" href="<?= CORE_JS ?>src.js?ver=1.2" as="script" crossorigin>
  <link rel="prefetch" href="<?= CORE_JS ?>main.js?ver=1.2" as="script" crossorigin>

  <?php array_map(function ($item) { ?>
    <link rel="prefetch" href="<?= $item ?>" as="script" crossorigin>
  <?php }, $jsLinks ?? []); ?>

  <?= $headContent ?? '' ?>
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
        <div class="px-xl-2 pt-2 pb-5 h-100"><?= $content ?? '' ?></div>
        <?= $pageFooter ?>
      </section>
      <?php if ($sideRight) { ?>
        <section id="sideRight" class="col-md-3 col-lg-2 d-md-block"><?= $sideRight ?></section>
      <?php } ?>
    </div>

    <?php if ($main->isDealer()) { ?>
      <a href="<?= $main->url->getBaseUri() ?>" class="d-block position-fixed start-0 bottom-0 m-3" style="width: 2rem; height: 2rem; z-index: 11"></a>
    <?php } ?>
  </main>
<?php } else echo $global; ?>

<script defer type="module" src="<?= CORE_JS ?>src.js?ver=1.2"></script>
<script defer type="module" src="<?= CORE_JS ?>main.js?ver=1.2"></script>

<?php array_map(function ($item) { ?>
  <script defer type="module" src="<?= $item ?>"></script>
<?php }, $jsLinks ?? []); ?>

<?= $footerContent ?? '' ?>
<?= $footerContentBase ?>
</body>
</html>
