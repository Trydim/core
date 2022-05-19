"use strict";

import './_loading.scss';

const cacheStringFunction = fn => {
  const cache = Object.create(null);
  return (str => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};

export default {
  // Simple and often used function
  // ------------------------------------------------------------------------------------------------

  /**
   * @param {string} msg
   */
  log: msg => f.DEBUG && console.log('Error:' + msg),

  // String
  // -------------------------------------------------------------------------------------------------------------------
  capitalize: cacheStringFunction(str => str.charAt(0).toUpperCase() + str.slice(1)),
  camelize: cacheStringFunction(str => {
    return str.toLowerCase()
              .replace(/\W(\w+)/g, (_, w) => w ? f.capitalize(w) : '')
              .replace(/\s|-|_/g, '');
  }),

  // Array
  // -------------------------------------------------------------------------------------------------------------------

  /**
   *
   * @param {array} arr
   * @param item
   */
  arrRemoveItem: (arr, item) => !!arr.splice(arr.indexOf(item), 1).length,

  // DOM
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Create element from string or
   *
   * @param {string|HTMLElement} htmlOrTemplate
   * @return {Node}
   */
  createElement: htmlOrTemplate => typeof htmlOrTemplate === 'string'
      ? document.createRange().createContextualFragment(htmlOrTemplate).firstElementChild
      : htmlOrTemplate['content'].firstElementChild.cloneNode(true),

  /**
   * Get Element by id from document or shadow DOM
   * @param {string} id String that specifies the ID value.
   * @return {HTMLElement} HtmlElement
   */
  gI: id => (window.shadowCalc || document).getElementById(id) || f.log('not found note by id -' + id),

  /**
   * @param {string} selector
   * @param {HTMLElement} node
   * @return {HTMLElement | {}}
   */
  qS: (selector = '', node = window.shadowCalc) =>
    (node || document).querySelector(selector) || f.log(selector),

  /**
   *
   * @param {string} selector - css selector string
   * @param {string/null} nodeKey - param/key
   * @param {string/function} value - value or function (this, Node list, current selector)
   * @return NodeListOf<HTMLElementTagNameMap[*]>|object
   */
  qA: (selector, nodeKey = null, value = null) => {
    let nodeList = (window.shadowCalc || document).querySelectorAll(selector);
    if (!nodeList) return [];
    if (nodeKey && value) nodeList.forEach(item => {
      if (typeof value === 'function') {
        item.addEventListener(nodeKey, e => value.call(item, e, nodeList, selector));
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
   * @param {string} selector
   * @return {string}
   */
  gT: selector => { let node = f.qS(selector); return node ? node.content.children[0].outerHTML : 'Not found template' + selector},

  /**
   * Получить Node шаблона
   * @param {string} selector
   * @returns {Node}
   */
  gTNode: selector => f.qS(selector).content.children[0].cloneNode(true),

  getData: selector => {
    const node = f.qS(selector),
          json = node && (JSON.parse(node.value));
    if (!node) return false;
    else node.remove();
    return json;
  },

  /**
   * get Object like associative arrays
   * @param {string} selector
   * @return {object}
   */
  getDataAsAssoc: selector => {
    const arr   = Object.values(f.getData(selector) || []),
          fItem = arr[0],
          fKeys = Object.keys(fItem);

    let oneValue = false;

    if (fKeys.length === 2 && (fItem['id'] || fItem['key'])) {
      const res = fKeys.filter(k => !['id', 'key'].includes(k));
      res.length === 1 && (oneValue = res[0]);
    }

    return arr.reduce((r, i, index) => {
      let idKey = i['id'] || i['key'] || Math.random() * 10000 | 0;
      r[idKey] && (idKey += index.toString());
      r[idKey] = oneValue ? i[oneValue] : i;
      return r;
    }, Object.create(null));
  },
  getDataAsMap: selector => new Map(Object.entries(f.getDataAsAssoc(selector) || {})),
  getDataAsSet: selector => new Set(Object.values(f.getData(selector) || [])),
  getDataAsArray : selector => Object.values(f.getData(selector) || []),

  /** Показать элементы, аргументы коллекции NodeList */
  show: (...collection) => { collection.map(nodes => {
    if (!nodes) return;
    if (!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.remove(f.CLASS_NAME.HIDDEN_NODE));
  }) },

  /**
   * Скрыть элементы
   * @param collection
   */
  hide: (...collection) => { collection.map(nodes => {
    if (!nodes) return;
    if (!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.add(f.CLASS_NAME.HIDDEN_NODE));
  }) },

  /**
   * Очистить узел от дочерних элементов (почему-то быстрее чем через innerHTMl)
   * @param {HTMLElement} node
   * @returns {*}
   */
  eraseNode: node => {
    let n;
    while ((n = node.firstChild)) n.remove();
    return node;
  },

  /**
   * Replace latin to cyrillic symbol
   * @param {string} value
   * @return {void | string}
   */
  replaceLetter: value => {
    let cyrillic = 'УКЕНХВАРОСМТ',
        latin    = 'YKEHXBAPOCMT',
        replacer = (match) => cyrillic.charAt(latin.indexOf(match)),
        letters  = new RegExp(`(${latin.split('').join('|')})`, 'gi');
    return value.replace(letters, replacer).replace(/(&nbsp| | )/g, '').toLowerCase(); // какой-то пробел
  },

  /**
   * replace ${key from obj} from template to value from obj
   * @param {string} tmpString html string template
   * @param {array|object} arrayObjects - array of object
   * @return {string}
   */
  replaceTemplate: (tmpString, arrayObjects) => {
    let html = '';

    if (tmpString) {
      if (!arrayObjects.map) arrayObjects = [arrayObjects];

      arrayObjects.map(item => {
        let tmp = tmpString.trim();
        Object.entries(item).map(v => {
          if (!v[1]) v[1] = '';
          let reg = new RegExp(`\\\${${v[0]}}`, 'mgi');
          tmp     = tmp.replace(reg, v[1].toString().replace(/"/g, '\'')); // replace ${key from obj} from template to value from obj //не помогло
        });

        html += tmp;
      })
    }

    return html;
  },

  /**
   * Input будет давать true, когда активен(checked)
   * для определения цели добавить input-у data-target="targetClass"
   * Цели добавить в data-relation в виде логического выражения
   * Истина будет показывать цель.
   * Например: data-target="target" -> data-relation="target"
   *
   * Селекторы должны иметь класс useToggleOption
   * Опциям селектора добавить data-target="targetClass"
   * @param {HTMLElement|Document} node
   */
  relatedOption: (node = document) => {
    const reg = new RegExp(/([\w\d_-]+)/, 'g'),
          qs = s => node.querySelectorAll(s),
          show = n => n.classList.remove('d-none'),
          hide = n => n.classList.add('d-none');

    const targetNodes = Object.create(null);

    const setInputMember = nodeT => {
      let match, relationT = [],
          relation = nodeT.dataset.relation.replaceAll(' ', '');

      while ((match = reg.exec(relation))) relationT.push(match[0]);
      !nodeT.id && (nodeT.id = 'target' + (Math.random() * 10000 | 0));

      targetNodes[nodeT.id] = {relation, relationT, nodesT: Object.create(null)};

      return targetNodes[nodeT.id];
    }
    const setSelectMembers = key => {
      const targetsN = [...qs(`[data-relation*="${key}"]`)];
      targetNodes[key] = [];

      if (targetsN.length) {
        qs(`[data-relation*="${key}"]`).forEach(targetN => {
          let match,
              relationT = [],
              relation  = targetN.dataset.relation.replaceAll(' ', '');

          while ((match = reg.exec(relation))) relationT.push(match[0]);

          targetNodes[key].push({targetN, relation, relationT, nodesT: Object.create(null)});
        });
      } else console.warn('Event relatedOption: target not found' + key);

      return targetNodes[key];
      }
    const checkedTarget = (node, member) => {
      let {relation, relationT} = member;

      relationT.forEach(t => {
        !member.nodesT[t] && (member.nodesT[t] = [...f.qA(`input[data-target="${t}"], select [data-target="${t}"]`)]);

        if (member.nodesT[t].length) {
          let checked = !!member.nodesT[t].find(item => item.checked || item.selected); // Находим в группе хоть 1 включенный (или противоположный выключенный)
          relation = relation.replace(t, checked.toString());
        } else console.warn('Event relatedOption: target not found' + t);
      });

      try {
        new Function('return ' + relation)() ? show(node) : hide(node);
      } catch (e) {
        console.error('Event relatedOption: relation string is not valid logic expression');
      }
    }

    // Возможно стоит добавить загрузку если целей слишком много! (определить практическим путем)
    qs('input[data-target]').forEach(eNode => {
      const target = eNode.dataset.target;
      if (!target) { console.warn('Initialisation relatedOption: ' + target + ' is empty '); return; }

      let nodesT = false, nodesR = [];

      const changeEvent = (relation = true) => {
        nodesT = nodesT || qs(`[data-relation*="${target}"]`);

        nodesT.forEach(nodeT => {
          let member = targetNodes[nodeT.id];
          !member && (member = setInputMember(nodeT));
          checkedTarget(nodeT, member);
        });

        relation && nodesR.forEach(n => n.dispatchEvent(new Event('changeR')));
      };

      if (eNode.type === 'radio' && eNode.name) {
        qs(`input[name="${eNode.name}"]`).forEach(n => {
          if (eNode !== n && n.dataset.target) {
            nodesR.push(n);
            n.addEventListener('changeR', () => changeEvent(false));
          }
        });
      }

      eNode.addEventListener('change', () => changeEvent());
      eNode.dispatchEvent(new Event('change'));// очень затратно наверное
    });
    qs('select.useToggleOption').forEach(eNode => {
      eNode.addEventListener('change', () => {
        [...eNode.options].forEach(opt => {
          const target = opt.dataset.target;
          let members;
          if (!target) return;

          members = targetNodes[target];
          !members && (members = setSelectMembers(target));

          members.forEach(member => checkedTarget(member.targetN, member));
        });
      });

      eNode.dispatchEvent(new Event('change'));// очень затратно наверное
    });
  },

  /**
   * Получить и скачать файл
   * @param {string} fileName
   * @return {HTMLAnchorElement}
   */
  createLink: fileName => {
    //let date = new Date();
    //fileName += '_' + date.getDate() + ("0" + (date.getMonth() + 1)).slice(-2) + (date.getYear() - 100) + '_' + date.getHours() + date.getMinutes() + date.getSeconds() + '.pdf';
    let a = document.createElement('a');
    a.setAttribute('download', fileName);
    return a;
  },

  /**
   * Save file from browser
   * @param data {{'name', 'type' , 'blob'}}
   *
   * @example for PDF:
   * {name: 'file.pdf',
   * type: 'base64',
   * blob: 'data:application/pdf;base64,' + data['pdfBody']}
   */
  saveFile: data => {
    const {name = 'download.file', blob} = data;
    let link = f.createLink(name);
    if (data.type === 'base64') link.href = blob;
    else link.href = URL.createObjectURL(blob);
    link.click();
  },

  /**
   * Маска для телефона
   * @param {HTMLElement} node
   * @param {string?} phoneMask
   */
  initMask: (node, phoneMask) => {
    const minValue = 2,
          maskGl = f.cmsSetting && f.cmsSetting['phoneMaskGlobal'],
          matrix = phoneMask || maskGl || f.PHONE_MASK_DEFAULT;

    if (!node || maskGl === '') return;

    const mask = e => {
      let target = e.target, i = 0,
          def = matrix.replace(/\D/g, ""),
          val = target.value.replace(/\D/g, "");

      if (def.length >= val.length) val = def;
      target.value = matrix.replace(/./g,
        a => /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a );

      if (e.type === "blur" && target.value.length <= minValue) target.value = "";
    };

    node.dataset.mask = matrix;
    ['input', 'blur'].map(e => node.addEventListener(e, mask));
  },

  /**
   * Активировать элементы
   * @param {NodeList} collection
   */
  enable: (...collection) => {
    collection.map(nodes => {
      if (!nodes.forEach) nodes = [nodes];
      nodes.forEach(n => {
        n.classList.remove(f.CLASS_NAME.DISABLED_NODE);
        n.removeAttribute('disabled');
      });
    });
  },

  /**
   * Деактивировать элементы
   * @param {NodeList} collection
   */
  disable: (...collection) => {
    collection.map(nodes => {
      if(!nodes.forEach) nodes = [nodes];
      nodes.forEach(n => {
        n.classList.add(f.CLASS_NAME.DISABLED_NODE);
        n.setAttribute('disabled', 'disabled');
      });
    });
  },

  /**
   * Добавить иконку загрузки
   * @param {HTMLElement} node
   * @param {boolean?} isLight
   */
  setLoading: (node, isLight = false) => {
    if (!(node instanceof HTMLElement)) {
      console.warn('Loading - node is not HTMLElement');
      return;
    }

    const isSingleTag = ['INPUT', 'HR', 'IMG'].includes(node.tagName),
          cStyle = window.getComputedStyle(node),
          c = node.getBoundingClientRect(),
          side = Math.min(c.width, c.height),
          size = side > 150 ? '-big' : side < 40 ? '-sm' : '';

    if (cStyle.position === 'fixed') {
      const loaderW = document.createElement('div'),
            loader  = document.createElement('div');

      loaderW.id = 'cmsLoaderWrapper';
      loaderW.style.cssText = `position: fixed; 
        left: ${node.offsetLeft}px; top: ${node.offsetTop}px;
        z-index: ${typeof cStyle.zIndex === "number" ? cStyle.zIndex + 1 : +1}`;
      loader.style.cssText = `width: ${c.width}px; height: ${c.height}px;`;

      loaderW.append(loader);
      document.body.append(loaderW);
      node = loader;
    } else if (isSingleTag) {
      const loader = document.createElement('div');

      loader.id = 'cmsLoaderWrapper';
      loader.style.cssText = `display: ${cStyle.display}; width: ${c.width}px; height: ${c.height}px;`;

      node.parentNode.append(loader);
      loader.append(node);
      node = loader;
    }

    node.classList.add('loading-st1' + size);
    isLight && node.classList.add('loading-st1-light');

    // Определить цвет?
    /*    const rgb2hsl = ([r, g, b]) => {
     const max = Math.max(r, g, b),
     min = Math.min(r, g, b),
     d = max - min;

     let h, l = (max + min) / 2;

     if (max === min) {
     h = 0;
     } else {
     //s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

     switch (max) {
     case r: h = (g - b) / d + (g < b ? 6 : 0); break;
     case g: h = (b - r) / d + 2; break;
     case b: h = (r - g) / d + 4; break;
     }
     h /= 6;
     }

     // H - цветовой тон, S - насыщенность, L - светлота
     return (h < 0.55 && l >= 0.5) || (h > 0.55 && l >= 0.75);
     //return [h, s, l];
     }


     debugger
     const color = window.getComputedStyle(node).backgroundColor,
     rgb = /(\d+),? (\d+),? (\d+)/.exec(color)[0].split(','),
     bool = rgb2hsl(rgb);*/
  },
  /**
   * Удалить иконку загрузки
   * @param {HTMLElement} node
   */
  removeLoading: node => {
    if (!(node instanceof HTMLElement)) {
      console.warn('Loading - node is not HTMLElement');
      return;
    }

    if (window.getComputedStyle(node).position === 'fixed') {
      f.gI('cmsLoaderWrapper').remove();
    }
    if (['INPUT', 'HR', 'IMG'].includes(node.tagName)) {
      node.parentNode.parentNode.append(node);
      f.gI('cmsLoaderWrapper').remove();
    } else {
      node.classList.remove('loading-st1', 'loading-st1-sm', 'loading-st1-big', 'loading-st1-light');
    }
  },

  /**
   * Функция печати по умолчанию
   * @param {object} report
   * @returns {string}
   */
  printReport: (report) => {
    let html = '';

    if (report.number)  html += `<span>Orders №${report.number}</span>${html}`;

    html += '<table>';
    Object.values(report).map(i => {
      html += '<tr><td>' + Object.values(i).join('</td><td>') + '</td></tr>';
    });
    html += '</table>';

    return f.createElement(html);
  },

  /**
   *
   * @param {HTMLElement} target - loading field
   * @param {object} report - send to pdf
   * @param {string?} report.fileName - result file name without extension
   * @param {string?} report.fileTpl - pdf template file without extension
   * @param {string?} report.pdfOrientation ['P', 'L'] - pdf orientation
   * @param {FormData?} data - object of formData to send in query Body
   * @param {function?} finishOk
   * @param {function?} err
   */
  downloadPdf(target, report = {}, data = new FormData(), finishOk = () => {}, err = () => {}) {
    f.setLoading(target);
    target.setAttribute('disabled', 'disabled');

    let fileName = report.fileName || false;
    data.set('mode', 'docs');
    data.set('docsAction', 'pdf');

    report.fileTpl && data.set('fileTpl', report.fileTpl);
    report.pdfOrientation && data.set('pdfOrientation', report.pdfOrientation.toString().toUpperCase());

    data.set('reportVal', JSON.stringify(report));

    f.Post({data}).then(data => {
      f.removeLoading(target);
      target.removeAttribute('disabled');
      if (data['pdfBody']) {
        f.saveFile({
          name: fileName || data['name'],
          type: 'base64',
          blob: 'data:application/pdf;base64,' + data['pdfBody']
        });
        finishOk();
      }
    });

    if (f.DEBUG || true) {
      window.pdfResources = () => {
        data.set('resource', 'true');
        f.Post({data}).then(data => {console.log(data['css']); console.log(data['html'])});
      }
    }
  },

  /**
   *
   * @param {object} param
   *
   * @param {object} param.customer - customer param
   * @param {?string|number} param.customer.id - id of have customer
   * @param {?string} param.customer.name - name for new customer
   * @param {?string} param.customer.phone - phone for new customer
   * @param {?string} param.customer.email - email for new customer
   * @param {?string} param.customer.address - address for new customer
   * @param {?string} param.customer.ITN - number itn for new customer
   * @param {?string|boolean} param.customerChange - add|change
   *
   * @param {?string|number} param.orderId - input or other values (save as JSON)
   * @param {?string|number} param.orderTotal - important param for show in order table (save as JSON)
   * @param {object} param.importantVal - important param for show in order table (save as JSON)
   * @param {object} param.saveVal - input or other values (save as JSON)
   * @param {object} param.reportVal - require param report (save as JSON)
   *
   * @default param.orderTotal = 0
   *
   * @return {Promise} - return object {status, customerId, orderId}
   */
  saveOrder(param) {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveOrder');

    // Customer
    param.customerChange = param.customerChange || 'add';
    param.customerChange !== 'add' && data.set('customerId', (param.customer.id || 0).toString());

    if (param.customerChange && param.customer) {
      Object.entries(param.customer).forEach(([k, v]) => data.set(k, v.toString()));
    }

    // Order
    data.set('orderId', (param.orderId || 0).toString());
    data.set('orderTotal', (param.orderTotal || 0).toString());
    data.set('importantVal', JSON.stringify(param.importantVal || {}));
    data.set('saveVal', JSON.stringify(param.saveVal || {}));
    data.set('reportVal', JSON.stringify(param.reportVal || {}));

    return f.Post({data});
  },

  /**
   * send report to mail
   * @param {object} param
   *
   * @param {?formData} param.data - docType param (email)
   *
   * @param {?string} param.docType - docType param (email)
   * @param {?string} param.email - target email
   *
   * @param {?boolean} param.addManagerInfo - add or not and information about Manager to send Documents
   *
   * @param {?boolean} param.addCustomerInfo - add or not and information about Customer to send Documents
   * @param {object} param.customer - customer param
   * @param {?string|number} param.customer.id - id of have customer
   * @param {?string} param.customer.name - name for new customer
   * @param {?string} param.customer.phone - phone for new customer
   * @param {?string} param.customer.email - email for new customer
   * @param {?string} param.customer.address - address for new customer
   * @param {?string} param.customer.info - info for new customer
   * @param {?string} param.customer.ITN - number itn for new customer
   * @param {?string|boolean} param.customerChange - add|change
   *
   * @param {?boolean} param.orderChanged -
   * @param {?string} param.orderId - id of savedOrders
   * @param {object} param.saveVal - input or other values
   * @param {object} param.reportVal - require param report
   *
   * @return {object} - result {status}
   */
  sendOrder(param) {
    const data = param.data || new FormData(),
          p    = param;

    data.set('mode', 'docs');
    data.set('docsAction', 'mail');
    !data.has('email') && data.set('email', p.email || p.customer.email);
    p.docType && data.set('docType', p.docType);

    // Показать информацию о Менеджере
    p.addManagerInfo && data.set('addManager', 'true');

    // Пользователь взять из сохранненного заказа или из найденного, если не изменен
    p.addCustomerInfo && data.set('addCustomer', 'true');

    if (f.AUTH_STATUS && p.customer && p.customer.id && !p.customerChange) {
      data.set('customerId', p.customer.id.toString());
    } else if (p.customer) {
      data.set('name', p.customer.name || '');
      data.set('phone', p.customer.phone || '');

      data.set('info', p.customer.info || '');
      data.set('customer', JSON.stringify(p.customer));
    }

    // Расчет загружен или сохранен и не изменен
    if (f.AUTH_STATUS && p.orderId && !p.orderChanged) {
      !data.has('orderId') && data.set('orderId', p.orderId.toString()); // Отчет из сохранненого заказа
    } else {
      !data.has('reportVal') && data.set('reportVal', JSON.stringify(p.reportVal || {}));
    }

    return f.Post({data});
  },

  /**
   * Курсы валют (РФ/РБ)
   * @param {string} dataSelector
   * @return {object}
   */
  getRate: (dataSelector = '#dataRate') => {
    let node = f.qS(dataSelector), rate;

    try {
      let main, k;
      rate = JSON.parse(node.value);

      main = Object.values(rate).find(r => f.toNumber(r.main));
      k = main.scale / main.rate;

      Object.values(rate).forEach(r => {
        r.rate = k * (r.rate / r.scale);
      });

      node.remove();
    } catch (e) {
      f.showMsg('Load rate error: ' + e.message, 'error');
      rate = Object.create(null);
    }
    return rate;
  },

  /**
   * Flash border element
   * @param {HTMLElement} node
   * @param {number} delay
   *
   * @default delay = 1000
   * @return {void}
   */
  flashNode: (node, delay = 1000) => {
    let def       = node.style.boxShadow,
        boxShadow = 'red 0px 0px 4px 1px';
    def === boxShadow && (def = '');
    node.style.boxShadow    = boxShadow;
    node.style.borderRadius = '4px';
    node.style.transition   = 'all 0.2s ease';
    setTimeout(() => {
      node.style.boxShadow = def || 'none';
    }, delay);
  },

  /**
   * Random int number
   * @param {number} min - from number or count digit
   * @param {number} max - until number or undefined
   * @return {number}
   */
  random: (min = 5, max= 0) => {
    return max ? Math.floor(Math.random() * (max - min + 1) + min)
               : Math.random() * Math.pow(10, min) | 0;
  },
  /**
   * Generate unique string
   * @param {number?} countChar - count of chars
   */
  unique: (countChar = 5) => new Array(countChar).fill('').map(n => {
    const r = Math.random();
    return String.fromCharCode(r < 0.334 ? f.random(48, 57) : r < 0.667 ? f.random(65, 90) : f.random(97, 122))
  }).join(''),

  /**
   * Try parse to float number from any value
   * @val {any} v
   * @return {number}
   */
  toNumber: v => f.parseNumber(v),
  parseNumber: v => {
    typeof v === 'string' && (v = v.replace(',', '.'))
    && !isFinite(v) && /\d/.test(v) && (v = parseFloat(v.match(/\d+|\.|\d+/g).join('')));
    !isFinite(v) && (v = 0);
    return +v;
  },
  /**
   * Формат цифр (разделение пробелом)
   * @param {number|string} value
   * @param {number} fractionDigits
   *
   * @default fractionDigits = 0
   */
  setFormat: (value, fractionDigits = 0) =>
    ((+value).toFixed(fractionDigits)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),

  /**
   * УДАЛИТЬ
   * Get value
   * @param {string|HTMLSelectElement} selector
   * @return {boolean|array}
   */
  getMultiSelect: selector => {
    const node = typeof selector === 'string' ? f.qS(selector) : selector;
    if (node) {
      return [...node.selectedOptions].reduce((r, option) => { r.push(option.value); return r}, []);
    }
    return false;
  },

  /**
   * trance literate
   * @param value
   * @returns {string}
   */
  transLit(value) {
    const cyrillic = 'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-'),
          latin    = 'A-a-B-b-V-v-G-g-D-d-E-e-E-e-ZH-zh-Z-z-I-i-Y-y-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch- - -Y-y- - -E-e-YU-yu-YA-ya'.split('-'),
          replacer = match => latin[cyrillic.indexOf(match)],
          letters  = new RegExp(`(${cyrillic.join('|')})`, 'g');

    return value.replaceAll(/\s/g, '_').replace(letters, replacer);
  },

  /**
   *
   */
  getSetting() {
    if (!f.INIT_SETTING) return;

    let node = f.gI('dataSettings');
    node && (f.cmsSetting = JSON.parse(node.value));
    node && node.remove();
  },
}
