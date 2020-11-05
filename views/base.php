<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

if(!isset($pageTitle)) $pageTitle = '';
if(!isset($headContent)) $headContent = '';

if(!isset($global)) {
	if (!isset($pageHeader)) $pageHeader = template('parts/header');
	if (!isset($pageFooter)) $pageFooter = template('parts/footer');
	if (!isset($sideLeft)) $sideLeft = template('parts/sidemenu');
	if (!isset($content)) $content = '';
	if (!isset($sideRight)) $sideRight = '';
}
if(!isset($cssLinks)) $cssLinks = [];
if(!isset($jsLinks)) $jsLinks = [];
if(!isset($popupWindow)) $popupWindow = template('parts/popupWindow');
if(!isset($footerContent)) $footerContent = '';
if(!isset($footerContentBase)) $footerContentBase = template('parts/footerBase');

?>
<head>
	<meta name="viewport"
	      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?= $headContent ?>
	<title><?= $pageTitle; ?></title>
	<?php if(!isset($eraseDefaultStyle)) { ?>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css">
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons">
     <!-- Material Kit CSS -->
    <link rel="stylesheet" href="<?= CORE_CSS?>material-dashboard.css">
    <link rel="stylesheet" href="<?= CORE_CSS?>admin/admin.css">
    <link rel="stylesheet" href="<?= CORE_CSS?>libs/calendar/calendar.css">
	<?php } ?>

	<?php if(count($cssLinks)) { array_map(function($item) { ?>
    <link rel="stylesheet" href="<?= CORE_CSS . $item; ?>">
	<?php }, $cssLinks); } ?>
</head>

<body>
<?php if(!isset($global)) { ?>
<main class="container-fluid mx-auto">
  <section class="wrapper">

    <?php if($sideLeft) { ?>
      <aside id="left"><?= $sideLeft; ?></aside>
		<?php } ?>

    <section class="main-panel">
      <?= $pageHeader; ?>

      <div class="content m-top">
        <div class="row justify-center"> <!-- возможно убрать justify-center -->
          <div class="col-12 col-md-10"><?= $content; ?></div>

          <?php if($sideRight) { ?>
            <aside id="right" class="col-12 col-md-2"><?= $sideRight; ?></aside>
          <?php } ?>

        </div>
      </div>
      <footer><?= $pageFooter; ?></footer>
    </section>

  </section>
</main>
<?php } else echo $global; ?>

<?= $popupWindow ?>
<script type="module" src="<?= CORE_SCRIPT?>main.js"></script>

<?php array_map(function($item) { ?>
  <!-- <script type="module" src="<?= CORE_SCRIPT . $item; ?>main.js"></script> -->
<?php }, $jsLinks) ?>

<?= $footerContent; ?>
<?= $footerContentBase; ?>
</body>
</html>
