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

  // Показать элементы, аргументы коллеции NodeList
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

    if (tmpString)
      if(!arrayObjects.map) arrayObjects = [arrayObjects];
    arrayObjects.map(item => {
      let tmp = tmpString.trim();
      Object.entries(item).map(v => {
        if(!v[1]) v[1] = '';
        v[1] = v[1].toString().replace(/"/g, '\''); //не помогло
        let reg = new RegExp(`\\\${${v[0]}}`, 'mgi');
        tmp     = tmp.replace(reg, v[1].toString()); // replace ${key from obj} from template to value from obj
      });

      html += tmp;
    })

    return html;
  },

  /**
   * Переписан без JQuery.(не зависим)
   * Секлекты должны иметь класс useToggleOption
   * Инпуты будут открывтать зависимые поля когда активен(checked)
   * Если добавить класс "opposite", то будут скрывать когда активен
   * цель data-target="name", у цели добавить в класс
   * опции селекта могут иметь data-target="name"
   * Если в классе цели добавить No, например nameNo, цель будет скрываться когда инпут выбран
   */
  relatedOption: () => {
    document.querySelectorAll('input[data-target]')
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
    document.querySelectorAll('select.useToggleOption').forEach(node => {
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

  // Печать Отчетов для навесов
  // загрузка картики фермы
  getTrussImg: (w) => {
    let link = 'core/assets/images/truss' + w + '.jpg';
    return new Promise(resolve => {
      fetch(link).then(data => data.blob()).then(data => {
        let reader = new FileReader();

        reader.onloadend = () => {
          let img = document.createElement('img');
          img.src = reader.result;
          resolve(img);
        }

        reader.readAsDataURL(data);
      });
    })
  },

  // печать отчета
  printReport: async (type, report, w, number = false) => {
    let lReport = Object.assign({}, report),
        table = func.gTNode('printTable'),
        html = '';

    //type = /\d/.exec(type)[0];

    Object.values(lReport).map(i => {
      !!+i[4] && (i[4] = (+i[4]).toFixed(2));
      html += `<tr><td>${i[0]} ${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
    });

    if (number) table.querySelector('#number').innerHTML = number.toString();
    else table.querySelector('#numberWrap').classList.add(c.CLASS_NAME.HIDDEN_NODE);
    table.querySelector('tbody').innerHTML = html;
    //html = await this.getTrussImg(w);
    //table.querySelector('#trussImg').append(html);
    return table.outerHTML;
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
    let link   = createLink(data.name || 'Name');
    link.setAttribute('href', `data:application/pdf;base64,${data['pdfBody']}`);
    link.click();
  },

  // Маска для телефона
  maskInit: (node) => {
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

    node.addEventListener('input', mask);
    node.addEventListener('focus', mask);
    node.addEventListener('blur', mask);
  },

  // Активировать элементы
  enable: (...collection) => {
    collection.map(nodes => {
      if(!nodes.forEach) nodes = [nodes];
      nodes.forEach(n => {

        n.classList.remove(c.CLASS_NAME.DISABLED_NODE);
        n.removeAttribute('disabled');

        /*switch (n.tagName) {
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

  // Удалить иконку загрузки
  removeLoading: (node) => {
    node && node.classList.remove(c.CLASS_NAME.LOADING);
  },
}

export const f = Object.assign(func, q);
