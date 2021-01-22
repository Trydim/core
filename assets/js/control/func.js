import {c} from "../const.js";
import {q} from "./query.js";

const func = {

  // Simple and often used function
  // ------------------------------------------------------------------------------------------------

  log: (msg) => c.DEBUG && console.log('Error:' + msg),

  /**
   * @param id
   * @return {HTMLElement | {}}
   */
  gI: (id) => document.getElementById(id ? id.replace('#', '') : '') || func.log(id),

  /**
   * @param selector
   * @return {HTMLElement | {}}
   */
  qS: (selector) => document.querySelector(selector || '') || func.log(selector),

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
  gT: (id) => { let node = func.gI(id); return node ? node.content.children[0].outerHTML : 'Not found template' + id},

  /**
   * Получить Node шаблона
   * @param id {string}
   * @returns {Node}
   */
  gTNode: (id) => func.gI(id).content.children[0].cloneNode(true),

  // перевод в число
  toNumber: (input) => +(input.replace(/(\s|\D)/g, '')),

  // Формат цифр (разделение пробелом)
  setFormat: (num) => (num.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, " "),

  // Показать элементы, аргументы коллекции NodeList
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
   */
  relatedOption: (node = document) => {
    node.querySelectorAll('input[data-target]')
            .forEach(node => {
              let nameAttr = node.name ? `[name="${node.name}"]` : '';

              if (nameAttr) {
                node.onchange = () => {
                  let items = document.querySelectorAll(`input${nameAttr}`);

                  items.forEach(item => { // Скрываем все зависимые поля
                    let t = item.getAttribute('data-target');
                    //if (t) $('.' + t).hide().addClass('hidden');
                    if (t) document.querySelectorAll(`.${t}, .${t}No`)
                                   .forEach(i => i.classList.add('d-none'));
                  });

                  items.forEach(item => { // Открываем все зависимые поля
                    //if (t && item.checked) $('.' + t).show().removeClass('hidden');
                    let t    = item.getAttribute('data-target'),
                        flag = item.classList.contains('opposite') ? !item.checked : item.checked;
                    if (t && flag) document.querySelectorAll(`.${t}`)
                                           .forEach(i => i.classList.remove('d-none'));
                    if (t && !flag) document.querySelectorAll(`.${t}No`)
                                            .forEach(i => i.classList.remove('d-none'));
                  });

                };

              } else {
                let target    = node.getAttribute('data-target'), nodeTL = document.querySelectorAll(`.${target}`);
                node.onchange = () => {
                  if (node.checked) nodeTL.forEach(i => i.classList.remove('d-none')); else nodeTL.forEach(i => i.classList.add('d-none'));
                };
              }

              node.dispatchEvent(new Event('change'));
            });
    node.querySelectorAll('select.useToggleOption').forEach(node => {
      node.onchange = function () {

        let opList = this.options;

        for (let item in opList) // Скрыть все
          if (opList.hasOwnProperty(item)) {
            let target = opList[item].getAttribute('data-target'), nodeTL = document.querySelectorAll(`.${target}`);

            if (!opList[item].selected) nodeTL.forEach(i => i.classList.add('d-none'));
          }

        for (let item in opList) // Открыть нужные
          if (opList.hasOwnProperty(item)) {
            let target = opList[item].getAttribute('data-target'), nodeTL = document.querySelectorAll(`.${target}`);

            if (opList[item].selected) nodeTL.forEach(i => i.classList.remove('d-none'));
          }
      };

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

  savePdf: (data) => {
    let link = func.createLink(data.name || 'Name');
    link.setAttribute('href', `data:application/pdf;base64,${data['pdfBody']}`);
    link.click();
  },

  // Маска для телефона
  maskInit: (node) => {
    if (!node) return;
    const minValue = 2;

    const mask = (e) => {
      let target = e.target, i = 0,
          matrix = c.PHONE_MASK,
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

  // вывод печати.
  printReport: (report, number = 1) => {
    let table = f.gTNode('printTable'),
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
        f.savePdf(data);
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
  }
}

export const f = Object.assign(func, q);
