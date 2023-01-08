<?php

/**
 * @var Main $main - global
 */

$siteLink = $main->url->getUri();
$imgSrc = $main->getCmsParam(VC::IMG_PATH);

if ($main->checkStatus()) { ?>
<div class="nav-header">
  <a href="<?= $siteLink ?>" class="brand-logo">
    <picture class="logo-abbr">
      <?php if (file_exists($imgSrc . 'logo.webp')) { ?>
        <source srcset="<?= URI_IMG . 'logo.webp' ?>" type="image/webp">
      <? } ?>
      <?php if (file_exists($imgSrc . 'logo.jpg')) { ?>
        <img src="<?= URI_IMG . 'logo.jpg' ?>" alt="logo">
      <? } ?>
    </picture>
    <span class="brand-title"><?= $main->getCmsParam('PROJECT_TITLE') ?></span>
  </a>

  <div class="nav-control" role="button" data-action-cms="menuToggle">
    <div><i class="pi pi-caret-left"></i></div>
  </div>
</div>

<div class="header">
  <div class="header-content">
    <div></div>
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
