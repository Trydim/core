<?php global $main;
if ($main && $main->checkStatus('ok')) { ?>
<div class="header">
  <div class="header-content">
    <div></div>
    <nav class="navbar navbar-expand">
      <div class="collapse navbar-collapse">

        <ul class="navbar-nav">
          <li class="d-flex justify-content-end dropdown header-profile">
            <a class="nav-link" href="#" role="button" data-toggle="dropdown">
              <i class="pi pi-user"></i>
              <?= $main->getLogin('name') ?>
            </a>
            <div class="dropdown-menu mt-5">
              <a href="#" class="dropdown-item" data-action="exit">
                <i class="pi pi-sign-out"></i>
                <span class="ml-2">Logout</span>
              </a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</div>
<?php } else { ?>
<div>
  <a href="<?= SITE_PATH?>login">Войти</a>
</div>
<?php } ?>
