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

const loadLangList = () => {
  const node = f.qS('#cmsLangSelect');
  if (!node) return;

  f.Get({data: {mode: 'dictionary', cmsAction: 'loadLanguages'}}).then((data: any) => {
    if (data.status) {
      const list = data['languagesList'],
            v = f.cookieGet('lang') || list[0].code;

      node.innerHTML = list.map((i: {code: string, name: string}) => {
        return `<option value="${i.code}">${i.name}</option>`;
      }).join('');

      node.value = v;
      f.cookieSet('lang', v);
    } else {
      node.remove();
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
   * The template can have params such as %1, %2 and etc
   * @param key - array, first item must be string
   * @returns {*}
   */
  d.translate = (...key: string[]) => {
    if (key.length === 1) return d.getTitle(key[0]);

    let str = d.getTitle(key[0]);
    for (let i = 1; i < key.length; i++) {
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

  // Set theme
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

  setSideMenuStyle();
}

const setSideMenuStyle = (init = true) => {
  const sidebarN = f.gI('sideLeft'),
        sidebarW = sidebarN && sidebarN.getBoundingClientRect().width;

  if (init) {
    sidebarW && sidebarN.querySelectorAll('a.nav-item').forEach((liN: HTMLElement | any) => {
      const textS = liN.querySelector('.nav-text').getBoundingClientRect(),
            w = textS.left + textS.width;

      if (w > sidebarW) {
        liN.parentElement.style.width = w + 'px';
        liN.classList.add('long');
      }
    });
  } else {
    sidebarN.querySelectorAll('.long').forEach((n: HTMLElement) => n.classList.remove('long'));
    sidebarN.querySelectorAll('li').forEach((n: HTMLElement) => n.style.width = 'auto');
  }
}

const startPreloader = () => {
  f.show(f.gI('preloader'));
  f.gI('mainWrapper').classList.remove('show');
}

const stopPreloader = (short = true) => {
  if (f.OUTSIDE) return;
  f.hide(f.gI('preloader'));
  short && f.gI('mainWrapper').classList.add('show');
}

// Event function
// ---------------------------------------------------------------------------------------------------------------------
const menuToggle = () => {
  let node = f.gI('mainWrapper'), isShort: boolean;
  node.classList.toggle(MENU_CLASS);
  isShort = node.classList.contains(MENU_CLASS);
  storage.set('menuToggle', isShort);

  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
  setTimeout(() => {
    setSideMenuStyle(!isShort);
  }, 500);
}

const themeToggle = () => {
  const isLight = document.body.dataset.themeVersion === 'light';
  document.body.dataset.themeVersion = isLight ? 'dark': 'light';
  storage.set('themeToggle', isLight);
}

const langChange = (target: HTMLSelectElement) => {
  target.onchange = () => {
    startPreloader();

    f.Post({data: {
      mode     : 'dictionary',
      cmsAction: 'changeLang',
      lang     : target.value,
    }}).then(data => {
      if (data.status) {
        f.cookieSet('lang', target.value);
        location.reload()
      }
    });
  };
}

const cmsEvent = function() {
  let action = this.dataset.actionCms;

  let select = {
    menuToggle, themeToggle,
    langChange,
    exit: () => location.href = f.SITE_PATH + `?mode=auth&cmsAction=exit`,
  };
  // @ts-ignore
  select[action] && select[action](this);
};

const sideMenuExpanded = function(e: Event) {
  e.preventDefault();

  const nodeS  = this.nextElementSibling,
        count  = nodeS.childElementCount,
        height = count * 50;

  if (this.getAttribute('aria-expanded') === 'true') {
    this.setAttribute('aria-expanded', 'false');
    nodeS.style.height = nodeS.dataset.height;

    setTimeout(() => nodeS.style.height = '0', 0);
  } else {
    this.setAttribute('aria-expanded', 'true');
    nodeS.dataset.height = height + 'px';
    nodeS.style.height = height + 'px';
    setTimeout(() => nodeS.style.height = 'auto', 300);
  }
}

// Event bind
// -------------------------------------------------------------------------------------------------------------------

const onEvent = () => {
  // Authorization block
  let node = f.gI(f.ID.AUTH_BLOCK);
  node && node.querySelectorAll('[data-action]')
              .forEach((n: HTMLElement) => n.addEventListener('click', cmsEvent));

  // Menu Action
  f.qA('#sideMenu [role="button"]', 'click', sideMenuExpanded);

  f.qA('[data-action-cms]', 'click', cmsEvent);
}

document.addEventListener("DOMContentLoaded", () => {
  if (f.gI('authForm')) { stopPreloader(false); return; }

  cancelFormSubmit();
  loadLangList();
  dictionaryInit();
  f.getSetting();
  f.relatedOption();
  storageLoad();
  onEvent();
  setLinkMenu(); // after bind events

  stopPreloader();
});
