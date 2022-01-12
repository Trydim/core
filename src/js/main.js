"use strict";

const setLinkMenu = page => {
  let menu = f.qS('#sideMenu');
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
    if (href.includes(page)) { n.classList.add('active'); break; }
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

const cmsEvent = function() {
  let action = this.dataset.actionCms;

  let select = {
    'menuToggle': () => {
      f.gI('mainWrapper').classList.toggle('menu-toggle');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    'exit': () => {
      location.href = f.SITE_PATH + `?mode=auth&authAction=exit`;
    },
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
  setLinkMenu(page || '/');
  f.relatedOption();
  onEvent();

  stopPreloader();

  setTimeout(() => { // todo разобраться с синхронизацией
    f.initShadow(); // todo убрать отсюда
  }, 100);
})();

function testT() {
  const nodes = f.qA('[data-tooltip]');

  // top end bottom start
  const getArrow = side => {
    switch (side) {

    }
  }

  nodes.forEach(n => {
    const position = n.computedStyleMap().get('position'),
          coord = n.getBoundingClientRect(),
          start = { top: coord.y + coord.height / 2, left: coord.x},
          top = { top: coord.y, left: coord.x + coord.width / 2},
          end = { top: coord.y + coord.height / 2, left: coord.x + coord.width},
          bottom = { top: coord.y + coord.height, left: coord.x + coord.width / 2};

    position === 'static' && (n.style.position = 'relative');

    n.addEventListener('mouseenter', function () {
      if (position !== 'static') {

      }

      const tool = document.createElement('div');
      tool.style.value = 'position-fixed';
      tool.style.top = coord;
    });
    n.addEventListener('mouseleave', function () {
      if (position !== 'static') {

      }
    });
  });



  /*<div class="tooltip fade show bs-tooltip-end" role="tooltip"
   style="position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate(632px, 1922px);"
   data-popper-placement="right">
   <div class="tooltip-arrow" style="position: absolute; top: 0px; transform: translate(0px, 8px);"></div>
   <div class="tooltip-inner">Tooltip on right</div>
   </div>*/
}
