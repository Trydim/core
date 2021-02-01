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
  delete file 
=====================================================
*/

error_reporting(E_ALL);

if (isset($_GET['file']) && !empty($_GET['file']) && $_GET['file'] != 'undefined')
{ 

   $url = $_GET['file'];
   
      if (unlink($url))
		{

		echo 'File deleted';
		
		}else{
			
			echo 'Error delete file';
			
		}

}
else
{	

echo 'Error get data';	

}
?>
