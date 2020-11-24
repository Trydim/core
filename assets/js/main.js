"use strict";

import {main} from "./control/function.js";
export const f = main;

//Index.php page
const initIndex = () => {
  f.init('home');
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
// -------------------------------------------------------------------------------------------------------------------

const authEvent = function(e) {
  let target = e.target,
      action = this.getAttribute('data-action');

  let select = {
    'exit' : () => {
      let data = new FormData();

      data.set('mode', 'auth');
      data.set('authAction', 'exit');

      f.Post({data}).catch(er => {});
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
  page = page && page[1];

  cancelFormSubmit();
  if (f.gI('authForm')) return;

  onAuthEvent();
  onClickSubmenu();

  setLinkMenu(page || '/');
  if(page) f.init(page);
  else initIndex();

})();
