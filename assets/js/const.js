'use strict';

/**
 * Global variables and simple functions
 */
export const c = {
  DEBUG: true,

  PAGE_NAME: location.href,
  //FILES_PATH: '/',
  LINK_PATH: window['LINK_PATH'] || '/',
  MAIN_PHP_PATH: window['MAIN_PHP_PATH'] || 'core/php/main.php',

  CURRENT_EVENT: 'none',
  PHONE_MASK: '+7 (___) ___ __ __',

  // TODO global IDs
  // ------------------------------------------------------------------------------------------------
  ID: {
    AUTH_BLOCK: 'authBlock',
    POPUP: {
      title: 'popup_title',
    },
    PUBLIC_PAGE: 'publicPageLink'
  },

  CONST: {
    MODAL_DEF: 'modalDef',
  },

  CLASS_NAME: {
    SURFACE_FORM: 'active',

    // css класс который добавляется кнопкам сортировки в заказах
    SORT_BTN_CLASS: 'btn-light',
    // css класс который добавляется скрытым элементам
    HIDDEN_NODE: 'd-none',
    // css класс который добавляется неактивным элементам
    DISABLED_NODE: 'disabled',
    // css класс который добавляется при загрузке
    LOADING: 'loading-st1',
  },

  // TODO simple and often used function
  // ------------------------------------------------------------------------------------------------

  log: (msg) => c.DEBUG && console.log('Error:' + msg),
  /**
   * @param id
   * @return {HTMLElement | {}}
   */
  gI: (id) => document.getElementById(id ? id.replace('#', '') : '') || c.log(id),

  /**
   * @param selector
   * @return {HTMLElement | {}}
   */
  qS: (selector) => document.querySelector(selector || '') || c.log(selector),

  /**
   *
   * @param selector {string} - css selector string
   * @param nodeKey {string/null} - param/key
   * @param value - value/function, function (this, Node list, current selector)
   * @return NodeListOf<HTMLElementTagNameMap[*]>|object
   */
  qA: (selector, nodeKey = null, value = null) => {
    let nodeList = document.querySelectorAll(selector);
    if (!nodeList) return {};
    if (nodeKey && value) nodeList.forEach((item) => {
      if(typeof value === 'function') {
        item.addEventListener(nodeKey, (e) => value.call(item, e, nodeList, selector));
        //item[nodeKey] = () => value.call(item, nodeList, selector);
      } else {
        item[nodeKey] = value;
      }
    });
    return nodeList;
  },

  /**
   * получить html шаблона
   *
   * @param id {string}
   * @return {string}
   */
  gT: (id) => { let node = c.gI(id); return node ? node.content.children[0].outerHTML : 'Not found template' + id},

  /**
   * Получить Node шаблона
   * @param id {string}
   * @returns {Node}
   */
  gTNode: (id) => c.gI(id).content.children[0].cloneNode(true),

  // перевод в число
  toNumber: (input) => +(input.replace(/(\s|\D)/g, '')),
  // Формат цифр (разделение пробелом)
  setFormat: (num) => (num.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, " "),
  // Показать элементы, аргументы коллеции NodeList
  show: (...collection) => { collection.map(nodes => {
    if(!nodes) return;
    if(!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.remove(c.CLASS_NAME.HIDDEN_NODE));
  }) },
  // Скрыть элементы
  hide: (...collection) => { collection.map(nodes => {
    if(!nodes) return;
    if(!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.add(c.CLASS_NAME.HIDDEN_NODE));
  }) },
  // Очистить узел от дочерних элементов (почему-то быстрее чем через innerHTMl)
  eraseNode: (node) => {
    let n;
    while ((n = node.firstChild)) n.remove();
    return node;
  },

};

// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = (data) => {
  try { return JSON.parse(data); }
  catch (e) { document.body.innerHTML = data; }
};

const query = (url, data, type = 'json') => {
  return fetch(url, {method: 'post', body: data})
    .then(res => type === 'json' ? res.text() : res).then(
      data => {
        if (type === 'json') return checkJSON(data, type);
        else return data[type]();
      },
      error => console.log(error),
    );
};

/**
 * @type {{Post: (function({url?: *, data?: *, type?: *}): Promise),
 * Get: (function({url: *, data: *, type?: *}): Promise)}}
 */
export const q = {

  /**
   * @param url
   * @param data
   * @param type
   * @return {*}
   * @constructor
   */
  Get: ({url = c.MAIN_PHP_PATH, data, type = 'json'}) => query(url + '?' + data, '', type),

  /**
   * Fetch Post function
   * @param url
   * @param data
   * @param type
   * @returns {Promise<Response>}
   */
  Post: ({url = c.MAIN_PHP_PATH, data, type = 'json'}) => query(url, data, type),

};
