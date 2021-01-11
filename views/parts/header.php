<?php global $main;
if($main && $main->checkStatus('ok')) { ?>
<nav class="navbar navbar-expand-lg navbar-transparent border-bottom">
  <div class="container-fluid">
    <button class="navbar-toggler" type="button" data-toggle="collapse" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
      <span class="sr-only">Toggle navigation</span>
      <span class="navbar-toggler-icon icon-bar"></span>
      <span class="navbar-toggler-icon icon-bar"></span>
      <span class="navbar-toggler-icon icon-bar"></span>
    </button>
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
        <li class="nav-item"><?= $main->getLogin() ?></li>
        <li class="nav-item" data-action="exit">
          <span class="exit-icon d-flex">
            <i class="material-icons font-blue">login_out</i>
          </span>
        </li>
      </ul>
    </div>
  </div>
</nav>
<?php } else { ?>
  <?= template('parts/authBlock') ?>
<?php } ?>
