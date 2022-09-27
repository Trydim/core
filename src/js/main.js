"use strict";

const menuClass = 'menu-toggle';
const storage = new f.LocalStorage();

const cancelFormSubmit = () => {
  f.qA('form', 'keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  });
}

const dictionaryInit = () => {
  const d = Object.create(null),
        node = f.qS('#dictionaryData');

  if (!node) return;
  d.data = JSON.parse(node.value);
  node.remove();

  d.getTitle = key => d.data[key] || key;

  /**
   * Template string can be param (%1, %2)
   * @param key - array, first item must be string
   * @returns {*}
   */
  d.translate = (...key) => {
    if (key.length === 1) return d.getTitle(key[0]);

    let str = d.getTitle(key[0]);
    for (let i = 1; i< key.length; i++) {
      key[i] && (str = str.replace(`%${i}`, key[i]));
    }
    return str;
  };
  window._ = d.translate;
}

const storageLoad = () => {
  if (!storage.length) return;
  // Mobile check
  if (f.isMobile()) storage.set('menuToggle', 'true');

  // Set Menu Toggle
  const node = f.gI('mainWrapper');
  if (node && storage.get('menuToggle') === 'true') node.classList.add(menuClass);
}

const setParentHeight = (target, height) => {
  const n = target.closest("ul[aria-expanded=\"false\"]");
  if (n) {
    n.style.height = (n.offsetHeight + height) + 'px';
    setParentHeight(n.parentNode, height);
  }
}

const setLinkMenu = () => {
  let menu = f.qS('#sideMenu');
  if (!menu) return;

  let target = menu.querySelector('.active');
  while (target) {
    let wrap = target.closest('[data-role="link"]');
    if (!wrap) return;
    target = wrap.previousElementSibling;
    target.click();
  }
}

const stopPreloader = () => {
  if (f.OUTSIDE) return;
  f.gI('preloader').remove();
  f.gI('mainWrapper').classList.add('show');
}

const setSideMenuStyle = () => {
  const node = f.gI('DBTablesWrap');
  if (!node) return;

  const h = window.innerHeight - node.parentElement.getBoundingClientRect().top - 18;
  node.style.maxHeight = h + 'px';
}

// Event function
// ---------------------------------------------------------------------------------------------------------------------

const menuToggle = () => {
  let node = f.gI('mainWrapper');
  node.classList.toggle(menuClass);
  storage.set('menuToggle', node.classList.contains(menuClass));
  setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
}

const cmsEvent = function() {
  let action = this.dataset.actionCms;

  let select = {
    menuToggle: menuToggle,
    exit: () => location.href = f.SITE_PATH + `?mode=auth&authAction=exit`,
  };

  select[action] && select[action]();
};

const sideMenuExpanded = function(e) {
  e.preventDefault();

  const nodeS  = this.nextElementSibling,
        count  = nodeS.childElementCount,
        height = count * 50;//e.target.parentNode.offsetHeight;

  if (this.getAttribute('aria-expanded') === 'true') {
    this.setAttribute('aria-expanded', 'false');
    //setParentHeight(node, node.nextElementSibling.offsetHeight * -1);
    nodeS.style.height = nodeS.dataset.height;

    setTimeout(() => {
      nodeS.style.height = '0';
    }, 0);

  } else {
    this.setAttribute('aria-expanded', 'true');
    nodeS.dataset.height = height + 'px';
    nodeS.style.height = height + 'px';
    //setParentHeight(node, height);
    setTimeout(() => {
      nodeS.style.height = 'auto';
    }, 300);
  }
}

// Event bind
// -------------------------------------------------------------------------------------------------------------------

const onEvent = () => {
  // Block Authorization
  let node = f.gI(f.ID.AUTH_BLOCK);
  node && node.querySelectorAll('[data-action]')
              .forEach(n => n.addEventListener('click', cmsEvent));

  // Menu Action
  f.qA('#sideMenu [role="button"]', 'click', sideMenuExpanded);

  f.qA('[data-action-cms]', 'click', cmsEvent);
}

// Entrance function
(() => {
  let page = location.pathname.replace(f.SITE_PATH, '').match(/(\w+)/);
  page = (page && !f.OUTSIDE) ? page[1] : 'public';

  if (f.gI('authForm')) return;

  cancelFormSubmit();
  dictionaryInit();
  f.getSetting();
  f.relatedOption();
  storageLoad();
  setSideMenuStyle();
  onEvent();
  setLinkMenu(page || '/'); // after bind events

  stopPreloader();
})();
