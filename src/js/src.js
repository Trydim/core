"use strict";

//import '../css/admin/admin.scss';

import {c} from "./components/const.js";
import {f} from "./components/func.js";

import * as module from './components/component.js';
import { Modal } from './components/Modal.js';
import { CustomSelect } from './components/CustomSelect.js';
import { shadowNode } from './components/shadownode.js';

const m = {
  initModal : Modal,
  initPrint : module.Print,

  searchInit: module.Searching,

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
  Valid : module.Valid,
  //initValid : (sendFunc, idForm, idSubmit) => module.valid.init(sendFunc, idForm, idSubmit),

  Pagination: module.Pagination,

  SortColumns: module.SortColumns,

  /**
   *
   * @param msg
   * @param type (success, warning, error)
   * @param autoClose bool
   */
  showMsg: (msg, type, autoClose) => new module.MessageToast().show(msg, type, autoClose),
  LoaderIcon: module.LoaderIcon,

  /**
   *
   */
  initShadow: (param) => new shadowNode(param),

  /**
   *
   */
  InitSaveVisitorsOrder: module.SaveVisitorsOrder,

  observer: new module.Observer(),

  CustomSelect: CustomSelect,
};

window.f = Object.assign(c, m, f);
