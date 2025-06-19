<?php

/**
 * @var Main $main - global
 */

$siteLink = $main->url->getUri();

/** Временно обработка выбора языка */
$availableLanguages = $main->getAvailableLanguages();

if (isset($_GET['lang'])) {
  $lang = $_GET['lang'];

  if (in_array($lang, array_column($availableLanguages, 'code'))) {
    // Устанавливаем на 30 дней
    setcookie('target_lang', $lang, time() + (12 * 30 * 24 * 60 * 60), '/');
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
            <!-- ВРЕМЕННО select для выбора языка -->
            <style>
                .language-selector {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    width: 120px;
                }

                .language-selector select {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    width: 100%;
                    padding: 10px 15px;
                    padding-right: 35px;
                    font-size: 14px;
                    color: #333;
                    background-color: #f8f8f8;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .language-selector select:hover {
                    border-color: #aaa;
                    background-color: #fff;
                }

                .language-selector select:focus {
                    border-color: #4a90e2;
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
                }

                .language-selector::after {
                    content: "▼";
                    font-size: 10px;
                    color: #666;
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                }

                .language-selector option {
                    padding: 8px;
                    background: #fff;
                }
            </style>

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
