<?php ?>
<div class="ab-container ab-filemanager" id="ab-main">

  <div id="ab-content" class="ab-row">

    <!-- breadcrumb -->
    <div class="ab-col12" id="ab-breadcrumb">
      <div id="breadcrumb-links" class="ab-col7">
        <span class="open"><?= ABS_SITE_PATH . 'public' ?></span>

      </div>
      <div id="ab-top-action-btn" class="ab-col5 ab-text-right">
        <a id="a-create-folder" class="ab-btn asphalt" title="<?php echo $lang['create_folder_here'] ?>" href="#"><i
              class="fa fa-folder-o" aria-hidden="true"></i> </a>

        <button id="createfile" class="ab-btn asphalt" title="<?php echo $lang['create_file_here'] ?>"><i
              class="fa fa-file-text-o" aria-hidden="true"></i></button>

        <div id="div-uploadfile" class="ab-btn asphalt fa fa-upload" title="<?php echo $lang['upload_file_here'] ?>">
          <form id="frm-uploadfile" name="frm-uploadfile" enctype="multipart/form-data">
            <input type="file" id="file" name="file[]" multiple="multiple">
            <input type="hidden" id="inputpath" name="inputpath">
          </form>
        </div>

        <a id="zipsite" class="ab-btn asphalt" title="<?php echo $lang['zip_and_download_site'] ?>"
           href="<?= $config['rootdirectory'] ?>downloadfolder.php?file=<?php echo ROOT ?>">
          <i class=" fa fa-download"
                                                                                               aria-hidden="true"></i></a>
        <a class="ab-btn asphalt" title="<?php echo $lang['general_settings'] ?>"
           href="<?= $config['rootdirectory'] ?>editor.php?editfile=config.php"
           target="_blank"><i class=" fa fa-cog" aria-hidden="true"></i></a>

      </div>
    </div>

    <!-- left panel ........................................... -->

    <div id="leftpanel" class="ab-col4">
      <div id="tree">

        <div id="home" data-fo="<?= ABS_SITE_PATH . 'public/' ?>" class="closed selected">
          <?php echo basename(ABS_SITE_PATH . 'public/') ?>
        </div>
        <!-- tree  -->
        <?php tree(ABS_SITE_PATH . 'public/'); ?>

      </div>
    </div>

    <!-- table data ........................................... -->

    <div class="ab-col8" id="ab-container-table">
      <!-- ajax data here.. -->
    </div>

  </div>

</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
