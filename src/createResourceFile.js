const fs = require('fs');

const absPath = '../../',
      coreBuildPath = '../assets/',
      publicSrcPath = absPath + 'public/src/',
      coreSrcCssModulePath = './css/module/',
      coreSrcJsModulePath = './js/module/',
      resFileName = 'webpackModule.js',
      configName = 'config.php';

/*let json = {
  js: Object.create(null),
  css: Object.create(null),
};*/


//import '../css/libs/material-dashboard.min.css';

let content = '';

function isDir(path) {
  return fs.lstatSync(path).isDirectory();
}

function addImport(path, mName, js = false) {
  if (fs.existsSync(path + mName + '/')) {
    let dir = fs.readdirSync(path + mName + '/');
    dir.forEach(file => {
      if (isDir(`${path + mName}/${file}`)) addImport(path + mName + '/', file);
      else {
        let str = `import('.${path + mName}/${file}');\r\n`;
        if (js) str = str.replace('./js', '');
        content += str;
      }
    });
  }
}

function addModule(mName) {
  if (menu.includes(mName)) {
    addImport(coreSrcCssModulePath, mName);
    addImport(coreSrcJsModulePath, mName, true);
    console.log('Added module' + mName);
  }
}

const config = fs.readFileSync(absPath + configName, {encoding: 'utf8'}),
      configRows = config.split('\n');

let acceptMenu = false, menu;

if (!configRows.length) throw new Error('Not Found config');
acceptMenu = configRows.filter((r) => r.includes('\'ACCESS_MENU\''));
if (acceptMenu.length !== 1) throw new Error('Menu more one rows or not found');
menu = acceptMenu[0].toLowerCase();

// Администрирование БД
let modules = ['admindb', 'calendar', 'catalog', 'customers', 'fileManager', 'orders', 'setting', 'statistic', 'users'];
modules.forEach((name) => {
  addModule(name);
});

fs.writeFileSync(absPath + 'public/' + resFileName, content);
console.log('complete');
