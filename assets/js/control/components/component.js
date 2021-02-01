// МОДУЛИ
//----------------------------------------------------------------------------------------------------------------------

import {c} from "../../const.js";
import {f} from "../func.js";

// Загрузка
export class LoaderIcon {
  constructor(field, showNow = true, targetBlock = true, param = {}) {
    this.node = typeof field === 'string' ? f.qS(field) : field;
    if (!(this.node instanceof HTMLElement)) return;
    this.block         = targetBlock;
    this.customWrap    = param.wrap || false;
    this.customLoader  = param.loader || false;
    this.customLoaderS = param.loaderS || false;
    this.big           = !param.small || true;
    showNow && this.start();
  }

  setParam() {
    let coords = this.node.getBoundingClientRect();

    this.big = coords.height > 50;
    this.loaderNode = this.getTemplateNode();

    this.loaderNode.style.top    = coords.y + pageYOffset + 'px';
    this.loaderNode.style.left   = coords.x + pageXOffset + 'px';
    this.loaderNode.style.height = coords.height;
    this.loaderNode.style.width  = coords.width;
  }

  start() {
    if (this.status) return;
    this.status = true;

    this.setParam();
    this.big && (this.node.style.filter = 'blur(5px)');
    document.body.style.position = 'relative';
    document.body.append(this.loaderNode);
  }

  stop() {
    if (!this.status) return;
    this.status = false;

    this.big && (this.node.style.filter = '');
    document.body.style.position = '';
    this.loaderNode.remove();
  }

  getTemplateNode() {
    let n = document.createElement('div');
    n.innerHTML = this.templateWrap();
    return n.children[0];
  }

  templateWrap() {
    let node = this.big ? this.template() : this.templateSmall();
    return this.customWrap || `<div style="display: flex;align-items: center;justify-content: center;position:fixed;">${node}</div>`;
  }

  template() {
    let template = `
    <style>
    .letter-holder {
      padding: 16px;
    }
    .letter {
      float: left;
      font-size: 14px;
      color: #777;
    }
    .load-6 .letter {
      animation-name: loadingF;
      animation-duration: 1.6s;
      animation-iteration-count: infinite;
    }
    .l-1 {
      animation-delay: 0.48s;
    }
    .l-2 {
      animation-delay: 0.6s;
    }
    .l-3 {
      animation-delay: 0.72s;
    }
    .l-4 {
      animation-delay: 0.84s;
    }
    .l-5 {
      animation-delay: 0.96s;
    }
    .l-6 {
      animation-delay: 1.08s;
    }
    .l-7 {
      animation-delay: 1.2s;
    }
    .l-8 {
      animation-delay: 1.32s;
    }
    .l-9 {
      animation-delay: 1.44s;
    }
    .l-10 {
      animation-delay: 1.56s;
    }
    @keyframes loadingF {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    </style>
    <div class="load-6">
      <div class="letter-holder">
        <div class="l-1 letter">L</div>
        <div class="l-2 letter">o</div>
        <div class="l-3 letter">a</div>
        <div class="l-4 letter">d</div>
        <div class="l-5 letter">i</div>
        <div class="l-6 letter">n</div>
        <div class="l-7 letter">g</div>
        <div class="l-8 letter">.</div>
        <div class="l-9 letter">.</div>
        <div class="l-10 letter">.</div>
      </div>
    </div>
    `;
    return this.customLoader || template;
  }

  templateSmall () {
    let defSmallLoader = `
    <style>
      .load-3 .line {
        display: inline-block;
        width: 15px;
        height: 15px;
        border-radius: 15px;
        background-color: #4b9cdb;
      }
      .load-3 {
        height: 30px;
        margin-top: -5px;
      }
      .load-3 .line:nth-last-child(1) {
        animation: loadingC 0.6s 0.1s linear infinite;
      }
      .load-3 .line:nth-last-child(2) {
        animation: loadingC 0.6s 0.2s linear infinite;
      }
      .load-3 .line:nth-last-child(3) {
        animation: loadingC 0.6s 0.3s linear infinite;
      }
      @keyframes loadingC {
        0 {
          transform: translate(0, 0);
        }
        50% {
          transform: translate(0, 15px);
        }
        100% {
          transform: translate(0, 0);
        }
      }
    </style>
    <div class="load-3">
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>
    `;

    return this.customLoaderS || defSmallLoader;
  }
}

