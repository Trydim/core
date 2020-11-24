"use strict";

import {c, q} from "../const.js";

/**
 * Переписан без JQuery.(не зависим)
 * Секлекты должны иметь класс useToggleOption
 * Инпуты будут открывтать зависимые поля когда активен(checked)
 * Если добавить класс "opposite", то будут скрывать когда активен
 * цель data-target="name", у цели добавить в класс
 * опции селекта могут иметь data-target="name"
 * Если в классе цели добавить No, например nameNo, цель будет скрываться когда инпут выбран
 */
const relatedOption = () => {
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
        let target    = node.getAttribute('data-target'),
            nodeTL    = document.querySelectorAll(`.${target}`);
        node.onchange = () => {
          if (node.checked) nodeTL.forEach(i => i.classList.remove('d-none'));
          else nodeTL.forEach(i => i.classList.add('d-none'));
        };
      }

      node.dispatchEvent(new Event('change'));
    });
  document.querySelectorAll('select.useToggleOption').forEach(node => {
    node.onchange = function () {

      let opList = this.options;

      for (let item in opList) // Скрыть все
        if (opList.hasOwnProperty(item)) {
          let target = opList[item].getAttribute('data-target'),
              nodeTL = document.querySelectorAll(`.${target}`);

          if (!opList[item].selected) nodeTL.forEach(i => i.classList.add('d-none'));
        }

      for (let item in opList) // Открыть нужные
        if (opList.hasOwnProperty(item)) {
          let target = opList[item].getAttribute('data-target'),
              nodeTL = document.querySelectorAll(`.${target}`);

          if (opList[item].selected) nodeTL.forEach(i => i.classList.remove('d-none'));
        }
    };

    node.dispatchEvent(new Event('change'));
  });
};

/**
 * Replace latin to cyrillic symbol
 * @param value
 * @return {void | string}
 */
const replaceLetter = (value) => {
  let cyrillic = 'УКЕНХВАРОСМТ',
      latin    = 'YKEHXBAPOCMT',
      replacer = (match) => cyrillic.charAt(latin.indexOf(match)),
      letters  = new RegExp(`(${latin.split('').join('|')})`, 'gi');
  return value.replace(letters, replacer).replace(/(&nbsp| | )/g, '').toLowerCase(); // какой-то пробел
};

/**
 * replace ${key from obj} from template to value from obj
 * @param tmpString html string template
 * @param arrayObjects array of object
 * @return {string}
 */
const replaceTemplate = (tmpString, arrayObjects) => {
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
}

/**
 * Словарь в будущем
 */
let dic = {
  data: {},
  setTitle(arr) {
    Object.assign(this.data, arr);
  },
  getTitle(key) {
    return key && this.data[key];
  },
};
/**
 * Template string can be param (%1, %2)
 * @param key - array, first item must be string
 * @returns {*}
 * @private
 */
const _ = (...key) => {
  if(key.length === 1) return dic.getTitle(key[0]);
  else {
    let str = dic.getTitle(key[0]);
    for(let i = 1; i< key.length; i++) {
      if(key[i]) str = str.replace(`%${i}`, key[i]);
    }
    return str;
  }
};
window._ = _;

const initDefault = () => {
  // инициализация по умолчанию
}

const importModuleFunc = async (moduleName) => {
  let link;
  if (moduleName === 'public') {
    link = `/public/js/${c.PUBLIC_PAGE}.js`;
    moduleName = c.PUBLIC_PAGE;
  } else link = `../module/${moduleName}/${moduleName}.js`;

  try {
    let importModule = await new Promise((resolve, reject) => {
      import(link)
        .then(module => resolve(module[moduleName]))
        .catch(err => reject(err));
    });
    return importModule.init() || false;
  } catch (e) { console.log(e); return false; }
}

// Получить и скачать файл
const createLink = (fileName) => {
  //let date = new Date();
  //fileName += '_' + date.getDate() + ("0" + (date.getMonth() + 1)).slice(-2) + (date.getYear() - 100) + '_' + date.getHours() + date.getMinutes() + date.getSeconds() + '.pdf';
  let a = document.createElement('a');
  a.setAttribute('download', fileName);
  return a;
};
const savePdf = (data) => {
  let link   = createLink(data.name || 'Name');
  link.setAttribute('href', `data:application/pdf;base64,${data['pdfBody']}`);
  link.click();
};
// Маска для телефона
const maskInit = (node) => {
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
}

