<?php ?>
<div class="ab-container ab-filemanager" id="ab-main">

  <div id="ab-content" class="ab-row">

    <!-- breadcrumb -->
    <div class="ab-col12 d-flex align-items-center" id="ab-breadcrumb">

      <div id="breadcrumb-links" class="ab-col7">
        <span class="open">public</span>
      </div>

      <div id="ab-top-action-btn" class="ab-col5 ab-text-right">
        <!--<a id="a-create-folder" class="ab-btn asphalt" title="Создать здесь папку" href="#">
          <i class="fa fa-folder-o" aria-hidden="true"></i>Создать папку
        </a>-->

       <!--<button id="createfile" class="ab-btn asphalt" title="Создать здесь файл">
          <i class="fa fa-file-text-o" aria-hidden="true"></i>Создать файл
        </button>-->

        <div class="dropzone">
          <div id="div-uploadfile" class="" title="загрузить файл здесь">
          <form id="frm-uploadfile" name="frm-uploadfile" enctype="multipart/form-data">
            <input type="file" id="file" name="file[]" multiple="multiple">
          </form>
        </div>
        </div>

        <!--<a id="zipsite" class="ab-btn asphalt" title="Архивировать и скачать"
           href="<?/*= $config['rootdirectory'] */?>downloadfolder.php?file=<?php echo ROOT ?>">
          <i class=" fa fa-download" aria-hidden="true"></i>Архивировать и скачать
        </a>-->
        <!--<a class="ab-btn asphalt" title="Основные настройки"
           href="<?/*= $config['rootdirectory'] */?>editor.php?editfile=config.php"
           target="_blank">
          <i class=" fa fa-cog" aria-hidden="true"></i>Основные настройки
        </a>-->

      </div>
    </div>

    <!-- left panel ........................................... -->

    <div id="leftpanel" class="ab-col4">
      <div id="tree">

        <div id="home" data-fo="<?= SHARE_DIR ?>" class="closed selected">
          <?= SHARE_DIR ?>
        </div>
        <!-- tree  -->
        <?php tree(ABS_SITE_PATH . SHARE_DIR); ?>

      </div>
    </div>

    <!-- table data ........................................... -->

    <div class="ab-col8" id="ab-container-table">
      <!-- ajax data here.. -->
    </div>

  </div>

  <input type="hidden" id="rootDirData" value="<?= SHARE_DIR ?>">
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
