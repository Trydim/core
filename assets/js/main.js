"use strict";

const importModuleFunc = async (moduleName) => {
  let link;
  if (moduleName === 'public') {
    link = `${f.LINK_PATH}public/js/${f.PUBLIC_PAGE}.js`;
    moduleName = f.PUBLIC_PAGE;
  } else link = `./module/${moduleName}/${moduleName}.js`;

  try {
    let importModule = await new Promise((resolve, reject) => {
      import(/* webpackIgnore: true */ link)
        .then(module => resolve(module[moduleName]))
        .catch(err => reject(err));
    });
    return importModule.init() || false;
  } catch (e) { console.log(e); return false; }
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

const setLinkMenu = (page) => {
  for (let n of [...f.qA('a')]) {
    let href = n.getAttribute('href') || '';
    if (href.includes(page) && href.includes('#')) n.click();
    else if(href.includes(page)) { n.parentNode.classList.add('active'); break; }
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

// TODO event function
// ---------------------------------------------------------------------------------------------------------------------

const authEvent = function(e) {
  let target = e.target,
      action = this.getAttribute('data-action');

  let select = {
    'exit' : () => {
      location.href = f.LINK_PATH + `?mode=auth&authAction=exit`;
    }
  }

  select[action]();
};

const sideMenuExpanded = (e, node) => {
  e.preventDefault();
  if( node.getAttribute('aria-expanded') === 'true'){
    node.setAttribute('aria-expanded', 'false');
    node.nextElementSibling.classList.add('d-none');
  } else {
    node.setAttribute('aria-expanded', 'true');
    node.nextElementSibling.classList.remove('d-none');
  }
}

// TODO event bind
// -------------------------------------------------------------------------------------------------------------------

// Block Authorization
const onAuthEvent = () => {
  let node = f.gI(f.ID.AUTH_BLOCK);
  node && node.querySelectorAll('input').forEach(n => n.onclick = authEvent );
}

const onClickSubmenu = () => {
  let node = f.qS('#sideMenu a[href^="#"]');
  node && node.addEventListener('click', (e) => sideMenuExpanded(e, node));
}

//entrance function
(() => {
  let page = f.PAGE_NAME.match(/[?<=\w][?<=\/](\w+)([?=(\?)]|[?=(\/)]|$)/);
  page = page ? page[1] : 'public';

  if (f.gI('authForm')) return;
  cancelFormSubmit();
  onAuthEvent();
  onClickSubmenu();

  setLinkMenu(page || '/');
  if(page) init(page);
  else initIndex();

})();
