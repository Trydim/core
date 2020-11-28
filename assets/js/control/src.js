"use strict";

import {c} from "../const.js";
import {f} from "./func.js";

import * as module from './components/component.js';

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

const m = {

  initModal : module.Modal,
  initPrint : module.Print,

  searchInit: module.Searching,
  initValid : (sendFunc, idForm, idSubmit) => module.valid.init(sendFunc, idForm, idSubmit),

  showMsg: (msg, type) => new module.MessageToast().show(msg, type),
};

window.f = Object.assign(c, m, f);
