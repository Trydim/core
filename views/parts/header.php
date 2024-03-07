<?php

/**
 * @var Main $main - global
 */

$siteLink = $main->url->getUri();

if ($main->checkStatus()) {
  $imgSrc = '';
  $getLogoString = function (string $pathK, string $uriK) use ($main) {
    $path = $main->getCmsParam($pathK);
    $link = $main->getCmsParam($uriK);

    if (file_exists($path . 'logo.webp')) return '<source srcset="' . $link . 'logo.webp" type="image/webp">';
    else if (file_exists($path . 'logo.jpg')) return '<img src="' . $link . 'logo.jpg" alt="logo">';
    return false;
  };

  if ($main->isDealer()) $imgSrc = $getLogoString(VC::DEAL_IMG_PATH, VC::DEAL_URI_IMG);
  if ($imgSrc === '') $imgSrc = $getLogoString(VC::IMG_PATH, VC::URI_IMG);
?>
<div class="nav-header">
  <a href="<?= $siteLink ?>" class="brand-logo">
    <picture class="logo-abbr"><?= $imgSrc ?></picture>
    <span class="brand-title"><?= $main->getCmsParam(VC::PROJECT_TITLE) ?></span>
  </a>

  <div class="nav-control" role="button" data-action-cms="menuToggle">
    <i class="pi pi-caret-left"></i>
  </div>
</div>

<div class="header">
  <div class="header-content">
    <div class="d-flex align-items-center form-check form-switch">
      <input class="form-check-input" type="checkbox" data-action-cms="themeToggle">
    </div>

    <nav class="navbar navbar-expand">
      <div class="collapse navbar-collapse">

        <ul class="navbar-nav">
          <li class="d-flex justify-content-end dropdown">
            <label role="button" class="nav-link dropdown-toggle">
              <input hidden type="checkbox" data-target="dropdownAuth">
              <i class="pi pi-user"></i>
              <?= $main->getLogin('name') ?>
            </label>
            <ul class="dropdown-menu mt-5 show" data-relation="dropdownAuth">
              <li>
                <button type="button" class="dropdown-item" data-action-cms="exit">
                  <i class="pi pi-sign-out"></i>
                  <span class="ml-2"><?= gTxt('Logout') ?></span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</div>
<?php } else { ?>
<div class="header">
  <a href="<?= $siteLink ?>login"><?= gTxt('Login') ?></a>
</div>
<?php } ?>
