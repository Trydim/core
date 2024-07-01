"use strict";

import '../css/style.scss';

import c from "./components/const.ts";
import f from "./components/func.js";
import q from "./components/query.ts";

import * as module from './components/component.js';
import {Debugger} from "./components/Debugger";
import {Modal, ModalOur} from './components/Modal.js';
import {CustomSelect} from './components/CustomSelect.js';
import LocalStorage from "./components/LocalStorage.js";
import {ShadowNode} from './components/ShadowNode.js';
import {SelectedRow} from "./components/SelectedRow.js";
import {ToastClass, toast} from "./components/toast";
import {Valid} from "./components/Valid";
import {searching} from "./components/SearchCustomers";
import User from "./components/User";

const m = {
  Debugger,

  /** modal Sweetalert2 */
  Modal,
  /** Our dev modal */
  initModal : ModalOur,
  initPrint : module.Print,
  initShadow: param => new ShadowNode(param),

  observer: new module.Observer(),

  /**
   *
   */
  searchInit: searching,

  /**
   *
   */
  InitSaveVisitorsOrder: module.SaveVisitorsOrder,

  /**
   *
   */
  CustomSelect: CustomSelect,

  /**
   *
   */
  LoaderIcon: module.LoaderIcon,

  /**
   *
   */
  LocalStorage,

  /**
   * @type object
   * add, exec, del
   */
  oneTimeFunction: module.oneTimeFunction,

  Pagination: module.Pagination,

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
  SortColumns: module.SortColumns,

  /**
   * @param {object} param {{
   *   table: HTMLElement,
   * }}
   *
   * @param param.table - DOM node element consist data-id as elements Rows
   * @default param.table - f.qS('#table')
   */
  SelectedRow: SelectedRow,

  /**
   * @type class
   * https://f3oall.github.io/awesome-notifications/docs/
   * @param {object} options
   */
  Toast: ToastClass,

  /**
   * Alias for Toast
   * @param {string} msg
   * @param {string} type (tip, info, success|ok, warning, error|alert)
   * @param {boolean|object} options https://f3oall.github.io/awesome-notifications/docs/
   */
  showMsg: toast,

  /**
   * Validation component
   * autodetect input field with attribute "require" and show error/valid.
   *
   * @param {{sendFunc: function,
   * form: string|HTMLElement,
   * submit: string|HTMLElement,
   * fileFieldSelector: string,
   * initMask: boolean,
   * phoneMask: string,
   * cssMask: object}} param <p>
   * @param {function} param.sendFunc - exec func for event click (default = () => {}), <p>
   * @param {string/HTMLElement} param.formSelector - form selector (default: '#authForm'), <p>
   * @param {string/HTMLElement} param.submitSelector - btn selector (default: '.confirmYes'), <p>
   * @param {string} param.fileFieldSelector - field selector for show attachment files information, <p>
   * @param {object} param.cssClass = { <p>
   *     error: will be added class for node (default: 'cl-input-error'), <p>
   *     valid: will be added class for node (default: 'cl-input-valid'), <p>
   *   }, <p>
   * @param {string} param.classPrefix: prefix for validation class (def: 'cl-'),
   * @param {boolean} param.debug: submit btn be activated (def: false), <p>
   * @param {boolean} param.initMask: use mask for field whit type "tel" (def: true), <p>
   * @param {string} param.phoneMask: mask matrix (def: from global constant),
   *
   * @example Mask: new f.Valid({phoneMask: '+1 (\_\_) \_\_\_ \_\_ \_\_'});
   */
  Valid,
  //initValid : (sendFunc, idForm, idSubmit) => module.valid.init(sendFunc, idForm, idSubmit),

  /**
   * User class
   */
  User,
};

Object.defineProperty(window, 'f', {
  value: Object.assign({}, c, f, q, m),
  writable: false,
});
