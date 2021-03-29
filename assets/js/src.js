/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/components/component.js":
/*!************************************!*\
  !*** ./js/components/component.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoaderIcon": () => (/* binding */ LoaderIcon),
/* harmony export */   "MessageToast": () => (/* binding */ MessageToast),
/* harmony export */   "Print": () => (/* binding */ Print),
/* harmony export */   "Searching": () => (/* binding */ Searching),
/* harmony export */   "Valid": () => (/* binding */ Valid),
/* harmony export */   "Pagination": () => (/* binding */ Pagination),
/* harmony export */   "SortColumns": () => (/* binding */ SortColumns),
/* harmony export */   "SaveVisitorsOrder": () => (/* binding */ SaveVisitorsOrder)
/* harmony export */ });
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");
/* harmony import */ var _func_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./func.js */ "./js/components/func.js");
/* harmony import */ var _query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./query.js */ "./js/components/query.js");
// МОДУЛИ
//----------------------------------------------------------------------------------------------------------------------





// Загрузка
class LoaderIcon {
  constructor(field, showNow = true, targetBlock = true, param = {}) {
    this.node = typeof field === 'string' ? _func_js__WEBPACK_IMPORTED_MODULE_1__.f.qS(field) : field;
    if (!(this.node instanceof HTMLElement)) return;
    //this.block         = targetBlock;
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

// Всплывающее сообщение
class MessageToast {
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

  show(msg = 'message body', type = 'success', autoClose = true) {
    const close = (delay = 3000) => {
      setTimeout(() => {
        this.messageBlock.remove();
      }, delay);
    }

    if (typeof type !== 'string') this.checkMsq(msg, type); else {
      this.setMessage(msg);
      this.setColor(type);
    }

    this.messageBlock.classList.remove('d-small');
    this.messageBlock.classList.add('d-large');

    if (autoClose) close();
    else this.messageBlock.addEventListener('click', close.bind(this, 0), {once: true});

    return this.messageBlock;
  }
}

// Печать
const Print = () => {
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
    const scrollY = window.pageYOffset;
    let delay = this.setContent(content, classList);
    setTimeout(() => {
      document.body.append(this.frame);
      this.frame.remove();
      window.scrollTo(0, scrollY);
    }, delay);
  }

  p.orderPrint = async function (printFunc, data, type) {
    let report = JSON.parse(data.order['report_value']);
    this.print(await printFunc(type, report));
  }

  return p;
}

// Поиск
const Searching = () => {
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
    inputNode.removeEventListener('keyup', this.bindInputNodeEvent);
    setTimeout(() => {
      this.usePopup && this.resultTmp.remove();
    }, 0);
  }

  // Events
  const inputNodeEvent = function (e) {
    let value = e.target.value;
    if(value.length > 1) {
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.show(this.resultTmp);
      this.returnFunc(this.search(value));
    } else {
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.resultTmp);
      this.returnFunc(Object.keys(this.searchData));
    }
    e.key === 'Enter' && e.target.dispatchEvent(new Event('blur')) && e.target.blur();
  }

  obj.searchFocus = function (e) {
    let target = e.target,
        wrap = target.parentNode;

    if(this.usePopup && !this.resultTmp) {
      this.resultTmp = _func_js__WEBPACK_IMPORTED_MODULE_1__.f.gTNode('#searchResult');
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
    console.log(+e.target.dataset.id, e.target);
    if(this.resultTmp === e.target) return;
    let index = +e.target.dataset.id;

    this.clear(inputNode);
    //inputNode.value = this.data[index].name;
    this.resultFunc(index);
  }

  return obj;
}

