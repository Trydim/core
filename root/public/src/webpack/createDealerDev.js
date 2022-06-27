const fs = require('fs');

const absPath = '../../../', // может можно как-то по другому?
      rootDir = absPath + 'core/root/',
      dealerDir = absPath + 'dealers/',
      dealerResourceDir = dealerDir + 'resource/',
      dealerSrcDir = dealerDir + 'src/';

let fileContent, param, index;

const mkDir = path => {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
const readFileAsArray = path => {
  return fs.readFileSync(path, {encoding: 'utf8'}).split('\n');
}
const writeArrayToFile = (path, data) => {
  fs.writeFileSync(path, data.join('\n'));
}
/*

// Создать папки для дилеров
mkDir(dealerDir);
mkDir(dealerResourceDir);
mkDir(dealerSrcDir);

// Скопировать необходимые файлы
// .htaccess
//param = [6, 12, 15] // Строки заменить
//fileContent = readFileAsArray(rootDir + '.htaccess');
//param.forEach(str => {
  //fileContent[str - 1] = fileContent[str - 1].replace(' /', ' ${dealerDir}');
//});
//writeArrayToFile(dealerResourceDir + '.htaccess', fileContent);

// index.php
fileContent = readFileAsArray(rootDir + 'index.php');
fileContent[7] = fileContent[7].replace('core', '../../core');
writeArrayToFile(dealerResourceDir + 'index.php', fileContent);
*/

// config.php
fileContent = `<?php

$publicConfig = [
  'PROJECT_TITLE' => '\${dealerName}',
];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config

$dbConfig = [
  'dbHost'     => 'localhost',
  'dbName'     => '\${dealerDbName}',
  'dbUsername' => '\${dealerDbUser}',
  'dbPass'     => '\${dealerDbPass}',
];`;
fs.writeFileSync(dealerResourceDir + 'config.php', fileContent);

console.log('Dealer resources created');
