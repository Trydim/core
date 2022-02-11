"use strict";

import '../css/style.scss';

import c from "./components/const.js";
import f from "./components/func.js";
import q from "./components/query.js";

import * as module from './components/component.js';
import {Debugger} from "./components/Debugger";
import {Modal} from './components/Modal.js';
import {CustomSelect} from './components/CustomSelect.js';
import LocalStorage from "./components/LocalStorage.js";
import {shadowNode} from './components/shadownode.js';
import {SelectedRow} from "./components/SelectedRow.js";
import {Valid} from "./components/Valid";
import {searching} from "./components/SearchCustomers";
import User from "./components/User";

const m = {
  /**
   * Debugger
   */
  Debugger,


  initModal : Modal,
  initPrint : module.Print,
  initShadow: param => new shadowNode(param),

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
   * @param {string} name
   * @param {function} func
   */
  OneTimeFunction: module.OneTimeFunction,

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
   * @param {string} msg
   * @param {string} type (success, warning, error)
   * @param {boolean} autoClose
   */
  showMsg: (msg, type = 'success', autoClose = true) => new module.MessageToast().show(msg, type, autoClose),

  /**
   * Validation component
   * autodetect input field with attribute "require" and show error/valid.
   *
   * @param {{sendFunc: function,
   * formNode: HTMLFormElement,
   * formSelector: string,
   * submitNode: HTMLElement,
   * submitSelector: string,
   * fileFieldSelector: string,
   * initMask: boolean,
   * phoneMask: string,
   * cssMask: object}} param <p>
   * @param {function} param.sendFunc - exec func for event click (default = () => {}), <p>
   * @param {string/HTMLElement} param.formSelector - form selector (default: #authForm), <p>
   * @param {string/HTMLElement} param.submitSelector - btn selector (default: #btnConfirm), <p>
   * @param {string} param.fileFieldSelector - field selector for show attachment files information, <p>
   * @param {object} param.cssClass = { <p>
   *     error: will be added class for node (default: 'cl-input-error'), <p>
   *     valid: will be added class for node (default: 'cl-input-valid'), <p>
   *   }, <p>
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
   *
   */
  User,
};

window.f = Object.assign(c, f, q, m);