// Валидация
class Valid {
  constructor(param) {
    let {
      sendFunc = () => {},
          formNode = false,
          formSelector = '#authForm',
          submitNode = false,
          submitSelector = '#btnConfirmSend',
          fileFieldSelector = false, // Если поля не будет тогда просто after
          initMask = true,
          phoneMask = false,
        } = param;

    this.valid = new Set();
    try {
      this.form = formNode || document.querySelector(formSelector);
      this.btn =  submitNode || this.form.querySelector(submitSelector) || document.querySelector(submitSelector);
    } catch (e) {
      console.log(e.message); return;
    }

    this.initParam(param);

    // Form
    this.inputNodes = this.form.querySelectorAll('input[required]');
    this.inputNodes.forEach(n => {
      this.countNodes++;
      if (n.type === 'checkbox') n.addEventListener('click', (e) => this.validate(e));
      else {
        n.addEventListener('keyup', (e) => this.keyEnter(e));

        initMask && n.type === 'tel' && _func_js__WEBPACK_IMPORTED_MODULE_1__.f.maskInit && _func_js__WEBPACK_IMPORTED_MODULE_1__.f.maskInit(n, phoneMask);
      }
      n.addEventListener('blur', (e) => this.validate(e)); // может и не нужна
    });

    // Files
    this.fileInput = this.form.querySelector('input[type="file"]');
    if (this.fileInput) {
      fileFieldSelector && (this.fileField = this.form.querySelector(fileFieldSelector)); // Возможно понадобиться много полей
      this.files = {};
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
      debug = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.DEBUG || false,
        } = param;
    this.cssClass = cssClass;
    this.debug = debug;
    this.countNodes = 0;
  }

  // Активировать/Деактивировать кнопки
  btnActivate() {
    if (this.valid.size >= this.countNodes) delete this.btn.dataset.disabled;
    else this.btn.dataset.disabled = '1';
  }

  btnDisabled() {
    this.valid.clear();
    this.btnActivate();
  }

