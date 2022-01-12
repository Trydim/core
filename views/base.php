<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $vars extract param
 */

global $main, $target;

if (!isset($pageTitle)) $pageTitle = '';
if (!isset($headContent)) $headContent = '';

if (!isset($global)) {
  if (!isset($pageHeader)) $pageHeader = template('parts/header');
  if (!isset($pageFooter)) $pageFooter = template('parts/footer');
  if (!isset($sideLeft)) $sideLeft = template('parts/sidemenu');
  if (!isset($content)) $content = '';
  if (!isset($sideRight)) $sideRight = '';
}
if (!isset($cssLinks)) $cssLinks = [];
if (!isset($jsLinks)) $jsLinks = [];
if (!isset($footerContent)) $footerContent = '';
if (!isset($footerContentBase)) $footerContentBase = template('parts/footerBase');

?>
<!doctype html>
<html lang="en">
<head>
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?= $headContent ?>
  <title><?= $pageTitle; ?></title>
  <link rel="icon" href="<?= SITE_PATH ?>favicon.ico">
  <?php if($main->checkStatus('ok') || $target === 'login') { ?>
    <link rel="stylesheet" href="<?= CORE_CSS ?>admin.css">
  <?php } ?>

  <?php array_map(function($item) { ?>
    <link rel="stylesheet" href="<?= str_replace('//', '/', $item); ?>">
  <?php }, $cssLinks); ?>

  <script>
    window.DEBUG         = '<?= DEBUG ?>';
    window.CSV_DEVELOP   = '<?= CSV_DEVELOP ?>';
    window.SITE_PATH     = '<?= SITE_PATH ?>';
    window.MAIN_PHP_PATH = '<?= SITE_PATH ?>index.php';
    window.PUBLIC_PAGE   = '<?= PUBLIC_PAGE ?>';
    window.PATH_IMG      = '<?= PATH_IMG ?>';
    window.AUTH_STATUS   = '<?= $main->checkStatus('ok') ?>';
  </script>
</head>

<!-- dark -->
<!-- horizontal -->
<body
    data-theme-version="light"
    data-layout="vertical"
>

<div id="preloader">
  <div class="sk-three-bounce">
    <div class="sk-child sk-bounce1"></div>
    <div class="sk-child sk-bounce2"></div>
    <div class="sk-child sk-bounce3"></div>
  </div>
</div>

<?php if(!isset($global)) { ?>
  <main class="main-wrapper mx-auto" id="mainWrapper">
    <div class="nav-header">
      <a href="<?= SITE_PATH ?>" class="brand-logo">
        <img class="logo-abbr" src="<?= SITE_PATH ?>favicon.ico" alt="">
        <span class="brand-title"><?= PROJECT_TITLE ?></span>
      </a>

      <div class="nav-control" role="button" data-action-cms="menuToggle">
        <div>
          <i class="pi pi-caret-left"></i>
        </div>
      </div>
    </div>
    <?= $pageHeader; ?>

    <div class="container-content">
      <?php if($sideLeft) { ?>
        <?= $sideLeft; ?>
      <?php } ?>
      <section class="content-body">
        <div class="px-md-4 pt-md-4 pb-5 h-100"><?= $content; ?></div>
        <?= $pageFooter; ?>
      </section>
      <?php if($sideRight) { ?>
        <section id="sideRight" class="col-md-3 col-lg-2 d-md-block"><?= $sideRight; ?></section>
      <?php } ?>
    </div>

  </main>
<?php } else echo $global; ?>

<script defer type="module" src="<?= CORE_JS?>src.js"></script>
<script defer type="module" src="<?= CORE_JS?>main.js"></script>

<?php array_map(function($item) { ?>
  <script defer type="module" src="<?= str_replace('//', '/', $item); ?>"></script>
<?php }, $jsLinks) ?>

<?= $footerContent; ?>
<?= $footerContentBase; ?>
</body>
</html>
