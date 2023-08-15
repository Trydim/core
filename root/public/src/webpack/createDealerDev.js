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

// Создать папки для дилеров
mkDir(dealerDir);
mkDir(dealerResourceDir);
mkDir(dealerSrcDir);

// config.php
fileContent = `<?php

$publicConfig = [
  'IS_DEALER' => true,
  'PROJECT_TITLE' => '\${dealerName}',
];

//----------------------------------------------------------------------------------------------------------------------
// DB connect/config

$dbConfig = [
  'dbPrefix'   => '\${dealerDbPrefix}',
  'dbHost'     => 'localhost',
  'dbName'     => '\${dealerDbName}',
  'dbUsername' => '\${dealerDbUser}',
  'dbPass'     => '\${dealerDbPass}',
];`;
fs.writeFileSync(dealerResourceDir + 'config.php', fileContent);

console.log('Dealer resources created');
