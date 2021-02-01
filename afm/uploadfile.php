<?php
/*
=====================================================
  Abashy Filemanager - by Abashy.com, Alexander Esin
-----------------------------------------------------
 http://abashy.com/
-----------------------------------------------------
 Copyright (c) 2015 Alexander Esin
=====================================================
 Данный код защищен авторскими правами
 .....................................
  delete file 
=====================================================
*/


error_reporting(E_ALL);

    $msg = '';

 if(count($_FILES['file']['name']) > 0 && !empty($_FILES['file']['name']) && $_FILES['file']['name'] != 'undefined'){
        //Loop through each file
        for($i = 0; $i < count($_FILES['file']['name']); $i++) {
		
		$shortname = $_FILES['file']['name'][$i];

          //Get the temp file path
            $tmpFilePath = $_FILES['file']['tmp_name'][$i];

            //Make sure we have a filepath
            if($tmpFilePath != ""){
                

                //save the url and the file
				if (isset($_POST['inputpath']) && !empty($_POST['inputpath']) && $_POST['inputpath'] != 'undefined' && stream_resolve_include_path($_POST['inputpath']))
                $filePath = $_POST['inputpath'].$_FILES['file']['name'][$i];

                //Upload the file into the temp dir
                if(move_uploaded_file($tmpFilePath, $filePath)) {
				
                $msg .= $shortname.'/';

                }
              }
        }
		echo $msg;
    }

?>