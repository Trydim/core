"use strict";

import {c} from "../const.js";
import {f} from "./func.js";

import * as module from './components/component.js';
import { showerCalc } from './components/shower-calc.js';

const m = {

  initModal : module.Modal,
  initPrint : module.Print,

  searchInit: module.Searching,

  /**
   *
   * @param param - {
   *  sendFunc: exec func for event click (default = () => {}),
   *  formSelector: form selector (default: #authForm),
   *  submitSelector: btn selector (default: #btnConfirm),
   *  cssClass = {
   *     error: will be added class for node (default: 'cl-input-error'),
   *     valid: will be added class for node (default: 'cl-input-valid'),
   *   },
   *  debug: submit btn be activated (def: true),
   *  initMask: use mask for field whit type "tel" (def: true),
   * }
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

  /*

   */
  initShadow: (param) => new showerCalc(param),
};

window.f = Object.assign(c, m, f);