// Печать Отчетов для навесов
// загрузка картики фермы
/* w = calculator.param.trussWidth */
const getTrussImg = (w) => {
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
}
// печать отчета
/* report = calculator.rBack.report.custom */
const printReport = async (type, report, w, number = false) => {
  let lReport = Object.assign({}, report),
      table = c.gTNode('printTable'),
      html = '';

  //type = /\d/.exec(type)[0];

  Object.values(lReport).map(i => {
    !!+i[4] && (i[4] = (+i[4]).toFixed(2));
    html += `<tr><td>${i[0]} ${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
  });

  if (number) table.querySelector('#number').innerHTML = number.toString();
  else table.querySelector('#numberWrap').classList.add(c.CLASS_NAME.HIDDEN_NODE);
  table.querySelector('tbody').innerHTML = html;
  //html = await getTrussImg(w);
  //table.querySelector('#trussImg').append(html);
  return table.outerHTML;
}

// МОДУЛИ (вынести в отдельный файл)
//----------------------------------------------------------------------------------------------------------------------

// Модальное окно
const Modal = () => {
  let modal     = Object.create(null);
  modal.wrap    = c.gI('modalWrap');
  modal.window  = modal.wrap.querySelector('.modal');
  modal.title   = modal.wrap.querySelector('.modalT');
  modal.content = modal.wrap.querySelector('.modalC');

  modal.bindBtn = function () {
   this.wrap.querySelectorAll('.close-modal, .confirmYes, .closeBtn').forEach(n =>
     n.addEventListener('click', () => { modal.hide() }));
  }
  modal.btnConfig = function (key, param) {
    let node = this.wrap.querySelector('.' + key.replace('.', ''));
    node && param.value && (node.value = param.value);
  }

  /**
   * Show modal window
   * @param title Nodes | string[]
   * @param content Nodes | string[]
   */
  modal.show = function (title = '', content = '') {
    modal.wrap.classList.add('active');
    modal.window.classList.add('active');

    modal.title && title && c.eraseNode(modal.title).append(title);
    modal.content && content && c.eraseNode(modal.content).append(content);
  }

  modal.hide = function () {
    modal.wrap.classList.remove('active');
    modal.window.classList.remove('active');
    //c.eraseNode(modal.content);
  }

  modal.bindBtn();
  return modal;
}

// Всплывающее сообщение
class MessageToast {
  constructor() {
    let parentBlock   = document.querySelector('.navbar-collapse');
    this.messageBlock = document.createElement("div");
    this.messageBlock.classList.add('notification-container');
    this.messageBlock.classList.add('d-small');
    parentBlock.append(this.messageBlock);
  }

  checkMsq(msg, type) {
    if(!type) {
      this.setMessage(type);
      this.setColor('error');
    } else {
      this.setMessage(msg);
      this.setColor('success');
    }
  }

  setMessage(msg) {
    this.messageBlock.innerHTML = msg;
  }

  setColor(color) {
    this.messageBlock.classList.remove('success', 'warning', 'error');
    switch (color) {
      case 'success':
        this.messageBlock.classList.add('success');
        break;
      case 'warning':
        this.messageBlock.classList.add('warning');
        break;
      case 'error':
      default:
        this.messageBlock.classList.add('error');
        break;
    }
  }

  show(msg = 'message body', type = 'warning') {

    if(typeof type !== 'string') this.checkMsq(msg, type);
    else {
      this.setMessage(msg);
      this.setColor(type);
    }

    this.messageBlock.classList.remove('d-small');
    this.messageBlock.classList.add('d-large');

    setTimeout(() => {
      this.messageBlock.classList.add('d-small');
    }, 3000);
  }
}

// Печать
const Print = () => {
  let print   = Object.create(null);
  print.frame = document.createElement("iframe");
  print.data  = 'no content'; // html

  print.frame.onload = function () {
    this.sandbox  = 'allow-modals';
    this.contentDocument.body.append(print.data);
    this.contentWindow.print();
  }

  print.setContent = function (content, classList = []) {
    let container = document.createElement('div');
    classList.map(i => container.classList.add(i));
    container.innerHTML = content;
    this.data           = container;
  }

  print.print = function (content, classList = []) {
    this.setContent(content, classList);
    document.body.append(this.frame);
    this.frame.remove();
  }

  return print;
}

// Поиск
const Searching = () => {
  const obj = Object.create(null);

  obj.init = function (param) {
    let {popup = true, node, searchData,
          finishFunc = () => {},
          showResult = () => {}} = param,
        func = (e) => this.searchFocus(e);

    this.usePopup = popup;
    this.searchData = searchData;
    this.resultFunc = (index) => finishFunc(index);
    this.returnFunc = (resultIds) => showResult(this.resultTmp, resultIds);

    node.removeEventListener('focus', func);
    node.addEventListener('focus', func);
    node.dispatchEvent(new Event('focus'));
  }

  obj.setSearchData = function (data) {
    this.searchData = data;
    return this;
  }

  obj.search = function (need) {
    let pattern     = /(-|_|\(|\)|@)/gm,
        cyrillic    = 'УКЕНХВАРОСМТукенхваросмт',
        latin       = 'YKEHXBAPOCMTykehxbapocmt',
        //cyrillicKey = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю',
        //latinKey    = 'QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>qwertyuiop[]asdfghjkl;\'zxcvbnm,.',
        replacerLC    = (match) => latin.charAt(cyrillic.indexOf(match)),
        replacerCL    = (match) => cyrillic.charAt(latin.indexOf(match)),
        //replacerKeyLC = (match) => latinKey.charAt(cyrillicKey.indexOf(match)),
        //replacerKeyCL = (match) => cyrillicKey.charAt(latinKey.indexOf(match)),
        lettersL = new RegExp(`(${latin.split('').join('|')})`, 'gi'),
        lettersC = new RegExp(`(${cyrillic.split('').join('|')})`, 'gi');
    //funcKeyL = new RegExp(`(${latinKey.split('').join('|')})`, 'gi'),
    //funcKeyC = new RegExp(`(${cyrillicKey.split('').join('|')})`, 'gi');

    need = need.replace(pattern, '');
    if (need.includes(' ')) need += '|' + need.split(' ').reverse().join(' ');

    let regArr = [], i, test;

    (i = need.replace(lettersL, replacerCL).replace(/ /gm, '.+')) && regArr.push(i);
    (i = need.replace(lettersC, replacerLC).replace(/ /gm, '.+')) && regArr.push(i);
    //(i = need.replace(funcKeyL, replacerKeyCL).replace(/ /gm, '.+')) && regArr.push(i);
    //(i = need.replace(funcKeyC, replacerKeyLC).replace(/ /gm, '.+')) && regArr.push(i);
    //i = `${regArr.join('|')}`;
    test = new RegExp(`${regArr.join('|')}`, 'i');

    return Object.entries(this.searchData)
      .map(i => test.test(i[1].replace(pattern, '')) && i[0]).filter(i => i);
  }

  obj.clear = function (inputNode) {
    inputNode.removeEventListener('input', inputNodeEvent);
    this.resultTmp.remove();
  }

  // Events
  const inputNodeEvent = function (e) {
    let value = e.target.value;
    if(value.length > 1) {
      c.show(this.resultTmp);
      this.returnFunc(this.search(value));
    } else {
      c.hide(this.resultTmp);
    }
  }

  obj.searchFocus = function (e) {
    let target = e.target,
        wrap = target.parentNode;

    if(this.usePopup && !this.resultTmp) {
      this.resultTmp = c.gTNode('searchResult');
      this.resultTmp.addEventListener('click', (e) => this.clickResult(e, target));
    }

    target.addEventListener('input', inputNodeEvent.bind(this));

    if(this.usePopup) {
      target.addEventListener('blur', () => setTimeout(() => this.clear(target), 100), {once: true});

      wrap.style.position = 'relative';
      wrap.append(this.resultTmp);
    }

    target.dispatchEvent(new Event('input'));
  }

  obj.clickResult = function (e, inputNode) {
    if(this.resultTmp === e.target) return;
    let index = +e.target.dataset.id;

    this.clear(inputNode);
    //inputNode.value = this.data[index].name;
    this.resultFunc(index);
  }

  return obj;
}

// Валидация
const valid = {
  debug: false,//c.DEBUG,
  valid: new Set(),
  idForm: 'authForm',
  idSubmit: 'btnConfirmSend',

  className: {
    load: c.CLASS_NAME.LOADING,
    error: 'cl-input-error',
    valid: 'cl-input-valid',
  },

  /**
   * @param sendFunc - function action
   * @param idForm - string id
   * @param idSubmit - string id BTN
   */
  init(sendFunc, idForm = false, idSubmit = false) {
    idForm && (this.idForm = idForm);
    idSubmit && (this.idSubmit = idSubmit);

    this.form = c.gI(this.idForm);
    this.btn  = c.gI(this.idSubmit);

    this.btn.onclick = (e) => this.confirm(e, sendFunc);

    if(this.debug) this.btnActivate();
    else {
      this.btnDisabled();
      this.form.querySelectorAll('input').forEach(n => {
        if (n.type === 'checkbox') n.addEventListener('click', (e) => this.validate(e));
        else n.addEventListener('keydown', (e) => this.keyEnter(e));
        n.addEventListener('blur', (e) => this.validate(e));
      });
    }
    maskInit(this.form.querySelector("input[type='tel']"));
  },

  // Активировать/Деактивировать кнопки
  btnActivate() {
    if (this.valid.size >= 2 || this.debug) this.btn.removeAttribute('disabled');
    else this.btn.setAttribute('disabled', 'disabled');
  },

  btnDisabled() {
    this.valid.clear();
    this.btnActivate();
  },

  keyEnter(e) {
    if (e.key === 'Enter') {
      e.target.dispatchEvent(new Event('blur'));
      e.target.blur();
    }
  },
  // Проверка валидации
  validate(e) {
    let node = e.target, reg;

    if (node.value.length > 0) {
      switch (node.name) {
        case 'name':
          if (node.value.length < 2) {
            this.setErrorValidate(node);
            return;
          }
          this.setValidated(node);
          break;

        case 'phone':
          //reg = /7( |-|_)*\(\d{3}\)( |-|_)*\d{3}( |-|_)\d{2}( |-|_)*\d{2}/;
          //reg = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
          reg = /[^\d|\(|\)|\s|\-|_|\+]/;
          if (node.value.length < 18 || reg.test(String(node.value).toLowerCase())) {
            this.setErrorValidate(node);
            return;
          }
          this.setValidated(node);
          break;

        case 'email':
          reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!reg.test(String(node.value).toLowerCase())) {
            this.setErrorValidate(node);
            return;
          }
          this.setValidated(node);
          break;

        /*case 'auth_form__info': // TODO нормальную проверку реквизитов
          if (node.value.length < 10) {
            this.setErrorValidate(node);
            return;
          }
          this.setValidated(node);
          break;*/

        case 'politic':
          if (node.checked) this.valid.add(node.id);
          else this.valid.delete(node.id);
          break;

        default: {
          this.setValidated(node);
          switch (node.type) { // TODO общие поля
            case 'text': {}
          }
        }
      }
    }

    this.btnActivate();
  },

  // Показать/Скрыть (ошибки) валидации
  setErrorValidate(node) {
    this.removeValidateClasses(node);
    node.classList.add(this.className.error);
    this.valid.delete(node.id);
  },
  setValidated(node) {
    this.removeValidateClasses(node);
    node.classList.add(this.className.valid);
    this.valid.add(node.id);
  },
  removeValidateClasses(node) { node.classList.remove(this.className.error, this.className.valid) },

  confirm(e, sendFunc) {
    // Loading
    this.btn.classList.add(this.className.load);

    let finished = () => {
      // Stop show Loading
      this.btn.classList.remove(this.className.load);

      this.form.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"]')
          .forEach(n => n.value = '');
      this.btnDisabled();
    }

    sendFunc(this.form, finished);
  },
}

const m = {

  init(moduleName = 'default') {
    let module = importModuleFunc(moduleName);
    if (!module) initDefault();
    relatedOption();
    return module;
  },

  // TODO public

  relatedOption  : relatedOption,
  replaceLetter  : replaceLetter,
  replaceTemplate: replaceTemplate,

  initModal : Modal,
  initPrint : Print,
  maskInit  : maskInit,
  searchInit: Searching,
  initValid : (sendFunc, idForm, idSubmit) => valid.init(sendFunc, idForm, idSubmit),
  savePdf   : data => savePdf(data),

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

  showMsg: (msg, type) => new MessageToast().show(msg, type),

  // Навесы //
  printReport: printReport,
};

export const main = Object.assign(m, c, q);
