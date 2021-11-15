"use strict";

const importModuleFunc = async moduleName => {
  let link;
  if (moduleName === 'public') {
    link = `${f.SITE_PATH}public/js/${f.PUBLIC_PAGE}.js`;
    moduleName = f.PUBLIC_PAGE;
  } else link = `./module/${moduleName}/${moduleName}.js`;

  try {
    let importModule = await new Promise((resolve, reject) => {
      import(/* webpackIgnore: true */ link)
        .then(module => resolve(module[moduleName]))
        .catch(err => reject(err));
    });
    return importModule.init() || false;
  } catch (e) { console.error(e); f.showMsg(e, 'error', false); return false; }
}

//Index.php page
const initIndex = () => {
  //f.init('');
}

const init = (moduleName = 'default') => {
  let module = importModuleFunc(moduleName);
  if (!module) initIndex();
  f.relatedOption();
  return module;
}

const setLinkMenu = page => {
  let menu = f.qS('#sidebarMenu');
  if (!menu) return;

  let target = menu.querySelector('.active');
  while (target) {
    let wrap = target.closest('[data-role="link"]');
    if (!wrap) return;
    target = wrap.previousElementSibling;
    target.click();
  }

  for (let n of [...menu.querySelectorAll('a')]) {
    let href = n.getAttribute('href') || '';
    if(href.includes(page)) { n.classList.add('active'); break; }
  }
}

const cancelFormSubmit = () => {
  f.qA('form', 'keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  });
}

const stopPreloader = () => {
  f.gI('preloader').remove();
  f.gI('mainWrapper').classList.add('show');
}

const setParentHeight = (target, height) => {
  const n = target.closest("ul[aria-expanded=\"false\"]");
  if (n) {
    n.style.height = (n.offsetHeight + height) + 'px';
    setParentHeight(n.parentNode, height);
  }
}

// Event function
// ---------------------------------------------------------------------------------------------------------------------

const authEvent = function(e) {
  let target = e.target,
      action = this.getAttribute('data-action');

  let select = {
    'exit': () => {
      location.href = f.SITE_PATH + `?mode=auth&authAction=exit`;
    }
  }

  select[action]();
};

const sideMenuExpanded = (e, node) => {
  e.preventDefault();

  const count = node.nextElementSibling.childElementCount,
        height = count * 50;//e.target.parentNode.offsetHeight;

  if (node.getAttribute('aria-expanded') === 'true') {
    node.setAttribute('aria-expanded', 'false');
    setParentHeight(node, node.nextElementSibling.offsetHeight * -1);
    node.nextElementSibling.style.height = '0';
  } else {
    node.setAttribute('aria-expanded', 'true');
    node.nextElementSibling.style.height = height + 'px';
    setParentHeight(node, height);
  }
}

// Event bind
// -------------------------------------------------------------------------------------------------------------------

// Block Authorization
const onAuthEvent = () => {
  let node = f.gI(f.ID.AUTH_BLOCK);
  node && node.querySelectorAll('[data-action]')
              .forEach(n => n.addEventListener('click', authEvent));
}

const onClickSubmenu = () => {
  f.qA('#sidebarMenu [role="button"]').forEach(n =>
    n.addEventListener('click', (e) => sideMenuExpanded(e, n))
  );
}

// Entrance function
(() => {
  let page = location.pathname.replace(f.SITE_PATH, '').match(/(\w+)/);
  page = (page && !f.OUTSIDE) ? page[1] : 'public';

  if (f.gI('authForm')) return;
  cancelFormSubmit();
  onAuthEvent();
  onClickSubmenu();
  f.dictionaryInit();

  setLinkMenu(page || '/');
  if(page) init(page);
  else initIndex();

  stopPreloader();

  setTimeout(() => { // todo разобраться с синхронизацией
    f.initShadow(); // todo убрать отсюда
  }, 100);
})();
