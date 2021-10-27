<?php global $main;
if ($main && $main->checkStatus('ok')) { ?>
<nav class="navbar navbar-expand-lg navbar-transparent border-bottom">
  <div class="container-fluid">
    <!--<button class="navbar-toggler" type="button" data-toggle="collapse" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
      <span class="sr-only">Toggle navigation</span>
      <span class="navbar-toggler-icon icon-bar"></span>
      <span class="navbar-toggler-icon icon-bar"></span>
      <span class="navbar-toggler-icon icon-bar"></span>
    </button>-->
    <div class="collapse navbar-collapse justify-content-end">
      <ul class="navbar-nav" id="authBlock">
        <!--<li class="nav-item">
          <a class="nav-link" href="/">
            <i class="material-icons">date_range</i>
            <p class="d-lg-none d-md-block">
              Stats
            </p>
          </a>
        </li>-->
        <li class="nav-item"><?= $main->getLogin('name') ?></li>
        <li class="nav-item">
          <span class="exit-icon d-flex" data-action="exit">
            <i class="material-icons font-blue" data-action="exit">login_out</i>
          </span>
        </li>
      </ul>
    </div>
  </div>
</nav>
<?php } else { ?>
  <div class="auth-block">
    <a href="<?= SITE_PATH?>login">Войти</a>
  </div>
<?php } ?>
