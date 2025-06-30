<?php

/**
 * @var Main $main - global
 */

$siteLink = $main->url->getUri();

//Обработка смены языка
$availableLanguages = $main->getAvailableLanguages();

if (isset($_GET['lang'])) {
  $lang = $_GET['lang'];

  if (in_array($lang, array_column($availableLanguages, 'code'))) {
    // Устанавливаем на 10 лет
    setcookie('target_lang', $lang, time() + (120 * 30 * 24 * 60 * 60), '/');
    // Перенаправляем без параметра lang в URL
    $url = strtok($_SERVER['REQUEST_URI'], '?'); // Базовый URL без query
    $query = $_GET;
    unset($query['lang']); // Удаляем параметр lang

    if (!empty($query)) {
      $url .= '?' . http_build_query($query);
    }

    header('Location: ' . $url);
    exit;
  }
}

$currentLang = $main->getTargetLang();
echo "<input type='hidden' id='targetLang' value='$currentLang'>";

?>

<?php
/** /end */

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
            <?php if ($availableLanguages && count($availableLanguages) > 1): ?>

            <div class="language-selector">
                <select id="languageSelector">
                <?php foreach ($availableLanguages as $language): ?>
                    <option <?= $language['code'] === $currentLang ? 'selected' : ''; ?> value="<?= $language['code']; ?>"><?= $language['name']; ?></option>
                <?php endforeach; ?>
                </select>
            </div>

            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    const selector = document.getElementById('languageSelector');

                    selector.addEventListener('change', function () {
                        const lang = this.value;
                        const url = new URL(window.location.href);
                        url.searchParams.set('lang', lang);
                        window.location.href = url.toString();
                    });
                });
            </script>

            <?php endif; ?>

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
