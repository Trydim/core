<?php
/*
=====================================================
  Abashy Filemanager - by Abashy.com, Alexander Esin
-----------------------------------------------------
 http://abashy.com/
-----------------------------------------------------
 Copyright (c) 2015 Alexander Esin
=====================================================
 ƒанный код защищен авторскими правами
 .....................................
  delete folder 
=====================================================
*/

error_reporting(E_ALL);

function deletefolder($dir)
{

$iterator = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
$files = new RecursiveIteratorIterator($iterator,
             RecursiveIteratorIterator::CHILD_FIRST);
foreach($files as $file) {
    if ($file->isDir()){
        rmdir($file->getRealPath());
    } else {
        unlink($file->getRealPath());
    }
}
rmdir($dir);
return true;

} 

if (isset($_GET['folder']) && !empty($_GET['folder']) && $_GET['folder'] != 'undefined')
{ 

if (file_exists($_GET['folder'])) {
	
   $url = $_GET['folder'];
   
      if (deletefolder($url))
		{

		echo 'Directory deleted';
		
		}else{
			
			echo 'Error delete folder';
			
		}
} else
{
	echo 'Not found. Please refresh page';
}
}
else
{	

echo 'Error get data';	

}
?>
