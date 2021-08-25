import {c} from "./const.js";
import {q} from "./query.js";

const func = {

  // Simple and often used function
  // ------------------------------------------------------------------------------------------------

  log: (msg) => c.DEBUG && console.log('Error:' + msg),

  /**
   * deprecated wrap for f.qS
   * @param id
   * @return {HTMLElement | {}}
   */
  gI: (id) => func.qS('#' + id),

  /**
   * @param selector
   * @param node
   * @return {HTMLElement | {}}
   */
  qS: (selector = '', node = c.calcWrap) => {
    node = node || document;
    return node.querySelector(selector) || document.querySelector(selector) || func.log(selector);
  },

  /**
   *
   * @param selector {string} - css selector string
   * @param nodeKey {string/null} - param/key
   * @param value - value/function, function (this, Node list, current selector)
   * @return NodeListOf<HTMLElementTagNameMap[*]>|object
   */
  qA: (selector, nodeKey = null, value = null) => {
    let  node = c.calcWrap || document,
         nodeList = node.querySelectorAll(selector);
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
   * @param selector {string}
   * @return {string}
   */
  gT: (selector) => { let node = func.qS(selector); return node ? node.content.children[0].outerHTML : 'Not found template' + id},

  /**
   * Получить Node шаблона
   * @param selector {string}
   * @returns {Node}
   */
  gTNode: (selector) => func.qS(selector).content.children[0].cloneNode(true),

  // перевод в число
  toNumber: (input) => +(input.replace(/(\s|\D)/g, '')),

  // Формат цифр (разделение пробелом)
  setFormat: (num) => (num.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, " "),

  /** Показать элементы, аргументы коллекции NodeList */
  show: (...collection) => { collection.map(nodes => {
    if(!nodes) return;
    if(!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.remove(c.CLASS_NAME.HIDDEN_NODE));
  }) },

  /**
   * Скрыть элементы
   * @param collection
   */
  hide: (...collection) => { collection.map(nodes => {
    if(!nodes) return;
    if(!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.add(c.CLASS_NAME.HIDDEN_NODE));
  }) },

  /**
   * Очистить узел от дочерних элементов (почему-то быстрее чем через innerHTMl)
   * @param node
   * @returns {*}
   */
  eraseNode: (node) => {
    let n;
    while ((n = node.firstChild)) n.remove();
    return node;
  },

  /**
   * Replace latin to cyrillic symbol
   * @param value
   * @return {void | string}
   */
  replaceLetter: (value) => {
    let cyrillic = 'УКЕНХВАРОСМТ',
        latin    = 'YKEHXBAPOCMT',
        replacer = (match) => cyrillic.charAt(latin.indexOf(match)),
        letters  = new RegExp(`(${latin.split('').join('|')})`, 'gi');
    return value.replace(letters, replacer).replace(/(&nbsp| | )/g, '').toLowerCase(); // какой-то пробел
  },

  /**
   * replace ${key from obj} from template to value from obj
   * @param tmpString html string template
   * @param arrayObjects array of object
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
   *
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
      let nodesT = false;

      if (!target) { console.warn('Initialisation relatedOption: target is empty' + target); return; }

      if (eNode.type === 'radio' && eNode.name) {
        qs(`input[name="${eNode.name}"]`).forEach(n => {
          !n.dataset.target && n.addEventListener('change', () => eNode.dispatchEvent(new Event('change')));
        });
      }

      eNode.addEventListener('change', () => {
        nodesT = nodesT || qs(`[data-relation*="${target}"]`);

        nodesT.forEach(nodeT => {
          let member = targetNodes[nodeT.id];
          !member && (member = setInputMember(nodeT));
          checkedTarget(nodeT, member);
        });
      });

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
   * @param fileName
   * @return {HTMLAnchorElement}
   */
  createLink: (fileName) => {
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
  saveFile: (data) => {
    const {name = 'download.file', blob} = data;
    let link = func.createLink(name);
    if (data.type === 'base64') link.href = blob;
    else link.href = URL.createObjectURL(blob);
    link.click();
  },

  // Маска для телефона
  maskInit: (node, phoneMask) => {
    if (!node) return;
    const minValue = 2;

    const mask = (e) => {
      let target = e.target, i = 0,
          matrix = phoneMask || c.PHONE_MASK,
          def = matrix.replace(/\D/g, ""),
          val = target.value.replace(/\D/g, "");

      if (def.length >= val.length) val = def;
      target.value = matrix.replace(/./g,
        a => /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a );

      if (e.type === "blur" && target.value.length <= minValue) target.value = "";
    }

    ['input', 'focus', 'blur'].map(e => node.addEventListener(e, mask));
  },

  // Активировать элементы
  enable: (...collection) => {
    collection.map(nodes => {
      if(!nodes.forEach) nodes = [nodes];
      nodes.forEach(n => {

        n.classList.remove(c.CLASS_NAME.DISABLED_NODE);
        n.removeAttribute('disabled');

        /*switch (n.tagName) { TODO что это
         case 'BUTTON': case 'INPUT': { }
         case 'A': { }
         }*/
      });
    });
  },

  // Деактивировать элементы
  disable: (...collection) => {
    collection.map(nodes => {
      if(!nodes.forEach) nodes = [nodes];
      nodes.forEach(n => {
        n.classList.add(c.CLASS_NAME.DISABLED_NODE);
        n.setAttribute('disabled', 'disabled');
      });
    });
  },

  /** Добавить иконку загрузки */
  setLoading: (node) => {
    node && node.classList.add(c.CLASS_NAME.LOADING);
  },
  /** Удалить иконку загрузки */
  removeLoading: (node) => {
    node && node.classList.remove(c.CLASS_NAME.LOADING);
  },

  /**
   * Функция печати по умолчанию
   * @param report
   * @param number
   * @returns {string}
   */
  printReport: (report, number = 1) => {
    let table = f.gTNode('#printTable'),
        html = '';

    Object.values(report).map(i => {
      html += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td></tr>`;
    });

    if (number) table.querySelector('#number').innerHTML = number.toString();
    else table.querySelector('#numberWrap').classList.add(f.CLASS_NAME.HIDDEN_NODE);
    table.querySelector('tbody').innerHTML = html;
    return table.outerHTML;
  },

  /**
   *
   * @param target HTML node (loading field)
   * @param report {object}: send to pdf
   * @param data {FormData}: object of formData to send in query Body
   * @param finishOk function
   * @param err function
   */
  downloadPdf(target, report = {}, data = new FormData(), finishOk = () => {}, err = () => {}) {
    if (!Object.keys(report).length) { err(); return; }

    func.setLoading(target);
    target.setAttribute('disabled', 'disabled');

    let fileName = report.fileName || false;
    //data.set('dbAction', 'DB');
    data.set('mode', 'docs');
    data.set('docType', 'pdf');
    data.set('reportVal', JSON.stringify(report));

    q.Post({data}).then(data => {
      func.removeLoading(target);
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
  },

  /**
   * Словарь
   */
  dictionaryInit() {
    const d = Object.create(null),
          node = f.qS('#dictionaryData');

    if (!node) return;
    d.data = JSON.parse(node.value);
    node.remove();

    d.getTitle = function (key) { return this.data[key] || key; }

    /**
     * Template string can be param (%1, %2)
     * @param key - array, first item must be string
     * @returns {*}
     * @private
     */
    d.translate = function (...key) {
      if(key.length === 1) return d.getTitle(key[0]);
      else {
        let str = d.getTitle(key[0]);
        for(let i = 1; i< key.length; i++) {
          if(key[i]) str = str.replace(`%${i}`, key[i]);
        }
        return str;
      }
    };
    window._ = d.translate;
  },

  // Курсы валют (РФ)
  setRate(dataSelector = '#dataRate') {
    let node = f.qS(dataSelector), json;
    node && (json = JSON.parse(node.value)) && node.remove();
    json && (this.rate = json['curs']);
  },

  // Border warning
  flashNode(item) {
    let def                 = item.style.boxShadow,
        boxShadow           = 'red 0px 0px 4px 1px';
    def === boxShadow && (def = '');
    item.style.boxShadow    = boxShadow;
    item.style.borderRadius = '4px';
    item.style.transition   = 'all 0.2s ease';
    setTimeout(() => {
      item.style.boxShadow = def || 'none';
    }, 1000);
  },

  /**
   * Try parse to float number from any string
   * @val v string
   */
  parseNumber(v) {
    typeof v === 'string' && (v = v.replace(',', '.'))
    && !isFinite(v) && /\d/.test(v) && (v = parseFloat(v.match(/\d+|\.|\d+/g).join('')));
    !isFinite(v) && (v = 0);
    return +v;
  },

  /**
   * Get value
   * @param selector {string|HTMLSelectElement}
   * @return {boolean|array}
   */
  getMultiSelect(selector) {
    const node = typeof selector === 'string' ? f.qS(selector) : selector;
    if (node) {
      return [...node.selectedOptions].reduce((r, option) => { r.push(option.value); return r}, []);
    }
    return false;
  }
}

export const f = Object.assign(func, q);
