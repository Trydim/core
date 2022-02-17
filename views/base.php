<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var array $vars extract param
 */

global $main, $target;

if (!isset($global)) {
  $pageHeader = $pageHeader ?? template('parts/header');
  $pageFooter = $pageFooter ?? template('parts/footer');
  $sideLeft = $sideLeft ?? template('parts/sidemenu');
  $sideRight = $sideRight ?? '';
}
$footerContentBase = $footerContentBase ?? template('parts/footerBase');

$jsGlobalConst = json_encode([
  'DEBUG'         => DEBUG,
  'CSV_DEVELOP'   => CSV_DEVELOP,
  'SITE_PATH'     => SITE_PATH,
  'MAIN_PHP_PATH' => SITE_PATH . 'index.php',
  'PUBLIC_PAGE'   => PUBLIC_PAGE,
  'PATH_IMG'      => PATH_IMG,
  'AUTH_STATUS'   => $main->checkStatus('ok'),
  'INIT_SETTING'  => $main->frontSettingInit,
]);

?>
<!doctype html>
<html lang="en">
<head>
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?= $headContent ?? '' ?>
  <title><?= $pageTitle ?? 'VistegraCMS' ?></title>
  <link rel="icon" href="<?= SITE_PATH ?>favicon.ico">
  <?php if ($main->checkStatus('ok') || $target === 'login') { ?>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css">
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons">
    <link rel="stylesheet" href="<?= CORE_CSS ?>admin.css?ver=a22d8c4f0d">
  <?php } ?>

  <?php array_map(function ($item) { ?>
    <link rel="stylesheet" href="<?= str_replace('//', '/', $item) ?>">
  <?php }, $cssLinks ?? []); ?>

  <script>
    window.CMS_CONST = '<?= $jsGlobalConst ?>'
  </script>
</head>

<body>

<?php if (!isset($global)) { ?>
  <main class="container-fluid mx-auto">
    <section class="wrapper">

      <?php if ($sideLeft) { ?>
        <aside id="sideLeft"><?= $sideLeft; ?></aside>
      <?php } ?>

      <section class="main-panel mx-auto" style="<?= !$sideLeft ? 'width: 100%' : '' ?>">
        <?= $pageHeader ?>

        <div class="content mt-0 p-1">
          <div class="row justify-center"> <!-- возможно убрать justify-center -->
            <!-- стили временно-->
            <div class="col-12 <?= $sideRight ? 'col-xl-10' : '' ?>"><?= $content ?></div>

            <?php if ($sideRight) { ?>
              <aside id="right" class="col-12 col-md-2"><?= $sideRight ?></aside>
            <?php } ?>

          </div>
        </div>
        <footer class="footer"><?= $pageFooter ?></footer>
      </section>

    </section>
  </main>
<?php } else echo $global; ?>

<script defer type="module" src="<?= CORE_JS ?>src.js?ver=4fce2414f6"></script>
<script defer type="module" src="<?= CORE_JS ?>main.js?ver=4c854b1fe1"></script>

<?php array_map(function ($item) { ?>
  <script defer type="module" src="<?= str_replace('//', '/', $item) ?>"></script>
<?php }, $jsLinks ?? []); ?>

<?= $footerContent ?? '' ?>
<?= $footerContentBase ?>
</body>
</html>
