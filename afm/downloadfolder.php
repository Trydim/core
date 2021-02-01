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
  zip and download folder
=====================================================
*/


if(isset($_REQUEST["file"]) && !empty($_REQUEST["file"]) && $_REQUEST["file"] != 'undefined'){
	
	$dir = $_REQUEST["file"];

$folder = basename($dir);	
	

if (!empty ($folder) ){
$zip_file = $folder.'.zip';

} else{
	$zip_file = 'download.zip';
}


// Get real path for our folder
$rootPath = realpath($dir);

// Initialize archive object
$zip = new ZipArchive();
$zip->open($zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE);

// Create recursive directory iterator
/** @var SplFileInfo[] $files */
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($rootPath),
    RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ($files as $name => $file)
{
    // Skip directories (they would be added automatically)
    if (!$file->isDir())
    {
        // Get real and relative path for current file
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath) + 1);

        // Add current file to archive
        $zip->addFile($filePath, $relativePath);
    }
}

// Zip archive will be created only after closing object
$zip->close();

    if (ob_get_level()) {
      ob_end_clean();
	}

header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename='.basename($zip_file));
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($zip_file));
if (readfile($zip_file)){
	$zip = dirname(__FILE__).'/'. $zip_file;
     unlink($zip);
}
}




?>