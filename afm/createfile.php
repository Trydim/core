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
  create file 
=====================================================
*/

error_reporting(E_ALL);

if (isset($_GET['urlfile']) && !empty($_GET['urlfile']) && $_GET['urlfile'] != 'undefined')
{ 

   $url = $_GET['urlfile'];
   
if($fh = fopen($url,'w')){

		echo 'File created';
		fclose($fh);
		}else{
			
			echo 'Error path for file';
			
		}

}
else
{	

echo 'Error get data';	

}
?>
