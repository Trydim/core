"use strict";

import '../../../css/module/admindb/admindb.scss';

import {FormsTable} from "./formEditor/FormsTable";
import {CsvValues} from "./CsvValues";
import {TableEditor} from "./tableEditor/TableEditor.js";
import ContentEditor from './contentEditor/ContentEditor';

/**
 * Erase template from ${}
 * @param tmpString
 * @return string
 */
//const eraseTemplate = tmpString => tmpString.replace(/\$\{.+?\}/g, '');

/* Проверка файла перед добавлением (не знаю что хотел проверить)
const checkAddedFile = function (e) {
  let input = e.target;
  if (!input.value.includes('csv')) return;
}*/

const adminDb = {
  init() {
    this.onEvent();
    if (this.checkLoadContentEditor()) this.switchAdminType('content');
    else this.setDefault();

    return this;
  },
  setDefault() {
    setTimeout(() => f.qS('input[data-action]:checked').click(), 0);
  },

  checkLoadContentEditor() {
    return new URLSearchParams(location.search).get('tableName').includes('content-js');
  },

  commonClick(e) {
    let target = e.target,
        action = target.dataset.action;

    let select = {
      'adminType': () => this.switchAdminType(target.value),
    }

    select[action] && select[action]();
  },
  switchAdminType(value) {
    this.adminType && this.adminType.destroy();

    switch (value) {
      case 'form':    this.adminType = new FormsTable();    break;
      case 'table':   this.adminType = new CsvValues();     break;
        /*
         f.Get({data: 'mode=load&dbAction=tables'})
         .then(data => this.showTablesName(data));
        */
      case 'config':  this.adminType = new TableEditor();   break;
      case 'content': this.adminType = new ContentEditor(); break;
    }
  },

  onEvent() {
    f.qA('input[data-action]').forEach(n => n.addEventListener('click', e => this.commonClick(e)));
  },
}

document.addEventListener("DOMContentLoaded", () => {
  window.AdminDbInstance = adminDb;
  // Delay for hooks
  setTimeout(() => adminDb.init(), 0);
});
