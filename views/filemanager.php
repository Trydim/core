<?php  if ( !defined('MAIN_ACCESS')) die('access denied!');

require_once CORE . 'afm/index.php';
/*$field['headContent']    = <<<headContent
headContent;
$field['pageHeader']    = <<<pageHeader
pageHeader;
$field['pageFooter']    = <<<pageFooter
pageFooter;
$field['sideLeft']      = <<<sideLeft
sideLeft;*/

$field['content']       = template('parts/managerContent', ['config' => $config]);
/*$field['content']       = <<<content
<div class="ab-container ab-filemanager" id="ab-main">

  <div id="ab-content" class="ab-row">

    <!-- breadcrumb -->
    <div class="ab-col12" id="ab-breadcrumb">
      <div id="breadcrumb-links" class="ab-col7">
        <span class="open"><?= ABS_SITE_PATH . 'public'?></span>

      </div>
      <div id="ab-top-action-btn" class="ab-col5 ab-text-right">
        <a id="a-create-folder" class="ab-btn asphalt" title="Создать папку" href="#">
          <i class="fa fa-folder-o" aria-hidden="true"></i>
        </a>

        <button id="createfile" class="ab-btn asphalt" title="Создать файл">
          <i class="fa fa-file-text-o" aria-hidden="true"></i>
        </button>

        <div id="div-uploadfile" class="ab-btn asphalt fa fa-upload" title="Загрузить файл">
          <form id="frm-uploadfile" name="frm-uploadfile" enctype="multipart/form-data">
            <input type="file" id="file" name="file[]" multiple="multiple">
            <input type="hidden" id="inputpath" name="inputpath">
          </form>
        </div>

        <a id="zipsite" class="ab-btn asphalt" title="Сжать и скачать"
           href="core/afm/downloadfolder.php?file=/">
           <i class=" fa fa-download" aria-hidden="true"></i>
        </a>
        <a class="ab-btn asphalt" title="Настройки"
           href="core/afm/editor.php?editfile=config.php"
           target="_blank"><i class=" fa fa-cog" aria-hidden="true"></i>
        </a>

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
content;*/
/*$field['sideRight']     = <<<sideRight
sideRight;
$field['cssLinks']      = []; // file link
//$field['jsLinks']       = []; // file link
$field['footerContent'] = <<<footerContent
footerContent;*/
