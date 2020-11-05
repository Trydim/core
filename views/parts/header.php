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
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/">
            <i class="material-icons">date_range</i>
            <p class="d-lg-none d-md-block">
              Stats
            </p>
          </a>
        </li>
        <?= $main->getLogin() ?>
        <li class="nav-item" id="authBlock">
          <label class="exit-icon d-flex font-blue">
            <input type="button" data-action="exit" style="display: none;">
            <i class="material-icons font-blue mar-left">login_out</i>
          </label>
        </li>
      </ul>
    </div>
  </div>
</nav>
<?php } else { ?>
  <?= template('parts/authBlock') ?>
<?php } ?>
