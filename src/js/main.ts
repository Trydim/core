"use strict";

const MENU_CLASS = 'menu-toggle';
const storage = new f.LocalStorage();

const cancelFormSubmit = () => {
  f.qA('form', 'keypress', (e: HTMLElement|any) => {
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

  d.getTitle = (key: string) => d.data[key] || key;

  /**
   * Template string can be param (%1, %2)
   * @param key - array, first item must be string
   * @returns {*}
   */
  d.translate = (...key: string[]) => {
    if (key.length === 1) return d.getTitle(key[0]);

    let str = d.getTitle(key[0]);
    for (let i = 1; i< key.length; i++) {
      key[i] && (str = str.replace(`%${i}`, key[i]));
    }
    return str;
  };
  // @ts-ignore
  window._ = d.translate;
}

const storageLoad = () => {
  if (!storage.length) return;
  // Mobile check
  if (f.isMobile()) storage.set('menuToggle', 'true');

  // Set Menu Toggle
  let node = f.gI('mainWrapper');
  if (node && storage.get('menuToggle') === 'true') node.classList.add(MENU_CLASS);

  // set Theme
  if (storage.get('themeToggle') === 'true') {
    let node = f.qS('[data-action-cms="themeToggle"]');
    node && (node.checked = true);
    document.body.dataset.themeVersion = 'dark';
  }
}

const setParentHeight = (target: HTMLElement, height: number) => {
  const n: HTMLElement|any = target.closest("ul[aria-expanded=\"false\"]");
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
    if (!wrap) break;
    target = wrap.previousElementSibling;
    target.click();
  }

  setSideMenuStyle(menu);
}

const setSideMenuStyle = (menu: HTMLElement) => {
  const sidebarN = f.gI('sideLeft'),
        sidebarW = sidebarN && sidebarN.getBoundingClientRect().width;

  sidebarW && sidebarN.querySelectorAll('a.nav-item').forEach((liN: HTMLElement | any) => {
    const textS = liN.querySelector('.nav-text').getBoundingClientRect(),
          w = textS.left + textS.width;

    if (w > sidebarW) {
      liN.parentElement.style.width = w + 'px';
      liN.classList.add('long');
    }
  });
}

const stopPreloader = (short = true) => {
  if (f.OUTSIDE) return;
  f.gI('preloader').remove();
  short && f.gI('mainWrapper').classList.add('show');
}

// Event function
// ---------------------------------------------------------------------------------------------------------------------

const menuToggle = () => {
  let node = f.gI('mainWrapper');
  node.classList.toggle(MENU_CLASS);
  storage.set('menuToggle', node.classList.contains(MENU_CLASS));
  setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
}

const themeToggle = () => {
  const isLight = document.body.dataset.themeVersion === 'light';
  document.body.dataset.themeVersion = isLight ? 'dark': 'light';
  storage.set('themeToggle', isLight);
}

const cmsEvent = function() {
  let action = this.dataset.actionCms;

  let select = {
    menuToggle, themeToggle,
    exit: () => location.href = f.SITE_PATH + `?mode=auth&cmsAction=exit`,
  };
  // @ts-ignore
  select[action] && select[action]();
};

const sideMenuExpanded = function(e: Event) {
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
              .forEach((n: HTMLElement) => n.addEventListener('click', cmsEvent));

  // Menu Action
  f.qA('#sideMenu [role="button"]', 'click', sideMenuExpanded);

  f.qA('[data-action-cms]', 'click', cmsEvent);
}

(() => {
  if (f.gI('authForm')) { stopPreloader(false); return; }

  cancelFormSubmit();
  dictionaryInit();
  f.getSetting();
  f.relatedOption();
  storageLoad();
  onEvent();
  setLinkMenu(); // after bind events

  stopPreloader();
})();