  checkFileInput() {
    let error = false;

    for (const file of Object.values(this.fileInput.files)) {
      let id = Math.random() * 10000 | 0;

      file.fileError = file.size > 1024*1024;
      if (file.fileError && !error) error = true;

      this.files[id] && (id += '1');
      this.files[id] = file;
    }
    this.fileInput.files = this.createInput().files;

    this.showFiles();

    if (error) {
      this.setErrorValidate(this.fileInput);
      this.btn.setAttribute('disabled', 'disabled');
    } else {
      this.setValidated(this.fileInput);
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

  validate(e, ignoreValue = false) {
    let node = e.target || target, reg;
    if (node.value.length > 0 || ignoreValue) {
      switch (node.name) {
        case 'name':
          if (node.value.length < 2) { this.setErrorValidate(node); }
          else this.setValidated(node);
          break;

        case 'phone': case 'tel':
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
    !ignoreValue && this.btnActivate();
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

  showFiles() {
    let html = '';

    Object.entries(this.files).forEach(([i, file]) => {
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
    if (e.target.dataset.disabled) {
      this.inputNodes.forEach(target => this.validate({target}, true));
      return;
    }

    const formData = new FormData(this.form),
          finished = () => {

      this.form.querySelectorAll('input')
          .forEach(n => {
            n.value = '';
            this.removeValidateClasses(n);
          });
      this.btnDisabled();

      //  добавить удаление события проверки файла
    }

    this.fileInput && formData.delete(this.fileInput.name);
    this.files && Object.entries(this.files).forEach(([id, file]) => {
      formData.append(id, file, file.name);
    });

    sendFunc(formData, finished, e);
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
    delete this.files[target.dataset.id];
    this.checkFileInput();
  }

  onEventForm() {
    this.form.addEventListener('click', (e) => this.clickCommon(e));
    this.fileInput && this.fileInput.addEventListener('change', this.checkFileInput.bind(this));
  }

  createInput() {
    let input = document.createElement('input');
    input.type = 'file';
    return input;
  }

  getFileTemplate(file, i) {
    return `<div class="attach__item ${file.fileError ? this.cssClass.error : ''}">
        <span class="bold">${file.name}</span>
        <span class="table-basket__cross"
              data-id="${i}"
              data-action="removeFile"></span></div>`;
  }
}

// Пагинация
const ACTIVE_CLASS = 'active';
class Pagination {
  constructor(fieldSelector = 'paginatorWrap', param) {
    let {
      queryParam = {}, // ссылка на объект отправляемый с функцией запроса
      query, // функция запроса со страницы
        } = param,
        field = _func_js__WEBPACK_IMPORTED_MODULE_1__.f.qS(fieldSelector);

    if (!(field && param.query && Object.values(queryParam).length)) return;
    this.activeClass    = ACTIVE_CLASS;
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
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.prevBtn.node, this.nextBtn.node);
      this.prevBtn.hidden = true;
      this.nextBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.eraseNode(this.onePageBtnNode);
      return;
    }

    this.fillPagination(pageCount);
  }

  checkBtn() {
    let currPage = +this.queryParam.currPage;
    if (currPage === 0 && !this.prevBtn.hidden) {
      this.prevBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.prevBtn.node);
    } else if (currPage > 0 && this.prevBtn.hidden) {
      this.prevBtn.hidden = false;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.show(this.prevBtn.node);
    }

    let pageCount = this.queryParam.pageCount - 1;
    if (currPage === pageCount && !this.nextBtn.hidden) {
      this.nextBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.nextBtn.node);
    } else if (currPage < pageCount && this.nextBtn.hidden) {
      this.nextBtn.hidden = false;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.show(this.nextBtn.node);
    }

    this.onePageBtnNode.querySelectorAll(`[data-page]`).forEach(n => {
      if (+n.dataset.page === currPage) n.classList.add(this.activeClass);
      else n.classList.remove(this.activeClass);
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

    //this.l = new LoaderIcon(this.node);
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
class SortColumns {
  constructor(thead, query, queryParam) {
    if (!thead || !query || !queryParam) return;
    let activeClass = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.SORT_BTN_CLASS;
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

  // сортировка
  sortRows(e) { /*↑↓*/
    let input = e.target,
        colSort = input.getAttribute('data-ordercolumn'),
        activeClass = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.SORT_BTN_CLASS,
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

// Сохрание заказво посетителей
class SaveVisitorsOrder {
  constructor(cpNumber) {
    this.nodes = [];
    this.createCpNumber = cpNumber || this.createCpNumberDefault;
  }

  /**
   * Add nodes to
   * @param collection {nodes[]}
   * @param report {!{cpNumber, inputValue, importantValue, total}}
   * @param event {string}
   *
   * @return result {object} - object contains result work save function;
   */
  setSaveVisitors(collection, report, event = 'click') {
    const result = Object.create(null);
    collection = this.checkNewNodes(collection);
    collection.forEach(n => {
      n.addEventListener(event, (e) => {
        result.cpNumber = this.addOrder(e, report);
      });
    })
    return result;
  }

  createCpNumberDefault() {
    return new Date().getTime().toString().slice(7);
  }

  checkNewNodes(c) {
    if (c instanceof NodeList) c = Object.values(c);
    else if (typeof c !== 'object' || !c.length) c = [c];
    return c.filter(n => !this.nodes.includes(n));
  }

  addOrder(e, report) {
    console.log('save');
    typeof report === 'function' && (report = report());

    // Обязательно проверять есть ли вообще что сохранять
    if (!report || !Object.values(report).length) return;

    const data = new FormData();
    this.cpNumber = this.createCpNumber();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveVisitorOrder');
    data.set('cpNumber', this.cpNumber);
    data.set('inputValue', JSON.stringify(report['inputValue'] || false));
    data.set('importantValue', JSON.stringify(report['importantValue'] || false));
    data.set('total', report.total);

    _query_js__WEBPACK_IMPORTED_MODULE_2__.q.Post({data});
  }

  /** return Promise use await */
  async getCpNumber() {
    return await new Promise((res, err) => {
      let i = setInterval(() => this.cpNumber && res(this.cpNumber), 50);
      setTimeout(() => clearInterval(i) && err(''), 1000);
    });
  }
}


/***/ }),

/***/ "./js/components/const.js":
/*!********************************!*\
  !*** ./js/components/const.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "c": () => (/* binding */ c)
/* harmony export */ });


/**
 * Global variables and simple functions
 */
const c = {
  DEBUG        : !!(window['DEBUG'] || false),
  OUTSIDE      : window['CL_OUTSIDE'],
  SITE_PATH    : window['SITE_PATH'] || '/',
  MAIN_PHP_PATH: (window['SITE_PATH'] || '/') + 'index.php',
  PUBLIC_PAGE  : (window['PUBLIC_PAGE'] || 'calculator'),
  PATH_IMG     : (window['PATH_IMG'] || 'public/images/'),
  AUTH_STATUS  : !!(window['AUTH_STATUS'] || false),

  CURRENT_EVENT: 'none',
  PHONE_MASK: '+7 (___) ___ __ __',

  // Global IDs
  // ------------------------------------------------------------------------------------------------
  ID: {
    AUTH_BLOCK: 'authBlock',
    POPUP: {
      title: 'popup_title',
    },
    PUBLIC_PAGE: 'publicPageLink'
  },

  CLASS_NAME: {
    // css класс который добавляется кнопкам сортировки
    SORT_BTN_CLASS: 'btn-light',
    // css класс который добавляется скрытым элементам
    HIDDEN_NODE: 'd-none',
    // css класс который добавляется неактивным элементам
    DISABLED_NODE: 'disabled',
    // css класс который добавляется при загрузке
    LOADING: 'loading-st1',
  },

  // Пробное
  calcWrap: document.querySelector('#wrapCalcNode'),
};


/***/ }),

/***/ "./js/components/func.js":
/*!*******************************!*\
  !*** ./js/components/func.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "f": () => (/* binding */ f)
/* harmony export */ });
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");
/* harmony import */ var _query_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query.js */ "./js/components/query.js");



