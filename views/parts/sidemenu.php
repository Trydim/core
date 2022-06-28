<?php if (!defined('MAIN_ACCESS')) die('access denied!');

global $main;

$adminMenu = '';
$dbTables = $main->getBaseTable();
$siteLink = $main->isDealer() ? $main->url->getDealerUri() : $main->url->getFullUri();

if(is_array($dbTables)) {

  class CreateMenu {
    private $siteLink;
    public function __construct($siteLink) {
      $this->siteLink = $siteLink;
    }

    public function subSideMenuItem($fileName, $name, $active): string {
      $sitePath = $this->siteLink . "admindb?tableName=" . $fileName;
      return <<<item
      <li>
        <a class="nav-item pl-5 $active" href="$sitePath">
          <i class="pi pi-file-excel"></i>
          <span class="nav-text">$name</span>
        </a>
      </li>
item;
    }

    public function subSideMenu($title, $items, $root): string {
      $icon = $root ? 'pi-book' : 'pi-folder';
      $rootClass = $root ? 'overflow-scroll' : 'overflow-hidden';
      $idWrap = $root ? 'id="DBTablesWrap"' : '';
      return <<<menu
      <span class="nav-item has-arrow" role="button" aria-expanded="false">
        <i class="pi $icon"></i>
        <span class="nav-text">$title</span>
      </span>
      <ul aria-expanded="false" class="ms-3 $rootClass" $idWrap data-role="link" style="height: 0">$items</ul>
menu;
    }

    public function create($title, $tables, $link = '', $root = true): string {
      $items = '';
      foreach ($tables as $key => $item) {
        if (!is_numeric($key)) {
          $items .= '<li>' . $this->create($key, $item, $link . '/' . $key, false) . '</li>';
          continue;
        }

        global $tableActive;
        $linkTarget = $item['fileName'] ?? $item['dbTable'] ?? $item['name'];
        $active = $tableActive === $link . '/' . $linkTarget ? 'active' : '';
        $items .= $this->subSideMenuItem($link . '/' . $linkTarget, $item['name'], $active);
      }
      return $this->subSideMenu(gTxt($title), $items, $root);
    }
  }

  $adminMenu = (new CreateMenu($siteLink))->create('Администрирование', $dbTables);
}
?>
<aside id="sideLeft" class="sidebar"> <!-- data-background-color="white"-->
  <div class="position-sticky top-0">
    <ul class="sidebar-menu show" id="sideMenu">
      <li class="nav-label">Main Menu</li>
      <?php if (PUBLIC_PAGE) { ?>
        <li>
          <a class="nav-item" href="<?= $siteLink ?>" aria-expanded="false">
            <i class="pi pi-globe"></i>
            <span class="nav-text"><?= gTxt('calculator') ?></span>
          </a>
        </li>
      <?php } ?>
      <?php foreach ($main->getSideMenu() as $item) {
        switch ($item) {
          case 'orders': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>orders" aria-expanded="false">
                <i class="pi pi-inbox"></i>
                <span class="nav-text"><?= gTxt('orders') ?></span>
              </a>
            </li>
            <?php break;
          case 'calendar': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>calendar" aria-expanded="false">
                <i class="pi pi-table"></i>
                <span class="nav-text"><?= gTxt('calendar') ?></span>
              </a>
            </li>
            <?php break;
          case 'customers': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>customers" aria-expanded="false">
                <i class="pi pi-dollar"></i>
                <span class="nav-text"><?= gTxt('customers') ?></span>
              </a>
            </li>
            <?php break;
          case 'users': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>users" aria-expanded="false">
                <i class="pi pi-users"></i>
                <span class="nav-text"><?= gTxt('users') ?></span>
              </a>
            </li>
            <?php break;
          case 'statistic': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>statistic" aria-expanded="false">
                <i class="pi pi-chart-line"></i>
                <span class="nav-text"><?= gTxt('statistic') ?></span>
              </a>
            </li>
            <?php break;
          case 'admindb': ?>
            <li>
              <?php if($adminMenu) { ?>
                <?= $adminMenu ?>
              <? } else { ?>
                <a class="nav-item" href="<?= $siteLink ?>admindb" aria-expanded="false">
                  <i class="pi pi-user"></i>
                  <span class="nav-text"><?= gTxt('admindb') ?></span>
                </a>
              <?php } ?>
            </li>
            <?php break;
          case 'catalog': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>catalog" aria-expanded="false">
                <i class="pi pi-user"></i>
                <span class="nav-text"><?= gTxt('catalog') ?></span>
              </a>
            </li>
            <?php break;
          case 'fileManager': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>fileManager" aria-expanded="false">
                <i class="pi pi-folder-open"></i>
                <span class="nav-text"><?= gTxt('fileManager') ?></span>
              </a>
            </li>
            <?php break;
          case 'dealers': ?>
            <li>
              <a class="nav-item" href="<?= $siteLink ?>dealers" aria-expanded="false">
                <i class="pi pi-money-bill"></i>
                <span class="nav-text"><?= gTxt('dealers') ?></span>
              </a>
            </li>
            <?php break;
        }
      } ?>
      <?php if (in_array('setting', $main->getSideMenu()) || $main->getLogin('admin')) { ?>
        <li>
          <a class="nav-item" href="<?= $siteLink ?>setting" aria-expanded="false">
            <i class="pi pi-sliders-h"></i>
            <span class="nav-text"><?= gTxt('setting') ?></span>
          </a>
        </li>
      <?php } ?>
    </ul>
  </div>
</aside>
