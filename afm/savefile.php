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
  save file 
=====================================================
*/

error_reporting(E_ALL);


if (isset($_POST['areacode']) && !empty($_POST['areacode']) && $_POST['areacode'] != 'undefined')
{
    if (isset($_POST['inputfilename']) && !empty($_POST['inputfilename']) && $_POST['inputfilename'] != 'undefined')
		
	$path = $_POST['inputfilename'];

	$content = $_POST['areacode'];

	if (file_put_contents($path, $content))
	{
	  echo 'Saved';
	}
	 else
		echo 'Error: save file';

	
	
}
else
	echo 'Error: get data from editor failed';

?>
