import {c} from "../const.js";
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
   * Переписан без JQuery.(не зависим)
   * Селекторы должны иметь класс useToggleOption
   * Input-ы будут открывать зависимые поля когда активен(checked)
   * Если добавить класс "opposite", то будут скрывать когда активен
   * цель data-target="name", у цели добавить в класс
   * опции селектора могут иметь data-target="name"
   * Если в классе цели добавить No, например nameNo, цель будет скрываться когда input выбран
   *
   * (в разработке)
   * Если цель зависима от нескольких полей в атрибуте data-toggle,
   *   перечистиль название целей через пробел.
   *
   *
   */
  relatedOption: (node = document) => {
    const qs = (s) => document.querySelectorAll(s),
          ga = (i, a) => i.getAttribute(a),
          hide = (n) => n.classList.add('d-none'),
          show = (n) => n.classList.remove('d-none'),
          getOtherTarget = (cur, toggle) => toggle.split(' ').filter(i => i !== cur),
          setTarget = (n, t) => n.dataset[t] = '+';


    const checkTarget = (n, t) => {
      if (!n.dataset.toggle) return;
      delete n.dataset[t];

      for (const elem of getOtherTarget(t, n.dataset.toggle)) {
        if (n.dataset[elem]) return true;
      }
    }

    const selectChange = function (check = false) {
      let opList = Object.values(this.options);

      for (let item of opList) { //Скрыть все
        let t = item.getAttribute('data-target'),
            nodeTL = t && qs(`.${t}, .${t}No`);

        if (nodeTL) nodeTL.forEach(i => {
          if (checkTarget(i, t)) return;
          hide(i);
        });
      }

      for (let item of opList) {// Открыть нужные
        let t = item.getAttribute('data-target'),
            nodeTL = t && qs(`.${t}`);

        if (item.selected && nodeTL) nodeTL.forEach(i => {
          if (i.dataset.toggle) {
            const arr = getOtherTarget(t, i.dataset.toggle);
          }
          show(i);
        });
      }

      for (let item of opList) {// Открыть противоположные
        let t = item.getAttribute('data-target'),
            nodeTL = t && qs(`.${t}No`);

        if (!item.selected && nodeTL) nodeTL.forEach(i => {
          if (i.dataset.toggle) setTarget(i, t);
          show(i);
        })
      }
    };

    qs('input[data-target]').forEach(node => {
      let nameAttr = node.name ? `[name="${node.name}"]` : '';

      if (nameAttr) {
        let items = qs(`input${nameAttr}`);

        node.onchange = () => {
          items.forEach(item => { // Скрываем все зависимые поля
            let t = ga(item, 'data-target');
            //if (t) $('.' + t).hide().addClass('hidden');
            if (t) qs(`.${t}, .${t}No`).forEach(i => hide(i));
          });

          items.forEach(item => { // Открываем все зависимые поля
            //if (t && item.checked) $('.' + t).show().removeClass('hidden');
            let t = ga(item, 'data-target'),
                flag = item.classList.contains('opposite') ? !item.checked : item.checked;
            if (t && flag) qs(`.${t}`).forEach(i => show(i));
            if (t && !flag) qs(`.${t}No`).forEach(i => show(i));
          });
        };
      }
      else {
        let target = ga(node, 'data-target'),
            nodeTL = qs(`.${target}`);

        node.onchange = () => {
          if (node.checked) nodeTL.forEach(i => show(i));
          else nodeTL.forEach(i => hide(i));
        };
      }

      node.dispatchEvent(new Event('change'));
    });

    qs('select.useToggleOption').forEach(node => {
      node.onchange = selectChange;
      node.dispatchEvent(new Event('change'));
    });
  },

  // Получить и скачать файл
  createLink: (fileName) => {
    //let date = new Date();
    //fileName += '_' + date.getDate() + ("0" + (date.getMonth() + 1)).slice(-2) + (date.getYear() - 100) + '_' + date.getHours() + date.getMinutes() + date.getSeconds() + '.pdf';
    let a = document.createElement('a');
    a.setAttribute('download', fileName);
    return a;
  },

  /**
   * Save file from browser
   * @param {object} data
   *
   * data is {'name', 'type' , 'blob'}
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

  // Добавить иконку загрузки
  setLoading: (node) => {
    if(!node) return;
    node.classList.add(c.CLASS_NAME.LOADING);
  },

  /**
   * Функция по умолчанию
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

  // Удалить иконку загрузки
  removeLoading: (node) => {
    node && node.classList.remove(c.CLASS_NAME.LOADING);
  },

  /**
   *
   * @param target HTML node (loading field)
   * @param report object: send to pdf
   * @param finishOk function
   * @param err function
   */
  downloadPdf(target, report = {}, finishOk = () => {}, err = () => {}) {
    if (!Object.keys(report).length) { err(); return; }

    let data = new FormData();

    func.setLoading(target);

    data.set('dbAction', 'DB');
    data.set('mode', 'docs');
    data.set('docType', 'pdf');
    data.set('reportVal', JSON.stringify(report));

    q.Post({data}).then(data => {
      f.removeLoading(target);
      if (data['pdfBody']) {
        f.saveFile({
          name: data['name'],
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
    let def                 = item.style.boxShadow;
    item.style.boxShadow    = '0px 0px 4px 1px red';
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
    typeof v === 'string' && (v = v.replace(',', '.'));
    !isFinite(v) && (v = parseFloat(v.match(/\d+|\.|\d+/g).join('')));
    !isFinite(v) && (v = 0);
    return +v;
  },
}

export const f = Object.assign(func, q);
