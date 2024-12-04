"use strict";

import '../../../css/module/admindb/admindb.scss';

import {FormsTable} from "./formEditor/FormsTable";
import {CsvValues} from "./csvEditor/CsvValues";
import {TableEditor} from "./tableEditor/TableEditor.js";
import ContentEditor from './contentEditor/ContentEditor';
import localStorage from "../../components/LocalStorage";

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

const storage = new f.LocalStorage();

const adminDb = {
  init() {
    this.onEvent();
    if (this.checkLoadContentEditor()) this.switchAdminType('content');
    else this.setTableMode();

    return this;
  },
  setTableMode() {
    const mode = storage.get('tableMode');

    setTimeout(() => {
      if (mode) f.qS(`input[value="${mode}"]`).click();
      else f.qS('input[data-action]:checked').click();
    }, 0);
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
    storage.set('tableMode', value);
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
