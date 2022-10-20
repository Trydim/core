<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$startPath = $main->url->getPath(true) . SHARE_PATH;

?>
<div class="container-fluid ab-filemanager" id="ab-main">
  <div class="row" id="ab-content">

    <!-- breadcrumb -->
    <div class="col-12 row align-items-center" id="ab-breadcrumb">
      <div class="col-6" id="breadcrumb-links">
        <span class="open">public</span>
      </div>

      <div class="col-2 d-flex justify-content-end">
        <button id="createFolder" class="btn btn-primary me-2" title="Создать здесь папку">
          <i class="pi pi-folder"></i>
        </button>

        <button id="createFile" class="btn btn-primary" title="Создать здесь файл">
          <i class="pi pi-file"></i>
        </button>
      </div>

      <div class="col-4 dropzone">
        <div id="div-uploadfile" class="" title="загрузить файл здесь">
        <form id="frm-uploadfile" name="frm-uploadfile" enctype="multipart/form-data">
          <input type="file" id="file" name="file[]" multiple="multiple">
        </form>
      </div>
    </div>

    <!--<a id="zipsite" class="btn asphalt" title="Архивировать и скачать"
      href="</?= config['rootdirectory'] ?>downloadfolder.php?file=</?= ROOT ?>">
      <i class=" fa fa-download" aria-hidden="true"></i>Архивировать и скачать
    </a>-->
    <!--<a class="btn asphalt" title="Основные настройки"
       href="</?= config['rootdirectory'] ?>editor.php?editfile=config.php"
       target="_blank">
      <i class=" fa fa-cog" aria-hidden="true"></i>Основные настройки
    </a>-->

  </div>
  <div class="row">
    <!-- left panel -->
    <div class="col-4">
      <div id="tree">
        <div id="home" data-fo="<?= $startPath ?>" class="closed selected"><?= $startPath ?></div>

        <?php tree($startPath); ?>
      </div>
    </div>
    <!-- table data -->
    <div class="col-8" id="ab-container-table"></div>
  </div>
</div>

<input type="hidden" id="rootDirData" value="<?= $startPath ?>">
<script defer src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
