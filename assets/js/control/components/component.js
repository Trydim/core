// МОДУЛИ
//----------------------------------------------------------------------------------------------------------------------

// Модальное окно
import {c} from "../../const.js";
import {f} from "../func.js";

export const Modal = () => {
  let modal     = Object.create(null);
  modal.wrap    = f.gI('modalWrap');
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

    modal.title && title && f.eraseNode(modal.title).append(title);
    modal.content && content && f.eraseNode(modal.content).append(content);
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
export class MessageToast {
  constructor() {
    let parentBlock   = document.body;
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
export const Print = () => {
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
export const Searching = () => {
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
      f.show(this.resultTmp);
      this.returnFunc(this.search(value));
    } else {
      f.hide(this.resultTmp);
    }
  }

  obj.searchFocus = function (e) {
    let target = e.target,
        wrap = target.parentNode;

    if(this.usePopup && !this.resultTmp) {
      this.resultTmp = f.gTNode('searchResult');
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
export const valid = {
  debug: c.DEBUG,
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

    this.form = f.gI(this.idForm);
    this.btn  = f.gI(this.idSubmit);

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
    f.maskInit(this.form.querySelector("input[type='tel']"));
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
