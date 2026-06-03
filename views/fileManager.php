<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 */

$sharedPath = $main->getCmsParam(VC::SHARED_PATH);

?>
<div class="container-fluid ab-filemanager" id="ab-main">
  <div class="row" id="ab-content">

    <!-- breadcrumb -->
    <div class="col-12 row align-items-center border" id="ab-breadcrumb">
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
  </div>
  <div class="row">
    <!-- left panel -->
    <div class="col-4">
      <div id="tree">
        <div id="home" data-fo="<?= $sharedPath ?>" class="closed selected"><?= $sharedPath ?></div>

        <?php tree($sharedPath); ?>
      </div>
    </div>
    <!-- table data -->
    <div class="col-8" id="ab-container-table"></div>
  </div>
</div>

<input type="hidden" id="rootDirData" value="<?= $sharedPath ?>">
<script defer src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
