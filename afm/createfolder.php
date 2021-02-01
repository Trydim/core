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
  create folder 
=====================================================
*/

error_reporting(E_ALL);

if (isset($_GET['urlfolder']) && !empty($_GET['urlfolder']) && $_GET['urlfolder'] != 'undefined')
{ 

   $url = $_GET['urlfolder'];
   
      if (mkdir($url, 0777, true))
		{

		echo 'Directory created';
		
		}else{
			
			echo 'Error path for folder';
			
		}

}
else
{	

echo 'Error get data';	

}
?>
