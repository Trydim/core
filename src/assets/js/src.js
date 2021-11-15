/******/ var __webpack_modules__ = ({

/***/ "./js/components/CustomSelect.js":
/*!***************************************!*\
  !*** ./js/components/CustomSelect.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomSelect": () => (/* binding */ CustomSelect)
/* harmony export */ });
const getTemplate = (data = [], placeholder, selectedId) => {
  let text = placeholder ?? 'Placeholder по умолчанию';

  const items = data.map(item => {
    let cls = '';
    if (item.id === selectedId) {
      text = item.value;
      cls = 'selected';
    }
    return `
      <li class="select__item ${cls}" data-type="item" data-id="${item.id}">${item.value}</li>
    `;
  });

  return `
    <div class="select__backdrop" data-type="backdrop"></div>
    <div class="select__input" data-type="input">
      <span data-type="value">${text}</span>
      <i class="fa fa-chevron-down" data-type="arrow"></i>
    </div>
    <div class="select__dropdown">
      <ul class="select__list">
        ${items.join('')}
      </ul>
    </div>
  `;
}

class CustomSelect {
  constructor(selector, options) {
    this.$el = document.querySelector(selector);
    this.options = options;
    this.selectedId = options.selectedId;

    this.render();
    this.setup();
  }

  render() {
    const {placeholder, data} = this.options;
    this.$el.classList.add('select');
    this.$el.innerHTML = getTemplate(data, placeholder, this.selectedId);
  }

  setup() {
    this.clickHandler = this.clickHandler.bind(this);
    this.$el.addEventListener('click', this.clickHandler);
    this.$arrow = this.$el.querySelector('[data-type="arrow"]');
    this.$value = this.$el.querySelector('[data-type="value"]');
  }

  clickHandler(event) {
    const {type} = event.target.dataset;

    if (type === 'input') {
      this.toggle();
    } else if (type === 'item') {
      const id = event.target.dataset.id;
      this.select(id);
    } else if (type === 'backdrop') {
      this.close();
    }
  }

  get isOpen() {
    return this.$el.classList.contains('open');
  }

  get current() {
    return this.options.data.find(item => item.id === this.selectedId);
  }

  select(id) {
    this.selectedId = id;
    this.$value.textContent = this.current.value;

    this.$el.querySelectorAll('[data-type="item"]').forEach(el => {
      el.classList.remove('selected');
    })
    this.$el.querySelector(`[data-id="${id}"]`).classList.add('selected');

    this.options.onSelect ? this.options.onSelect(this.current) : null;

    this.close();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.$el.classList.add('open');
    this.$arrow.classList.remove('fa-chevron-down');
    this.$arrow.classList.add('fa-chevron-up');
  }

  close() {
    this.$el.classList.remove('open');
    this.$arrow.classList.add('fa-chevron-down');
    this.$arrow.classList.remove('fa-chevron-up');
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHandler);
    this.$el.innerHTML = '';
  }
}


/***/ }),

/***/ "./js/components/Debugger.js":
/*!***********************************!*\
  !*** ./js/components/Debugger.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Debugger": () => (/* binding */ Debugger)
/* harmony export */ });


class Debugger {
  /**
   *
   * @param param
   */
  constructor(param = Object.create(null)) {
    const {
      fieldSelector,
      fieldNode,
    } = param;

    this.field       = fieldSelector ? document.querySelector(fieldSelector) : fieldNode;
    this.showEach    = param.showEach || false;   // Show each added value
    this.showConsole = param.showConsole || true; // Show result to console
    this.showDom     = param.showDom || false;    // Output result to Dom
    this.showTrace   = param.showConsole || false;// add Trace

    this.clear();
  }

  clear() {
    this.dataArr = [];
    this.data    = new Map();
  }

  setShowEach(flag) {
    this.showEach = flag ? flag : true;
  }

  add(...param) {
    const [key, value, comment = ''] = param;

    if (Array.isArray(key)) { this.addAsArray(key); return this;}
    if (typeof key === 'object') { this.addAsObject(key); return this;}

    this.data.set(key, {key, value, comment});
    this.dataArr.push(f.replaceTemplate('${key}: ${value} ${comment}', this.data.get(key)));
    return this;
  }
  addAsArray(arr) {
    arr.forEach(i => this.add(...i));
    return this;
  }
  addAsObject(obj) {
    Object.entries(obj).forEach(([k, v]) => this.add(k, v));
    return this;
  }

  getTable() {
    console.table([...this.data.values()]);
  }

  getObject() {
    return this.data;
  }

  show() {
    const node = this.getWrap();
    node.innerHTML = this.dataArr.map(i => `<div>${i}</div>`).join('');

    document.body.append(node);
  }