const func = {

  // Simple and often used function
  // ------------------------------------------------------------------------------------------------

  log: (msg) => _const_js__WEBPACK_IMPORTED_MODULE_0__.c.DEBUG && console.log('Error:' + msg),

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
  qS: (selector = '', node = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.calcWrap) => {
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
    let  node = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.calcWrap || document,
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
    nodes.forEach(n => n.classList.remove(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.HIDDEN_NODE));
  }) },

  /**
   * Скрыть элементы
   * @param collection
   */
  hide: (...collection) => { collection.map(nodes => {
    if(!nodes) return;
    if(!nodes.forEach) nodes = [nodes];
    nodes.forEach(n => n.classList.add(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.HIDDEN_NODE));
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
    const qs = (s) => node.querySelectorAll(s),
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
          matrix = phoneMask || _const_js__WEBPACK_IMPORTED_MODULE_0__.c.PHONE_MASK,
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

        n.classList.remove(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.DISABLED_NODE);
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
        n.classList.add(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.DISABLED_NODE);
        n.setAttribute('disabled', 'disabled');
      });
    });
  },

  // Добавить иконку загрузки
  setLoading: (node) => {
    if(!node) return;
    node.classList.add(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.LOADING);
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
    node && node.classList.remove(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.LOADING);
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

    //data.set('dbAction', 'DB');
    data.set('mode', 'docs');
    data.set('docType', 'pdf');
    data.set('reportVal', JSON.stringify(report));

    _query_js__WEBPACK_IMPORTED_MODULE_1__.q.Post({data}).then(data => {
      func.removeLoading(target);
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

const f = Object.assign(func, _query_js__WEBPACK_IMPORTED_MODULE_1__.q);


/***/ }),

/***/ "./js/components/modal.js":
/*!********************************!*\
  !*** ./js/components/modal.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Modal": () => (/* binding */ Modal)
/* harmony export */ });
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");
/* harmony import */ var _func_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./func.js */ "./js/components/func.js");
// Модальное окно
//----------------------------------------------------------------------------------------------------------------------




/**
 * Модальное окно
 * @param param {{modalId: string, template: string, showDefaultButton: boolean, btnConfig: boolean}}
  */