// Модальное окно
export const Modal = (param = {}) => {
  let modal = Object.create(null),
      data = Object.create(null),
      {
        modalId = 'adminPopup',
        template = '',
        showDefaultButton = true,
        btnConfig = false,
      } = param;

  const findNode = (n, role) => n.querySelector(`[data-role="${role}"]`);

  modal.bindBtn = function () {
    this.wrap.querySelectorAll('.close-modal, .confirmYes, .closeBtn')
        .forEach(n => n.onclick = () => this.hide());
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
    this.title && title && f.eraseNode(this.title).append(title);
    this.content && content && f.eraseNode(this.content).append(content);

    if (btnConfig) this.btnConfig(btnConfig);
    else this.btnField && !showDefaultButton && f.eraseNode(this.btnField);

    data.bodyOver = document.body.style.overflow;
    data.scrollY = Math.max(window.scrollY, window.pageYOffset, document.body.scrollTop);
    document.body.style.overflow = 'hidden';

    if (document.body.scrollHeight > window.innerHeight && window.innerWidth > 800) {
      data.bodyMarginRight = document.body.style.marginRight;
      document.body.style.marginRight = '16px';
    }

    this.wrap.classList.add('active');
    this.window.classList.add('active');
  }

  modal.hide = function () {
    this.wrap.classList.remove('active');
    this.window.classList.remove('active');

    setTimeout( () => {
      document.body.style.overflow = data.bodyOver || 'initial';
      document.body.style.cssText = 'scroll-behavior: initial';
      window.scrollTo(0, data.scrollY);
      document.body.style.cssText = '';
      //document.body.style.scrollBehavior = 'smooth';
      if (document.body.scrollHeight > window.innerHeight)
        document.body.style.marginRight = data.bodyMarginRight || 'initial';
    }, 300);
    //c.eraseNode(modal.content);
  }

  modal.setTemplate = function () {
    const node = document.createElement('div');
    node.insertAdjacentHTML('afterbegin', template || templatePopup());

    this.wrap     = node.children[0];
    this.window   = findNode(node, 'window');
    this.title    = findNode(node, 'title');
    this.content  = findNode(node, 'content');
    this.btnField = findNode(node, 'bottomFieldBtn');

    document.body.append(node.children[0]);
  }

  const templatePopup = () => {
    return `
    <div class="modal-overlay" id="${modalId}">
      <div class="modal p-15" data-role="window">
        <button type="button" class="close-modal">
          <span class="material-icons">clear</span>
        </button>
        <div class="modal-title" data-role="title">Some title here</div>
        <div class="w-100 pt-20" data-role="content"></div>
        <div class="modal-button" data-role="bottomFieldBtn">
          <input type="button" class="confirmYes btn btn-success" value="Подтвердить" data-action="confirmYes">
          <input type="button" class="closeBtn btn btn-warning" value="Отмена" data-action="confirmNo">
        </div>
      </div>
    </div>`;
  }

  modal.setTemplate();
  //btnConfig && modal.btnConfig(btnConfig);
  modal.bindBtn();

  return modal;
}

// Всплывающее сообщение
export class MessageToast {
  constructor() {
    this.messageBlock = document.createElement("div");
    this.messageBlock.classList.add('notification-container', 'd-small');
    document.body.append(this.messageBlock);
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
      this.messageBlock.remove();
    }, 3000);
  }
}

// Печать
export const Print = () => {
  let p   = Object.create(null);
  p.frame = document.createElement("iframe");
  p.data  = 'no content'; // html

  p.frame.onload = function () {
    history.pushState({print: 'ok'}, '', '/');
    this.sandbox  = 'allow-modals';
    this.contentDocument.body.append(p.data);
    this.contentWindow.print();
  }

  p.setContent = function (content, classList = []) {
    let container = document.createElement('div'), cloneN, delay = 0,
        haveImg = content.includes('<img');
    classList.map(i => container.classList.add(i));
    container.innerHTML = content;
    if(haveImg) {
      cloneN = container.cloneNode(true);
      document.body.append(cloneN);
      delay = 100;
    }

    this.data = container;

    if (haveImg) {
      setTimeout(() => {
        cloneN.remove();
      }, 200);
    }

    return delay;
  }

  p.print = function (content, classList = []) {
    let delay = this.setContent(content, classList);
    setTimeout(() => {
      document.body.append(this.frame);
      this.frame.remove();
    }, delay);
  }

  p.orderPrint = async function (printFunc, data, type) {
    let report = JSON.parse(data.order['report_value']);
    this.print(await printFunc(type, report));
  }

  return p;
}

