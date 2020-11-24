<?php if (!defined('MAIN_ACCESS')) die('access denied!'); ?>
<div class="sidebar" data-background-color="white">

  <div class="logo">
    <a href="/" class="simple-text logo-normal">Logo</a>
  </div>
  <div class="sidebar-wrapper">
    <ul id="sideMenu" class="nav">
      <li class="nav-item">
        <a class="nav-link" href="<?= SITE_PATH . PUBLIC_PAGE ?>">
          <i class="material-icons">calculate</i>
          <p>Калькулятор</p>
        </a>
      </li>
      <?php foreach (ACCESS_MENU as $item) {
        switch ($item) {
          case 'orders': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>orders">
                <i class="material-icons">table_chart</i>
                <p>Заказы</p>
              </a>
            </li>
            <?php break;
          case 'calendar': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>">
                <i class="material-icons">date_range</i>
                <p>Календарь</p>
              </a>
            </li>
            <?php break;
          case 'customers': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>customers">
                <i class="material-icons">assignment_ind</i>
                <p>Клиенты</p>
              </a>
            </li>
            <?php break;
          case 'users': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>users">
                <i class="material-icons">supervisor_account</i>
                <p>Менеджеры</p>
              </a>
            </li>
            <?php break;
          case 'statistic': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>statistic">
                <i class="material-icons">timeline</i>
                <p>Статистика</p>
              </a>
            </li>
            <?php break;
          case 'admindb': ?>
            <li class="nav-item">
              <?php global $dbTables; if(is_array($dbTables)) { ?>
                <a class="nav-link" href="#admindb">
                  <i class="fa fa-database" aria-hidden="true"></i>
                  <p>Администрирование <b class="caret"></b></p>
                </a>
                <div class="d-none" id="DBTablesWrap">
                  <ul class="nav">
                    <?php
                    global $tableActive;
                    foreach ($dbTables as $item) {
                      !isset($item['fileName']) && $item['fileName'] = $item['name'];
                      $active = $tableActive === $item['fileName'] ? 'active' : ''; ?>
                      <li class="nav-item <?= $active ?>">
                        <a class="nav-link p-left" href="<?= SITE_PATH ?>admindb?tableName=<?= $item['fileName'] ?>"><?= $item['name'] ?></a>
                      </li>
                    <?php } ?>
                  </ul>
                </div>
              <?php } else { ?>
                <a class="nav-link" href="<?= SITE_PATH ?>admindb">
                  <i class="fa fa-database"></i>
                  <p>Администрирование</p>
                </a>
              <?php } ?>
            </li>
            <?php break;
          case 'catalog': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>catalog">
                <i class="material-icons">view_list</i>
                <p>Каталог</p>
              </a>
            </li>
            <?php break;
          case 'options': ?>
            <li class="nav-item">
              <a class="nav-link" href="<?= SITE_PATH ?>options">
                <i class="material-icons">settings</i>
                <p>Настройки</p>
              </a>
            </li>
            <?php break;
        }
      } ?>
    </ul>
  </div>
</div>