const Modal = (param = {}) => {
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
        .forEach(n => n.addEventListener('click', () => this.hide()));
  }
  modal.btnConfig = function (key, param = Object.create(null)) {
    let node = this.wrap.querySelector('.' + key.replace('.', ''));
    node && param && Object.entries(param).forEach(([k, v]) => {node[k] = v});
  }
  modal.onEvent = function () {
    let func = function (e) {
      if (e.key === 'Escape') {
        modal.hide();
        document.removeEventListener('keyup', func);
      }
    }
    document.addEventListener('keyup', func);
  }
  modal.querySelector = function (selector) { return this.wrap.querySelector(selector) }
  modal.querySelectorAll = function (selector) { return this.wrap.querySelectorAll(selector) }

  /**
   * Show modal window
   * @param title Nodes | string[]
   * @param content Nodes | string[]
   */
  modal.show = function (title, content = '') {
    this.title && title !== undefined && _func_js__WEBPACK_IMPORTED_MODULE_1__.f.eraseNode(this.title).append(title);
    this.content && content && _func_js__WEBPACK_IMPORTED_MODULE_1__.f.eraseNode(this.content).append(content);

    data.bodyOver = document.body.style.overflow;
    data.scrollY = Math.max(window.scrollY, window.pageYOffset, document.body.scrollTop);
    document.body.style.overflow = 'hidden';

    if (document.body.scrollHeight > window.innerHeight && window.innerWidth > 800) {
      data.bodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = '16px';
    }

    this.wrap.classList.add('active');
    this.window.classList.add('active');
    modal.onEvent();
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
        document.body.style.paddingRight = data.bodyPaddingRight || 'initial';
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

    if (btnConfig) this.btnConfig(btnConfig);
    else this.btnField && !showDefaultButton && _func_js__WEBPACK_IMPORTED_MODULE_1__.f.eraseNode(this.btnField);

    //document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${c.SITE_PATH}core/assets/css/libs/modal.css">`);
    document.body.append(node.children[0]);
  }

  const templatePopup = () => {
    return `
    <div class="modal-overlay" id="${modalId}">
      <div class="modal p-15" data-role="window">
        <button type="button" class="close-modal">
          <span class="close-icon">✖</span>
        </button>
        <div class="modal-title" data-role="title">Title</div>
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


/***/ }),

/***/ "./js/components/query.js":
/*!********************************!*\
  !*** ./js/components/query.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "q": () => (/* binding */ q)
/* harmony export */ });
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");


// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = (data) => {
  try { return JSON.parse(data); }
  catch (e) { f.showMsg(data, 'error', false); return {status: false} }
};

const downloadBody = async (data) => {
  const fileName = JSON.parse(data.headers.get('fileName')),
        reader = data.body.getReader();
  let chunks = [],
      countSize = 0;

  while(true) {
    // done становится true в последнем фрагменте
    // value - Uint8Array из байтов каждого фрагмента
    const {done, value} = await reader.read();

    if (done) break;

    chunks.push(value);
    countSize += value.length;
  }
  return Object.assign(new Blob(chunks), {fileName});
}

const query = (url, data, type = 'json') => {
  type === 'file' && (type = 'body');
  return fetch(url, {method: 'post', body: data})
    .then(res => type === 'json' ? res.text() : res).then(
      data => {
        if (type === 'json') return checkJSON(data, type);
        else if (type === 'body') return downloadBody(data);
        else return data[type]();
      },
      error => console.log(error),
    );
};

/**
 * @type {{Post: (function({url?: *, data?: *, type?: *}): Promise),
 * Get: (function({url: *, data: *, type?: *}): Promise)}}
 */
const q = {

  /**
   * @param url
   * @param data
   * @param type
   * @return {*}
   * @constructor
   */
  Get: ({url = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.MAIN_PHP_PATH, data, type = 'json'}) => query(url + '?' + data, '', type),

  /**
   * Fetch Post function
   * @param url
   * @param data
   * @param type
   * @returns {Promise<Response>}
   */
  Post: ({url = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.MAIN_PHP_PATH, data, type = 'json'}) => query(url, data, type),

};


/***/ }),

/***/ "./js/components/shadownode.js":
/*!*************************************!*\
  !*** ./js/components/shadownode.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "shadowNode": () => (/* binding */ shadowNode)
/* harmony export */ });


const getCustomElements = () => {
  let element;

  customElements.define('shadow-calc', class extends HTMLElement {
    connectedCallback() {
      element = this.attachShadow({ mode: 'open' });
    }
  });

  return element;
}

class shadowNode {

  constructor() {
    this.customElements = getCustomElements();
    this.customElements && this.init();
  }

  init() {
    let shadowRoot = this.customElements,
        node = f.qS('#wrapCalcNode');

    shadowRoot.innerHTML = '';
    node.querySelectorAll('link[data-href]').forEach(n => {
      if (n.dataset.global) document.head.append(n);
      n.href = n.dataset.href;
    });
    shadowRoot.append(node);
    node.style.display = 'block';

    /*const template     = document.createElement('template');
     template.innerHTML = `<slot></slot><slot name="styles"></slot>`;
     this.shadowRoot.append(template.content.cloneNode(true));
     const style = this.shadowRoot.querySelector('slot').assignedNodes();
     this.shadowRoot.append(style[0]);*/
  }

}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************!*\
  !*** ./js/src.js ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/const.js */ "./js/components/const.js");
/* harmony import */ var _components_func_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/func.js */ "./js/components/func.js");
/* harmony import */ var _components_component_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/component.js */ "./js/components/component.js");
/* harmony import */ var _components_modal_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/modal.js */ "./js/components/modal.js");
/* harmony import */ var _components_shadownode_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/shadownode.js */ "./js/components/shadownode.js");


//import '../css/admin/admin.scss';








const m = {
  initModal : _components_modal_js__WEBPACK_IMPORTED_MODULE_3__.Modal,
  initPrint : _components_component_js__WEBPACK_IMPORTED_MODULE_2__.Print,

  searchInit: _components_component_js__WEBPACK_IMPORTED_MODULE_2__.Searching,

  /**
   * Validation component
   * autodetect input field with attribute "require" and show error/valid.
   *
   * @param param {{sendFunc: function,
   * formNode: HTMLFormElement,
   * formSelector: string,
   * submitNode: HTMLElement,
   * submitSelector: string,
   * fileFieldSelector: string,
   * initMask: boolean,
   * phoneMask: string,
   * cssMask: object}}
   * @param param.sendFunc - exec func for event click (default = () => {}),
   * @param param.formSelector - form selector (default: #authForm),
   * @param param.submitSelector - btn selector (default: #btnConfirm),
   * @param param.fileFieldSelector - field selector for show attachment files information,
   * @param param.cssClass = {
   *     error: will be added class for node (default: 'cl-input-error'),
   *     valid: will be added class for node (default: 'cl-input-valid'),
   *   },
   * @param param.debug: submit btn be activated (def: false),
   * @param param.initMask: use mask for field whit type "tel" (def: true),
   * @param param.phoneMask: mask matrix (def: from global constant),
   *
   * @example mask: new f.Valid({phoneMask: '+1 (\_\_) \_\_\_'});
   */
  Valid : _components_component_js__WEBPACK_IMPORTED_MODULE_2__.Valid,
  //initValid : (sendFunc, idForm, idSubmit) => module.valid.init(sendFunc, idForm, idSubmit),

  Pagination: _components_component_js__WEBPACK_IMPORTED_MODULE_2__.Pagination,

  SortColumns: _components_component_js__WEBPACK_IMPORTED_MODULE_2__.SortColumns,

  /**
   *
   * @param msg
   * @param type (success, warning, error)
   * @param autoClose bool
   */
  showMsg: (msg, type, autoClose) => new _components_component_js__WEBPACK_IMPORTED_MODULE_2__.MessageToast().show(msg, type, autoClose),
  LoaderIcon: _components_component_js__WEBPACK_IMPORTED_MODULE_2__.LoaderIcon,

  /**
   *
   */
  initShadow: (param) => new _components_shadownode_js__WEBPACK_IMPORTED_MODULE_4__.shadowNode(param),

  /**
   *
   */
  InitSaveVisitorsOrder: _components_component_js__WEBPACK_IMPORTED_MODULE_2__.SaveVisitorsOrder,
};

window.f = Object.assign(_components_const_js__WEBPACK_IMPORTED_MODULE_0__.c, m, _components_func_js__WEBPACK_IMPORTED_MODULE_1__.f);

})();

/******/ })()
;
//# sourceMappingURL=src.js.map