// Поиск
export const Searching = () => {
  const obj = Object.create(null);

  obj.init = function (param) {
    let {popup = true, node, searchData,
          finishFunc = () => {},
          showResult = () => {}} = param,
        func = (e) => this.searchFocus(e);

    this.usePopup = popup; // Показывать результаты в сплывающем окне
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

  // Переделать когда нить. в вордпрессе очень крутой поисковик
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
    console.log(1);
    inputNode.removeEventListener('keyup', this.bindInputNodeEvent);
    this.usePopup && this.resultTmp.remove();
  }

  // Events
  const inputNodeEvent = function (e) {
    console.log(1);
    let value = e.target.value;
    if(value.length > 1) {
      f.show(this.resultTmp);
      this.returnFunc(this.search(value));
    } else {
      f.hide(this.resultTmp);
      this.returnFunc(Object.keys(this.searchData));
    }
    e.key === 'Enter' && e.target.dispatchEvent(new Event('blur')) && e.target.blur();
  }

  obj.searchFocus = function (e) {
    let target = e.target,
        wrap = target.parentNode;

    if(this.usePopup && !this.resultTmp) {
      this.resultTmp = f.gTNode('searchResult');
      this.resultTmp.addEventListener('click', (e) => this.clickResult(e, target));
    }

    this.bindInputNodeEvent = inputNodeEvent.bind(this);
    target.addEventListener('keyup', this.bindInputNodeEvent);
    target.addEventListener('blur', () => setTimeout(() => this.clear(target), 100), {once: true});

    if(this.usePopup) {
      wrap.style.position = 'relative';
      wrap.append(this.resultTmp);
    }

    target.dispatchEvent(new Event('keyup'));
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
export class Valid {
  valid = new Set();

  constructor(param) {
    let {
          sendFunc = () => {},
          formNode = false,
          formSelector = '#authForm',
          submitNode = false,
          submitSelector = '#btnConfirmSend',
          fileFieldSelector = false, // Если поля не будет тогда просто after
          initMask = true,
        } = param;

    try {
      this.form = formNode || document.querySelector(formSelector);
      this.btn =  submitNode || this.form.querySelector(submitSelector) || document.querySelector(submitSelector);
    } catch (e) {
      console.log(e.message); return;
    }

    this.initParam(param);

    // Form
    this.form.querySelectorAll('input[required]').forEach(n => {
      this.countNodes++;
      if (n.type === 'checkbox') n.addEventListener('click', (e) => this.validate(e));
      else {
        n.addEventListener('keyup', (e) => this.keyEnter(e));

        initMask && n.type === 'tel' && f.maskInit && f.maskInit(n);
      }
      n.addEventListener('blur', (e) => this.validate(e)); // может и не нужна
    });

    // Files
    this.fileInput = this.form.querySelector('input[type="file"]');
    if (this.fileInput) {
      fileFieldSelector && (this.fileField = this.form.querySelector(fileFieldSelector)); // Возможно понадобиться много полей
    }

    // Send Btn
    this.btn.onclick = (e) => this.confirm(e, sendFunc);
    if (this.countNodes === 0 || this.debug) this.btnActivate();
    else this.btnDisabled();

    this.onEventForm();
  }

  initParam(param) {
    let {
      cssClass = {
        error: 'cl-input-error',
        valid: 'cl-input-valid',
      },
      debug = c.DEBUG || false,
        } = param;
    this.cssClass = cssClass;
    this.debug = debug;
    this.countNodes = 0;
  }

  // Активировать/Деактивировать кнопки
  btnActivate() {
    if (this.valid.size >= this.countNodes) this.btn.removeAttribute('disabled');
    else this.btn.setAttribute('disabled', 'disabled');
  }

  btnDisabled() {
    this.valid.clear();
    this.btnActivate();
  }

  checkFileInput() {
    let error = false, files = [];
    for (const file of Object.values(this.fileInput.files)) {
      file.fileError = file.size > 1024*1024;
      if (file.fileError && !error) error = true;

      files.push(file);
    }

    this.showFiles(files);

    if (error) {
      this.setValidated(this.fileInput);
      this.btnDisabled();
    } else {
      this.setErrorValidate(this.fileInput);
      this.btnActivate();
    }
  }

  keyEnter(e) {
    if (e.key === 'Enter') {
      e.target.dispatchEvent(new Event('blur'));
      e.target.blur();
    } else {
      setTimeout(() => this.validate(e), 10);
    }
  }

  validate(e) {
    let node = e.target, reg;
    if (node.value.length > 0) {
      switch (node.name) {
        case 'name':
          if (node.value.length < 2) { this.setErrorValidate(node); }
          else this.setValidated(node);
          break;

        case 'tel':
          reg = /[^\d|\(|\)|\s|\-|_|\+]/;
          if (node.value.length < 18 || reg.test(String(node.value).toLowerCase())) {
            this.setErrorValidate(node);
          } else this.setValidated(node);
          break;

        case 'email':
          reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!reg.test(String(node.value).toLowerCase())) {
            this.setErrorValidate(node);
          } else this.setValidated(node);
          break;

        default: {
          this.setValidated(node);
        }
      }
    } else this.removeValidateClasses(node);
    this.btnActivate();
  }

  // Показать/Скрыть (ошибки) валидации
  setErrorValidate(node) {
    this.removeValidateClasses(node);
    node.classList.add(this.cssClass.error);
  }

  setValidated(node) {
    this.removeValidateClasses(node);
    node.classList.add(this.cssClass.valid);
    this.valid.add(node.id);
  }

  showFiles(files) {
    let html = '';

    files.forEach((file, i) => {
      html += this.getFileTemplate(file, i);
    });

    if (this.fileField) this.fileField.innerHTML = html;
    else this.fileInput.insertAdjacentHTML('afterend', '<div>' + html + '</div>');
  }

  removeValidateClasses(node) {
    node.classList.remove(this.cssClass.error, this.cssClass.valid);
    this.valid.delete(node.id);
  }

  confirm(e, sendFunc) {

    let finished = () => {

      this.form.querySelectorAll('input')
          .forEach(n => {
            n.value = '';
            this.removeValidateClasses(n);
          });
      this.btnDisabled();

      //  добавить удаление события проверки файла
    }

    //this.fileInput && add

    sendFunc(this.form, finished);
  }

  clickCommon(e) {
    let target = e.target.dataset.action ? e.target : e.target.closest('[data-action]'),
        action = target && target.dataset.action;

    if (!action) return false;

    let select = {
      'removeFile': () => this.removeFile(target),
    }

    select[action] && select[action]();
  }

  removeFile(target) {
    delete this.fileInput.files[target.dataset.id];
    this.checkFileInput();
  }

  onEventForm() {
    this.form.addEventListener('click', (e) => this.clickCommon(e));
    this.fileInput && this.fileInput.addEventListener('change', this.checkFileInput.bind(this));
  }

  getFileTemplate(file, i) {
    return `<div class="attach__item ${file.fileError ? this.cssClass.error : ''}">
        <span class="bold">${file.name}</span>
        <!--span class="table-basket__cross"
              data-id="${i}"
              data-action="removeFile"></span--></div>`;
  }
}

// Пагинация
export class Pagination {
  ACTIVE_CLASS = 'active';

  constructor(fieldSelector = 'paginatorWrap', param) {
    let {
      queryParam = {}, // ссылка на объект отправляемый с функцией запроса
      query = false, // функция запроса со страницы
        } = param,
        field = f.qS(fieldSelector);

    if (!(field && query && Object.values(queryParam).length)) return;
    this.node           = field;
    this.node.innerHTML = this.template();
    this.prevBtn        = {node: this.node.querySelector('[data-action="prev"]')};
    this.onePageBtnNode = this.node.querySelector('[data-btnwrap]');
    this.nextBtn        = {node: this.node.querySelector('[data-action="next"]')};
    this.node.onclick   = this.onclick.bind(this);
    this.queryParam     = queryParam;
    this.query          = query;

  }

  setCountPageBtn(count) {
    let pageCount = Math.ceil(+count / this.queryParam.countPerPage );

    if(+this.queryParam.pageCount !== +pageCount) this.queryParam.pageCount = +pageCount;
    else return;

    if (pageCount === 1) {
      f.hide(this.prevBtn.node, this.nextBtn.node);
      this.prevBtn.hidden = true;
      this.nextBtn.hidden = true;
      f.eraseNode(this.onePageBtnNode);
      return;
    }

    this.fillPagination(pageCount);
  }

  checkBtn() {
    let currPage = +this.queryParam.currPage;
    if (currPage === 0 && !this.prevBtn.hidden) {
      this.prevBtn.hidden = true;
      f.hide(this.prevBtn.node);
    } else if (currPage > 0 && this.prevBtn.hidden) {
      this.prevBtn.hidden = false;
      f.show(this.prevBtn.node);
    }

    let pageCount = this.queryParam.pageCount - 1;
    if (currPage === pageCount && !this.nextBtn.hidden) {
      this.nextBtn.hidden = true;
      f.hide(this.nextBtn.node);
    } else if (currPage < pageCount && this.nextBtn.hidden) {
      this.nextBtn.hidden = false;
      f.show(this.nextBtn.node);
    }

    this.onePageBtnNode.querySelectorAll(`[data-page]`).forEach(n => {
      if (+n.dataset.page === currPage) n.classList.add(this.ACTIVE_CLASS);
      else n.classList.remove(this.ACTIVE_CLASS);
    });
  }

  fillPagination(count) {
    let html = '', tpl,
        input = this.templateBtn();

    for(let i = 0; i < count; i++) {
      tpl = input.replace('${page}', i.toString());
      tpl = tpl.replace('${pageValue}', (i + 1).toString());
      html += tpl;
    }

    this.onePageBtnNode.innerHTML = html;
    this.checkBtn();
  }

  onclick(e) {
    let btn = e && e.target,
        key = btn && btn.dataset.action;
    if (!key) return;

    switch (key) {
      case 'prev':
        this.queryParam.currPage--;
        break;
      case 'next':
        this.queryParam.currPage++;
        break;
      case 'page': this.queryParam.currPage = btn.dataset.page; break;
      case 'count':
        if (this.queryParam.countPerPage === +e.target.value) return;
        this.queryParam.countPerPage = +e.target.value;
        this.queryParam.currPage = 0;
        break;
    }

    this.checkBtn();
    this.query();
  }

  template() {
    return `<div class="text-center d-flex">
      <div class="col"><button type="button" class="btn-arrow" data-action="prev">&laquo;</i></button></div>
      <div data-btnwrap class="col d-flex"></div>
      <div class="col"><button type="button" class="btn-arrow" data-action="next">&raquo;</i></button></div>

      <div class="col"><select class="select-width custom-select" data-action="count">
        <option value="1">1 запись</option>
        <option value="2">2 записи</option>
        <option value="5">5 записей</option>
        <option value="20" selected>20 записей</option>
      </select></div>
    </div>`;
  }

  templateBtn() {
    return `<input type="button"
      value="\${pageValue}" class="ml-1 mr-1 input-paginator"
      data-action="page" data-page="\${page}">`;
  }
}

// Сортировка столбцов
export class SortColumns {
  constructor(thead, query, queryParam) {
    if (!thead || !query || !queryParam) return;
    let activeClass = c.CLASS_NAME.SORT_BTN_CLASS;
    this.thead = thead;
    this.query = query;
    this.queryParam = queryParam;
    this.arrow = {
      notActive: '↑↓',
      arrowDown: '↓',
      arrowUp: '↑',
    }

    // Sort Btn
    this.thead.querySelectorAll('input').forEach(n => {
      n.addEventListener('click', (e) => this.sortRows.call(this, e));
      n.value += ' ' + this.arrow.notActive;

      if (n.dataset.ordercolumn === this.queryParam.sortColumn) {
        n.classList.add(activeClass);
        n.value = n.value.replace(this.arrow.notActive, this.arrow.arrowDown);
      }

    });
  }

  // сортировка заказов
  sortRows(e) { /*↑↓*/
    let input = e.target,
        colSort = input.getAttribute('data-ordercolumn'),
        activeClass = c.CLASS_NAME.SORT_BTN_CLASS,
        {notActive, arrowDown, arrowUp} = this.arrow,
        arrowReg = new RegExp(`${notActive}|${arrowDown}|${arrowUp}`);

    if(this.queryParam.sortColumn === colSort) {
      this.queryParam.sortDirect = !this.queryParam.sortDirect;
    } else {
      this.queryParam.sortColumn = colSort;
      this.queryParam.sortDirect = false;
    }

    let node = this.thead.querySelector(`input.${activeClass}`);
    if (node !== input) {
      node && node.classList.remove(activeClass);
      node && (node.value = node.value.replace(arrowReg, notActive));
      input.classList.add(activeClass);
    }

    if (this.queryParam.sortDirect) input.value = input.value.replace(arrowReg, arrowUp);
    else input.value = input.value.replace(arrowReg, arrowDown);

    this.query();
  }
}
