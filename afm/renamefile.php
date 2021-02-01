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
  rename file,  folder 
=====================================================
*/

error_reporting(E_ALL);

if (isset($_GET['oldname']) && !empty($_GET['oldname']) && $_GET['oldname'] != 'undefined')
{ 

   $old = $_GET['oldname'];
   $new = $_GET['newname'];
   
if (rename($old, $new)){

		echo 'Renamed';

		}else{
			
			echo 'Error path for file';
			
		}

}
else
{	

echo 'Error get data';	

}
?>