  getWrap() {
    const node = document.createElement('div'),
          btn = document.createElement('input');
    node.style.cssText = 'position: fixed; left: 0; right: 0; bottom: 0; background: white';

    btn.type = 'button';
    btn.value = 'x';
    btn.addEventListener('click', () => node.remove());

    node.append(btn);
    return node;
  }

  getTemplate() {
    return `<div style=""></div>`;
  }
}


/***/ }),

/***/ "./js/components/Modal.js":
/*!********************************!*\
  !*** ./js/components/Modal.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Modal": () => (/* binding */ Modal)
/* harmony export */ });
/* harmony import */ var _modal_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_modal.scss */ "./js/components/_modal.scss");
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");
/* harmony import */ var _func_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./func.js */ "./js/components/func.js");







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
    this.title && title !== undefined && _func_js__WEBPACK_IMPORTED_MODULE_2__.f.eraseNode(this.title).append(title);
    if (this.content && content) {
      _func_js__WEBPACK_IMPORTED_MODULE_2__.f.eraseNode(this.content);
      typeof content === 'string' ? this.content.insertAdjacentHTML('afterbegin', content)
                                  : this.content.append(content);
    }

    data.bodyOver = document.body.style.overflow;
    data.scrollY = Math.max(window.scrollY, window.pageYOffset, document.body.scrollTop);
    document.body.style.overflow = 'hidden';

    if (document.documentElement.clientHeight > window.innerHeight && window.innerWidth > 800) {
      data.bodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = '16px';
    }

    this.wrap.style.display = 'flex';
    this.wrap.classList.add('active');
    this.window.classList.add('active');
    modal.onEvent();
  }

  modal.hide = function () {
    this.wrap.classList.remove('active');
    this.window.classList.remove('active');

    setTimeout( () => {
      this.wrap.style.display = 'none';
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

  modal.destroy = function () {
    this.hide();
    this.wrap.querySelectorAll('.close-modal, .confirmYes, .closeBtn')
        .forEach(n => n.removeEventListener('click', () => this.hide()));
    this.wrap.remove();
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
    else this.btnField && !showDefaultButton && _func_js__WEBPACK_IMPORTED_MODULE_2__.f.eraseNode(this.btnField);

    let btnY = this.wrap.querySelector('.confirmYes, [data-action="confirmYes"], [data-target="confirmBtn"]'),
        btnN = this.wrap.querySelector('.closeBtn, [data-action="confirmNo"], [data-target="cancelBtn"]');
    btnY && (this.btnConfirm = btnY);
    btnN && (this.btnCancel = btnN);

    //document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${c.SITE_PATH}core/assets/css/libs/modal.css">`);
    document.body.append(node.children[0]);
  }

  const templatePopup = () => {
    return `
    <div class="modal-overlay" id="${modalId}">
      <div class="modal p-3" data-role="window">
        <button type="button" class="close-modal">
          <div class="close-icon"></div>
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

/***/ "./js/components/SelectedRow.js":
/*!**************************************!*\
  !*** ./js/components/SelectedRow.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SelectedRow": () => (/* binding */ SelectedRow)
/* harmony export */ });
// TODO сохранять в сессии потом, что бы можно было перезагрузить страницу

class SelectedId {
  constructor(key) {
    this.key = key;
    this.id = new Set();
  }

  add(id) {
    if (!Array.isArray(id)) id = [id];
    id.forEach(id => this.id.add(id));
    this.fire();
    return this;
  }

  delete(id) {
    this.id.delete(id);
    this.fire();
    return this;
  }

  clear() {
    this.id = new Set();
    this.fire();
    return this;
  }

  get size() {
    return this.id.size;
  }

  getAsArray() {
    let ids = [];
    for (let id of this.id.values()) ids.push(id);
    return ids;
  }

  forEach(func) {
    this.id.forEach(func);
  }

  fire() {
    this.timeOut && clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      clearTimeout(this.timeOut);
      f.observer.fire(this.key, this.getAsArray(), this.size);
    }, 10);
  }
}

class SelectedRow {
  /**
   * @param {object} param
   * @param {HTMLElement} param.table
   */
  constructor(param) {
    let {
      table = f.qS('#table'),
      //selectedField = f.qS('#')
    } = param;


    if (!table) return;
    this.table = table;
    this.observerKey = 'selected' + (Math.random() * 10000 | 0);
    this.setSelectedId();
    this.onTableMutator();
    this.onTableEvent();
    f.observer.addArgument(this.observerKey, this);
  }

  setSelectedId() {
    this.selectedId = new SelectedId(this.observerKey);
  }
  clear() {
    this.checkedRows(false);
    this.selectedId.clear();
  }
  add(id) {
    this.selectedId.add(id);
    return this;
  }
  remove(id) {
    this.selectedId.delete(id);
    return this;
  }

  // Observer func
  /**
   * @return {string} - use observerKey in fire function as name
   */
  getObserverKey() {
    return this.observerKey;
  }
  /**
   * @param {function(string[], int, , SelectedRow)} func - fired function(selectedIds, count, any, SelectedRow)
   *
   * @param {any} arg - add argument
   */
  subscribe(func, ...arg) {
    f.observer.subscribe(this.observerKey, (selectedIds, b, c) => func(selectedIds, b, ...arg, c));
  }

  getSelected() {
    return this.selectedId.getAsArray();
  }
  getSelectedSize() {
    return this.selectedId.size;
  }

  // Выделить выбранные строки
  checkedRows(check = true) {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      input && (input.checked = check);
    });
  }

  checkedAll() {
    this.table.querySelectorAll(`input[data-id]`)
        .forEach(i => {
          this.add(i.dataset.id);
          i.checked = true;
        });
  }

  /**
   * @param {string|id} id
   * @param {boolean} check
   * @return {SelectedRow}
   */
  checkedById(id, check = true) {
    let input = this.table.querySelector(`input[data-id="${id}"]`);
    input && (input.checked = check);
    this.remove(id);
    return this;
  }

  handle() {
    this.checkedRows();
  }

  onTableMutator() {
    const observer = new MutationObserver(this.handle.bind(this));

    observer.observe(this.table, {
      childList: true,
      subtree: true,
    });
  }

  // Event function
  mouseOver(e) {
    let tr = e.target.closest('tr');
    if (e.buttons) tr.classList.add('mouseSelected');
    else if (tr.classList.contains('mouseSelected')) tr.classList.remove('mouseSelected')
  }
  mouseDown(e) {
    let tr = e.target.closest('tr');
    this.startClick = tr && tr.rowIndex;
  }
  mouseUp(e) {
    let tr = e.target.closest('tr');
    if (!tr) return;
    let finishClick = tr.rowIndex,
        start = Math.min(this.startClick, finishClick),
        finish = Math.max(this.startClick, finishClick);

    for (let i = start; i <= finish; i++) {
      let input = this.table.rows[i].querySelector('input'),
          id = input && input.dataset.id;

      if (!input || !id) return;
      input.checked = !input.checked;
      input.checked ? this.add(id) : this.remove(id);
    }

    delete this.startClick;
    this.table.querySelectorAll('.mouseSelected')
        .forEach(tr => tr.classList.remove('mouseSelected'));
  }

  // Bind event
  onTableEvent() {
    this.table.addEventListener('mouseover', e => this.mouseOver(e));
    this.table.addEventListener('mousedown', e => this.mouseDown(e));
    this.table.addEventListener('mouseup', e => this.mouseUp(e));
    this.table.addEventListener('click', e => e.preventDefault());
  }
}


/***/ }),

/***/ "./js/components/Valid.js":
/*!********************************!*\
  !*** ./js/components/Valid.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Valid": () => (/* binding */ Valid)
/* harmony export */ });
/* harmony import */ var _valid_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_valid.scss */ "./js/components/_valid.scss");




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
      this.btn  = submitNode || this.form.querySelector(submitSelector) || document.querySelector(submitSelector);
    } catch (e) {
      console.log(e.message); return;
    }

    this.initParam(param);

    // Form
    this.inputNodes = this.form.querySelectorAll('input[required]');
    this.inputNodes.forEach(n => {
      this.countNodes++;
      if (n.type === 'checkbox') n.addEventListener('click', e => this.validate(e));
      else {
        n.addEventListener('keyup', e => this.keyEnter(e));

        initMask && n.type === 'tel' && f.maskInit && f.maskInit(n, phoneMask);
      }
      n.addEventListener('blur', e => this.validate(e)); // может и не нужна
      this.validate(n);
    });

    // Files
    this.fileInput = this.form.querySelector('input[type="file"]');
    if (this.fileInput) {
      fileFieldSelector && (this.fileField = this.form.querySelector(fileFieldSelector)); // Возможно понадобиться много полей
      this.files = {};
    }

    // Send Btn
    this.btn.onclick = e => this.confirm(e, sendFunc);
    if (this.countNodes === 0 || this.debug) this.btnActivate();
    else if (this.valid.size < this.countNodes) this.btnDisabled();

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
    this.clearInput(this.fileInput.files);
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
    let node = e.target || e, reg;
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

  clearInput(node) {
    let input = document.createElement('input');
    input.type = 'file';
    node.files = input.files;
  }

  getFileTemplate(file, i) {
    return `<div class="attach__item ${file.fileError ? this.cssClass.error : ''}">
        <span class="bold">${file.name}</span>
        <span class="table-basket__cross"
              data-id="${i}"
              data-action="removeFile"></span></div>`;
  }
}


/***/ }),

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
/* harmony export */   "Pagination": () => (/* binding */ Pagination),
/* harmony export */   "SortColumns": () => (/* binding */ SortColumns),
/* harmony export */   "SaveVisitorsOrder": () => (/* binding */ SaveVisitorsOrder),
/* harmony export */   "Observer": () => (/* binding */ Observer),
/* harmony export */   "OneTimeFunction": () => (/* binding */ OneTimeFunction)
/* harmony export */ });
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./js/components/const.js");
/* harmony import */ var _func_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./func.js */ "./js/components/func.js");
/* harmony import */ var _query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./query.js */ "./js/components/query.js");
// МОДУЛИ
//----------------------------------------------------------------------------------------------------------------------





// Загрузчик / preLoader
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
    this.loaderNode.style.height = coords.height + 'px';
    this.loaderNode.style.width  = coords.width + 'px';
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
    this.messageBlock.classList.value = 'position-fixed top-0 start-50 translate-middle-x align-items-center p-3 w-50 fade';
    this.messageBlock.setAttribute('type', 'button');
    this.messageBlock.style.zIndex = '1080';
    document.body.append(this.messageBlock);
  }

  checkMsq(msg, type) {
    if (!type) {
      this.setMessage(type);
      this.setColor('error');
    } else {
      this.setMessage(msg);
      this.setColor('success');
    }
  }

  setMessage(msg) {
    this.messageBlock.innerHTML = `<div class="row">
      <div class="col-11 text-center">${msg}</div>
      <button type="button" class="col-1 btn-close btn-close-white m-auto"></button>
    </div>`;
  }

  setColor(color) {
    this.messageBlock.classList.remove('bg-success', 'bg-warning', 'bg-danger');
    switch (color) {
      case 'success':
      default:
        this.messageBlock.classList.add('bg-success');
        break;
      case 'warning':
        this.messageBlock.classList.add('bg-warning');
        break;
      case 'error':
        this.messageBlock.classList.add('bg-danger');
        break;
    }
    setTimeout(() => this.messageBlock.classList.add('show', 'pi-white'), 50);
  }

  show(msg = 'message body', type = 'success', autoClose = true) {
    const close = (delay = 3000) => {
      setTimeout(() => {
        this.messageBlock.classList.remove('show');
        setTimeout( () => this.messageBlock.remove(), 300);
      }, delay);
    }

    if (typeof type !== 'string') this.checkMsq(msg, type);
    else {
      this.setMessage(msg);
      this.setColor(type);
    }

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

  p.loadImage = link => new Promise(resolve => {
    fetch(link).then(data => data.blob()).then(data => {
      let reader = new FileReader();

      reader.onloadend = () => {
        let img = document.createElement('img');
        img.style.width = '100%';
        img.src = reader.result;
        resolve(img);
      }

      reader.readAsDataURL(data);
    });
  });

  p.prepareContent = async function (container) {
    let nodes = container.querySelectorAll('img'),
        imagesPromise = [];

    nodes.forEach(n => {
      !n.src.includes('base64') && imagesPromise.push(this.loadImage(n.src));
    })

    imagesPromise.length
    && await Promise.all([...imagesPromise])
                    .then(value => nodes.forEach((n, i) => n.src = value[i].src));

    return container;
  }

  p.setContent = async function (content, classList = []) {
    let container = document.createElement('div'), cloneN, delay = 0,
        haveImg = content.includes('<img');
    classList.map(i => container.classList.add(i));
    container.innerHTML = content;
    if(haveImg) {
      container = await this.prepareContent(container);
    }
    this.data = container;
  }

  p.print = function (content, printStyleTpl = 'printTpl.css', classList = []) {
    _query_js__WEBPACK_IMPORTED_MODULE_2__.q.Get({
      data: 'mode=docs&docsAction=getPrintStyle&fileTpl=' + printStyleTpl
    }).then(async data => {
      const scrollY = window.pageYOffset;

      typeof data.style === 'string' && (content = `<style>${data.style}</style>` + content);
      await this.setContent(content, classList);

      document.body.append(this.frame);
      this.frame.remove();
      window.scrollTo(0, scrollY);
    });
  }

  /**
   * Печатать используя фукнцию
   * @param printFunc
   * @param data
   * @param type
   * @return {Promise<void>}
   */
  p.orderPrint = async function (printFunc, data, type) {
    let report = JSON.parse(data.order['reportValue']);
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
    if(this.resultTmp === e.target) return;
    let index = +e.target.dataset.id;

    this.clear(inputNode);
    //inputNode.value = this.data[index].name;
    this.resultFunc(index);
  }

  return obj;
}

// Пагинация
class Pagination {
  constructor(fieldSelector = 'paginatorWrap', param) {
    let {
      dbAction,       // Принудительное Событие запроса
      sortParam = {}, // ссылка на объект отправляемый с функцией запроса
      query,          // функция запроса со страницы
        } = param,
        field = _func_js__WEBPACK_IMPORTED_MODULE_1__.f.qS(fieldSelector);

    if (!(field && param.query)) return;

    this.node           = field;
    this.node.innerHTML = this.template();
    this.node.onclick   = this.onclick.bind(this);

    this.prevBtn = {node: this.node.querySelector('[data-action="prev"]')};
    this.nextBtn = {node: this.node.querySelector('[data-action="next"]')};
    this.onePageBtnWrap = this.node.querySelector('[data-btnwrap]');

    this.query       = query;
    this.dbAction    = dbAction;
    this.sortParam   = sortParam;
    this.activeClass = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.ACTIVE;
  }

  setQueryAction(action) {
    this.dbAction = action;
  }
  setCountPageBtn(count) {
    let pageCount = Math.ceil(+count / this.sortParam.countPerPage );

    if(+this.sortParam.pageCount !== +pageCount) this.sortParam.pageCount = +pageCount;
    else return;

    if (pageCount === 1) {
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.prevBtn.node, this.nextBtn.node);
      this.prevBtn.hidden = true;
      this.nextBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.eraseNode(this.onePageBtnWrap);
      return;
    }

    this.fillPagination(pageCount);
  }

  checkBtn() {
    let currPage = +this.sortParam.currPage;
    if (currPage === 0 && !this.prevBtn.hidden) {
      this.prevBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.prevBtn.node);
    } else if (currPage > 0 && this.prevBtn.hidden) {
      this.prevBtn.hidden = false;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.show(this.prevBtn.node);
    }

    let pageCount = this.sortParam.pageCount - 1;
    if (currPage === pageCount && !this.nextBtn.hidden) {
      this.nextBtn.hidden = true;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.hide(this.nextBtn.node);
    } else if (currPage < pageCount && this.nextBtn.hidden) {
      this.nextBtn.hidden = false;
      _func_js__WEBPACK_IMPORTED_MODULE_1__.f.show(this.nextBtn.node);
    }

    let n = this.onePageBtnWrap.querySelector('.' + this.activeClass);
    n && n.classList.remove(this.activeClass);
    n = this.onePageBtnWrap.querySelector(`[data-page="${currPage}"]`);
    n && n.parentNode.classList.add(this.activeClass);
  }

  fillPagination(count) {
    let html = '', tpl,
        input = this.templateBtn();

    for(let i = 0; i < count; i++) {
      tpl = input.replace('${page}', i.toString());
      tpl = tpl.replace('${pageValue}', (i + 1).toString());
      html += tpl;
    }

    this.onePageBtnWrap.innerHTML = html;
    this.checkBtn();
  }

  onclick(e) {
    let btn = e && e.target,
        key = btn && btn.dataset.action;
    if (!key) return;

    switch (key) {
      case 'prev':
        this.sortParam.currPage--;
        break;
      case 'next':
        this.sortParam.currPage++;
        break;
      case 'page': this.sortParam.currPage = btn.dataset.page; break;
      case 'count':
        if (this.sortParam.countPerPage === +e.target.value) return;
        this.sortParam.countPerPage = +e.target.value;
        this.sortParam.currPage = 0;
        break;
    }

    //this.l = new LoaderIcon(this.node);
    this.checkBtn();
    this.query(this.dbAction);
  }

  template() {
    return `<div class="pagination justify-content-center">
      <div class="page-item me-2">
        <button type="button" class="page-link" data-action="prev">&laquo;</button>
      </div>
      <div class="page-item pagination" data-btnwrap></div>
      <div class="page-item ms-2">
        <button type="button" class="page-link" data-action="next">&raquo;</button>
      </div>

      <div class="page-item ms-5">
        <select class="form-select d-inline-block" data-action="count">
          <option value="5">5 запись</option>
          <option value="10">10 записей</option>
          <option value="20" selected>20 записей</option>
        </select>
      </div>
    </div>`;
  }

  templateBtn() {
    return `<div class="page-item"><input type="button"
      value="\${pageValue}" class="page-link"
      data-action="page" data-page="\${page}"></div>`;
  }
}

// Сортировка столбцов
class SortColumns {
  constructor(param) {
    const {
            thead,     // Тег заголовка с кнопками сортировки
            query,     // Функция запроса
            dbAction,  // Событие ДБ
            sortParam, // Объект Параметров
          } = param;

    if (!thead || !query || !sortParam) return;

    let activeClass = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.SORT_BTN_CLASS;
    this.thead = thead;
    this.query = query;
    this.dbAction = dbAction || '';
    this.sortParam = sortParam;
    this.arrow = {
      notActive: '↑↓',
      arrowDown: '↓',
      arrowUp: '↑',
    }

    // Sort Btn
    this.thead.querySelectorAll('input').forEach(n => {
      n.addEventListener('click', e => this.sortRows.call(this, e));
      n.value += ' ' + this.arrow.notActive;

      if (n.dataset.column === this.sortParam.sortColumn) {
        n.classList.add(activeClass);
        n.value = n.value.replace(this.arrow.notActive, this.arrow.arrowDown);
      }
    });
  }

  // сортировка
  sortRows(e) { /*↑↓*/
    let input = e.target,
        colSort = input.dataset.column,
        activeClass = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.SORT_BTN_CLASS,
        {notActive, arrowDown, arrowUp} = this.arrow,
        arrowReg = new RegExp(`${notActive}|${arrowDown}|${arrowUp}`);

    if(this.sortParam.sortColumn === colSort) {
      this.sortParam.sortDirect = !this.sortParam.sortDirect;
    } else {
      this.sortParam.sortColumn = colSort;
      this.sortParam.sortDirect = false;
    }

    let node = this.thead.querySelector(`input.${activeClass}`);
    if (node !== input) {
      node && node.classList.remove(activeClass);
      node && (node.value = node.value.replace(arrowReg, notActive));
      input.classList.add(activeClass);
    }

    if (this.sortParam.sortDirect) input.value = input.value.replace(arrowReg, arrowUp);
    else input.value = input.value.replace(arrowReg, arrowDown);

    this.query(this.dbAction);
  }
}

// Сохранение заказов посетителей
class SaveVisitorsOrder {
  constructor(createCpNumber) {
    this.nodes = [];
    this.createCpNumber = createCpNumber || this.createCpNumberDefault;
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
      n.addEventListener(event, async () => {
        await new Promise((res, err) => {
          let i = setInterval(() => this.cpNumber && res(this.cpNumber), 0);
          setTimeout(() => clearInterval(i) && err(''), 1000);
        });
        result.cpNumber = this.cpNumber;
        this.emitAddOrder(report);
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

  addOrder(report) {
    console.log('saved');
    typeof report === 'function' && (report = report());

    // Обязательно проверять есть ли вообще что сохранять
    if (!report || !Object.values(report).length) return;

    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveVisitorOrder');
    data.set('cpNumber', this.cpNumber);
    data.set('inputValue', JSON.stringify(report['inputValue'] || false));
    data.set('importantValue', JSON.stringify(report['importantValue'] || false));
    data.set('total', report.total);

    _query_js__WEBPACK_IMPORTED_MODULE_2__.q.Post({data});
  }

  async emitAddOrder(report) {
    !this.cpNumber && await new Promise((res, err) => {
      let i = setInterval(() => this.cpNumber && res(this.cpNumber), 0);
      setTimeout(() => clearInterval(i) && err(''), 1000);
    });
    setTimeout(() => this.addOrder(report), 0);
  }

  getCpNumber() {
    !this.cpNumber && (this.cpNumber = this.createCpNumber());
    return this.cpNumber;
  }
}

class Observer {
  constructor() {
    this.publisher = Object.create(null);
    this.listeners = Object.create(null);
  }
  /**
   * add fixed argument with each fired function
   * @param {string} name
   * @param {object} object - pass object
   */
  addArgument(name, object) {
    this.publisher[name] = object;
  }
  remove(name) {
    delete this.publisher[name];
    delete this.listeners[name];
  }
  getListPublisher() {
    return {
      publisher: Object.keys(this.publisher),
      listeners: Object.keys(this.listeners),
    };
  }
  subscribe(name, func) {
    if (!func) console.warn('Function must have!');
    !this.listeners[name] && (this.listeners[name] = []);
    this.listeners[name].push(func);
    return this.publisher[name] || false;
  }
  fire(name, ...arg) {
    if (Array.isArray(this.listeners[name])) {
      this.listeners[name].forEach(listener => listener(...arg, this.publisher[name]));
      return true;
    }
    return false;
  }
}

// Одноразовые функции
class OneTimeFunction {
  constructor(funcName, func) {
    this.func = Object.create(null);

    funcName && this.add(funcName, func);
  }

  add(name, func) {
    this.func[name] = func;
  }

  exec(name, ...arg) {
    if (this.func[name]) {
      this.func[name](...arg);
      this.del(name);
    }
  }

  del(name) {
    this.func[name] && (delete this.func[name]);
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
  DEBUG        : window['DEBUG'] || false,
  CSV_DEVELOP  : !!window['CSV_DEVELOP'] || false,
  OUTSIDE      : window['CL_OUTSIDE'],
  SITE_PATH    : window['SITE_PATH'] || '/',
  MAIN_PHP_PATH: (window['SITE_PATH'] || '/') + 'index.php',
  PUBLIC_PAGE  : (window['PUBLIC_PAGE'] || 'calculator'),
  PATH_IMG     : (window['PATH_IMG'] || 'public/images/'),
  AUTH_STATUS  : !!(window['AUTH_STATUS'] || false),

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
    // css класс который добавляется активным элементам
    ACTIVE: 'active',
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

  log: msg => _const_js__WEBPACK_IMPORTED_MODULE_0__.c.DEBUG && console.log('Error:' + msg),

  /**
   * Get Element by id from document or shadow DOM
   * @param id
   * @return {HTMLElement | {}}
   */
  gI: id => (_const_js__WEBPACK_IMPORTED_MODULE_0__.c.calcWrap || document).getElementById(id) || func.log('not found note by id -' + id),

  /**
   * @param selector
   * @param node
   * @return {HTMLElement | {}}
   */
  qS: (selector = '', node = _const_js__WEBPACK_IMPORTED_MODULE_0__.c.calcWrap) =>
    (node || document).querySelector(selector) || func.log(selector),

  /**
   *
   * @param selector {string} - css selector string
   * @param nodeKey {string/null} - param/key
   * @param value - value/function, function (this, Node list, current selector)
   * @return NodeListOf<HTMLElementTagNameMap[*]>|object
   */
  qA: (selector, nodeKey = null, value = null) => {
    let nodeList = (_const_js__WEBPACK_IMPORTED_MODULE_0__.c.calcWrap || document).querySelectorAll(selector);
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
  gT: selector => { let node = func.qS(selector); return node ? node.content.children[0].outerHTML : 'Not found template' + id},

  /**
   * Получить Node шаблона
   * @param selector {string}
   * @returns {Node}
   */
  gTNode: selector => func.qS(selector).content.children[0].cloneNode(true),

  getData: selector => {
    const node = func.qS(selector),
          json = node && (JSON.parse(node.value));
    if (!node) return false;
    else node.remove();
    return json;
  },

  /**
   * get Object like associative arrays
   * @param selector
   * @return object
   */
  getDataAsAssoc: selector => {
    const arr      = Object.values(func.getData(selector) || []),
          fItem    = arr[0],
          fKeys    = Object.keys(fItem);

    let oneValue = false;

    if (fKeys.length === 2 && (fItem['id'] || fItem['key'])) {
      const res = fKeys.filter(k => !['id', 'key'].includes(k));
      res.length === 1 && (oneValue = res[0]);
    }

    return arr.reduce((r, i, index) => {
      let idKey = i['id'] || i['key'] || Math.random() * 1000 | 0;
      r[idKey] && (idKey += index.toString());
      r[idKey] = oneValue ? i[oneValue] : i;
      return r;
    }, Object.create(null));
  },
  getDataAsMap: selector => new Map(Object.entries(func.getDataAsAssoc(selector) || {})),
  getDataAsSet: selector => new Set(Object.values(func.getData(selector) || [])),
  getDataAsArray : selector => Object.values(func.getData(selector) || []),

  // перевод в число
  toNumber: input => +(input.replace(/(\s|\D)/g, '')),

  /**
   * Формат цифр (разделение пробелом)
   */
  setFormat: num => (num.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, " "),

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
  eraseNode: node => {
    let n;
    while ((n = node.firstChild)) n.remove();
    return node;
  },

  /**
   * Replace latin to cyrillic symbol
   * @param value
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
   * @param fileName
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
    let link = func.createLink(name);
    if (data.type === 'base64') link.href = blob;
    else link.href = URL.createObjectURL(blob);
    link.click();
  },

  // Маска для телефона
  maskInit: (node, phoneMask) => {
    if (!node) return;
    const minValue = 2;

    const mask = e => {
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

  /** Добавить иконку загрузки */
  setLoading: node => {
    node && node.classList.add(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.LOADING);
  },
  /** Удалить иконку загрузки */
  removeLoading: node => {
    node && node.classList.remove(_const_js__WEBPACK_IMPORTED_MODULE_0__.c.CLASS_NAME.LOADING);
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
    func.setLoading(target);
    target.setAttribute('disabled', 'disabled');

    let fileName = report.fileName || false;
    //data.set('dbAction', 'DB');
    data.set('mode', 'docs');
    data.set('docType', 'pdf');
    data.set('reportVal', JSON.stringify(report));

    _query_js__WEBPACK_IMPORTED_MODULE_1__.q.Post({data}).then(data => {
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

const f = Object.assign(func, _query_js__WEBPACK_IMPORTED_MODULE_1__.q);


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

const checkJSON = data => {
  try {
    const response = JSON.parse(data);
    if (response['error']) throw response['error'];
    return response;
  }
  catch (e) { f.showMsg(e['xdebug_message'] || e.message || data, 'error', false); return {status: false}; }
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


/***/ }),

/***/ "./css/style.scss":
/*!************************!*\
  !*** ./css/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./js/components/_modal.scss":
/*!***********************************!*\
  !*** ./js/components/_modal.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./js/components/_valid.scss":
/*!***********************************!*\
  !*** ./js/components/_valid.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************!*\
  !*** ./js/src.js ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_style_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.scss */ "./css/style.scss");
/* harmony import */ var _components_const_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/const.js */ "./js/components/const.js");
/* harmony import */ var _components_func_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/func.js */ "./js/components/func.js");
/* harmony import */ var _components_component_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/component.js */ "./js/components/component.js");
/* harmony import */ var _components_Debugger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/Debugger */ "./js/components/Debugger.js");
/* harmony import */ var _components_Modal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/Modal.js */ "./js/components/Modal.js");
/* harmony import */ var _components_CustomSelect_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/CustomSelect.js */ "./js/components/CustomSelect.js");
/* harmony import */ var _components_shadownode_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/shadownode.js */ "./js/components/shadownode.js");
/* harmony import */ var _components_SelectedRow_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/SelectedRow.js */ "./js/components/SelectedRow.js");
/* harmony import */ var _components_Valid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/Valid */ "./js/components/Valid.js");















const m = {
  /**
   * Debugger
   */
  Debugger: _components_Debugger__WEBPACK_IMPORTED_MODULE_4__.Debugger,


  initModal : _components_Modal_js__WEBPACK_IMPORTED_MODULE_5__.Modal,
  initPrint : _components_component_js__WEBPACK_IMPORTED_MODULE_3__.Print,
  initShadow: (param) => new _components_shadownode_js__WEBPACK_IMPORTED_MODULE_7__.shadowNode(param),

  observer: new _components_component_js__WEBPACK_IMPORTED_MODULE_3__.Observer(),

  searchInit: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.Searching,

  /**
   *
   */
  InitSaveVisitorsOrder: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.SaveVisitorsOrder,

  /**
   *
   */
  CustomSelect: _components_CustomSelect_js__WEBPACK_IMPORTED_MODULE_6__.CustomSelect,

  /**
   *
   */
  LoaderIcon: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.LoaderIcon,

  /**
   * @param name {string}
   * @param func {function}
   */
  OneTimeFunction: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.OneTimeFunction,

  Pagination: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.Pagination,

  /**
   * @param param {{thead: HTMLElement,
   * query: function,
   * dbAction: string,
   * sortParam: object}}
   * @param param.thead - element with sort button, button must have data-column
   * @param param.query - exec func with param dbAction
   * @param param.dbAction - action for db, send whit query
   * @param param.sortParam = {
   *   sortDirect: boolean, true = DESC
   *   currPage: integer,
   *   countPerPage: integer,
   *   pageCount: integer,
   * } - param as page, sort and other
   */
  SortColumns: _components_component_js__WEBPACK_IMPORTED_MODULE_3__.SortColumns,

  /**
   * @param {object} param {{
   *   table: HTMLElement,
   * }}
   *
   * @param param.table - DOM node element consist data-id as elements Rows
   * @default param.table - f.qS('#table')
   */
  SelectedRow: _components_SelectedRow_js__WEBPACK_IMPORTED_MODULE_8__.SelectedRow,

  /**
   * @param {string} msg
   * @param {string} type (success, warning, error)
   * @param {boolean} autoClose
   */
  showMsg: (msg, type = 'error', autoClose = true) => new _components_component_js__WEBPACK_IMPORTED_MODULE_3__.MessageToast().show(msg, type, autoClose),

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
  Valid: _components_Valid__WEBPACK_IMPORTED_MODULE_9__.Valid,
  //initValid : (sendFunc, idForm, idSubmit) => module.valid.init(sendFunc, idForm, idSubmit),
};

window.f = Object.assign(_components_const_js__WEBPACK_IMPORTED_MODULE_1__.c, m, _components_func_js__WEBPACK_IMPORTED_MODULE_2__.f);

})();


//# sourceMappingURL=src.js.map