const fs = require('fs');

const ABS_PATH = '../../', // может можно как-то по другому?
      //CORE_BUILD_PATH = '../assets/',
      //PUBLIC_SRC_PATH = ABS_PATH + 'public/src/',
      //CORE_SRC_CSS_MODULE_PATH = './css/module/',
      CORE_SRC_JS_MODULE_PATH = './js/module/',
      RES_FILENAME = 'webpackModule.json',
      CONFIG_NAME = 'config.php';

let content = Object.create(null);

function isDir(path) {
  return fs.lstatSync(path).isDirectory();
}

function addImport(path, mName, js = false) {
  if (fs.existsSync(path + mName + '/' + mName + '.js')) {
    let dir = fs.readdirSync(path + mName + '/');
    dir.forEach(file => {
      if (isDir(`${path + mName}/${file}`)) addImport(path + mName + '/', file);
      else {
        let str = `${mName}: '${path + mName}/${file}',\n`;
        content += str;
      }
    });
  }
}

function addEntry(path, mName, js = false) {
  if (fs.existsSync(path + mName + '/' + mName + '.js')) {
    content[mName] = `${path + mName}/${mName}.js`;
  }
}

function addModule(mName) {
  if (menu.includes(mName.toLowerCase()) || mName === 'setting') {
    addEntry(CORE_SRC_JS_MODULE_PATH, mName, true);
    console.log('Added module: ' + mName);
  }
}

const config = fs.readFileSync(ABS_PATH + CONFIG_NAME, {encoding: 'utf8'}),
      configRows = config.split('\n');

let acceptMenu = false, menu;

if (!configRows.length) throw new Error('Not Found config');
acceptMenu = configRows.filter((r) => r.includes('\'ACCESS_MENU\''));
menu = acceptMenu[0].toLowerCase();

// Администрирование БД
let modules = ['admindb', 'calendar', 'catalog', 'customers', 'fileManager', 'orders', 'setting', 'statistic', 'users', 'dealers'];
modules.forEach((name) => {
  addModule(name);
});

fs.writeFileSync(ABS_PATH + 'public/' + RES_FILENAME, JSON.stringify(content));
console.log('complete');
