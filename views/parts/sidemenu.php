<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

const DEFAULT_ICON = [
  'admindb'     => 'pi-book',
  'calendar'    => 'pi-table',
  'catalog'     => 'pi-user',
  'customers'   => 'pi-dollar',
  'dealers'     => 'pi-money-bill',
  'fileManager' => 'pi-folder-open',
  'orders'      => 'pi-inbox',
  'statistic'   => 'pi-chart-line',
  'users'       => 'pi-users',
  'setting'     => 'pi-sliders-h',
];

$adminMenu = '';
$dbTables = $main->getBaseTable();
$route    = $main->url->getRoute();
$siteLink = $main->url->getUri();

$usersTags = $main->getLogin('permission')['tags'];
$skipSubMenu = [];
if (includes($usersTags, 'alumodoor')) $skipSubMenu = ['price2'];
else if (includes($usersTags, 'dp')) $skipSubMenu = ['price'];

if (is_array($dbTables)) {

  class CreateMenu {
    private $siteLink;
    private $skipSubMenu;

    public function __construct($siteLink, $skipSubMenu) {
      $this->siteLink = $siteLink;
      $this->skipSubMenu = $skipSubMenu;
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
      $idWrap = $root ? 'id="DBTablesWrap"' : '';
      return <<<menu
      <span class="nav-item has-arrow" role="button" aria-expanded="false">
        <i class="pi $icon"></i>
        <span class="nav-text">$title</span>
      </span>
      <ul aria-expanded="false" class="ms-3 overflow-hidden" $idWrap data-role="link" style="height: 0">$items</ul>
menu;
    }

    public function create($title, $tables, $link = '', $root = true): string {
      $items = '';
      foreach ($tables as $key => $item) {
        if (!is_numeric($key)) {
          if (in_array($key, $this->skipSubMenu)) continue;

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

  $adminMenu = (new CreateMenu($siteLink, $skipSubMenu))->create('adminDB', $dbTables);
} ?>
<aside id="sideLeft" class="sidebar"> <!-- data-background-color="white"-->
  <div class="position-sticky top-0">
    <ul class="sidebar-menu show" id="sideMenu">
      <li class="nav-label"><?= gTxt('Main Menu') ?></li>
      <?php if ($main->availablePage(PUBLIC_PAGE)) { ?>
        <li>
          <a class="nav-item <?= $route === 'public' ? 'active' : '' ?>" href="<?= $siteLink ?>" aria-expanded="false">
            <i class="pi pi-globe"></i>
            <span class="nav-text"><?= gTxt(PUBLIC_PAGE) ?></span>
          </a>
        </li>
      <?php }

      foreach ($main->getSideMenu(false, true) as $item) {
        if ($item === PUBLIC_PAGE) continue;

        if (is_array($item)) {
          if (isset($item['label'])) { ?>
            <li class="nav-label"><?= gTxt($item['label']) ?></li>
          <?php continue; }

          $link = $item['link'];
          $icon = $item['icon'] ?? DEFAULT_ICON[$link] ?? 'pi-circle';
        } else {
          $link = $item;
          $icon = DEFAULT_ICON[$link] ?? 'pi-circle';
        }

        if ($link === 'hr') { ?>
          <li><hr></li>
        <?php continue; }

        if ($link === 'admindb') { ?>
          <li>
            <?php if ($adminMenu) echo $adminMenu; else { ?>
              <a class="nav-item <?= $active ?? '' ?>" href="<?= $siteLink . $link ?>">
                <i class="pi <?= $icon ?>"></i>
                <span class="nav-text"><?= gTxt($link) ?></span>
              </a>
            <?php } ?>
          </li>
        <?php continue; }

        ?>
        <li>
          <a class="nav-item <?= $route === $link ? 'active' : '' ?>" href="<?= $siteLink . $link ?>">
            <i class="pi <?= $icon ?>"></i>
            <span class="nav-text"><?= gTxt($link) ?></span>
          </a>
        </li>
      <?php } ?>
    </ul>
  </div>
</aside>
