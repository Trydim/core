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

const cmsEvent = function() {
  let action = this.getAttribute('data-action');

  let select = {
    'menuToggle': () => {
      f.gI('mainWrapper').classList.toggle('menu-toggle');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    'exit': () => {
      location.href = f.SITE_PATH + `?mode=auth&authAction=exit`;
    }
  };

  select[action] && select[action]();
};

const sideMenuExpanded = (e, node) => {
  e.preventDefault();

  const nodeS  = node.nextElementSibling,
        count  = nodeS.childElementCount,
        height = count * 50;//e.target.parentNode.offsetHeight;

  if (node.getAttribute('aria-expanded') === 'true') {
    node.setAttribute('aria-expanded', 'false');
    //setParentHeight(node, node.nextElementSibling.offsetHeight * -1);
    nodeS.style.height = nodeS.dataset.height;

    setTimeout(() => {
      nodeS.style.height = '0';
    }, 0);

  } else {
    node.setAttribute('aria-expanded', 'true');
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

const onBind = () => {
  // Block Authorization
  let node = f.gI(f.ID.AUTH_BLOCK);
  node && node.querySelectorAll('[data-action]')
              .forEach(n => n.addEventListener('click', cmsEvent));

  if (node) return;
  // Menu Action
  f.qA('#sidebarMenu [role="button"]').forEach(n =>
    n.addEventListener('click', e => sideMenuExpanded(e, n))
  );

  node = f.qS('[data-action="menuToggle"]');
  node && node.addEventListener('click', cmsEvent);
}

// Entrance function
(() => {
  let page = location.pathname.replace(f.SITE_PATH, '').match(/(\w+)/);
  page = (page && !f.OUTSIDE) ? page[1] : 'public';

  if (f.gI('authForm')) return;
  cancelFormSubmit();
  onBind();
  f.dictionaryInit();

  setLinkMenu(page || '/');
  if(page) init(page);
  else initIndex();

  stopPreloader();

  testT();

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
