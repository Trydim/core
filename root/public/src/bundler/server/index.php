<?php

use mindplay\vite\Manifest;

require dirname(__DIR__) . '/../vendor/autoload.php';

if ($_SERVER['REQUEST_URI'] !== '/') {
  return false; // let `php -S` serve static files
}

const HOST       = 'http://project/',
      ASSETS_URL = HOST . 'core/assets/',
      ENTRY_SCRIPT = 'application.js';

const CMS_CONST = [
  "DEBUG"         => false,
  "SITE_PATH"     => HOST,
  "MAIN_PHP_PATH" => HOST . "index.php",
  "URI_IMG"       => HOST . "public/images/",
  "URI_SHARED"    => HOST . "shared/upload/",
];

$vite = new Manifest(
  dev: getenv('APP_ENV') !== 'production',
  manifest_path: dirname(__DIR__) . '/.vite/manifest.json',
  base_path: '/dist/'
);

$tags = $vite->createTags(ENTRY_SCRIPT);

$data = file_get_contents(CMS_CONST['MAIN_PHP_PATH'] . '?customMode=devVite');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Vite App</title>
  <link rel="icon" href="<?= $vite->getURL("php.svg") ?>" />

  <script>
    window.CMS_CONST = '<?= json_encode(CMS_CONST) ?>'
  </script>

  <?= $tags->preload ?>
  <?= $tags->css ?>

  <link rel="stylesheet" href="<?= ASSETS_URL ?>css/admin.css?ver=9ae425560d6">
  <link rel="stylesheet" href="<?= ASSETS_URL ?>css/fonts.css?ver=1.0">

  <script type="module" src="<?= ASSETS_URL ?>js/src.js"></script>
  <script type="module" src="<?= ASSETS_URL ?>js/main.js"></script>
</head>
<body>
  <div id="preloader">
    <div class="sk-three-bounce">
      <div class="sk-child sk-bounce1"></div>
      <div class="sk-child sk-bounce2"></div>
      <div class="sk-child sk-bounce3"></div>
    </div>
  </div>

  <div id="app">app</div>
  <?= $data ?>
  <?= $tags->js ?>
</body>
</html>
