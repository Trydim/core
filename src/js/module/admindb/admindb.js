"use strict";

import {TableValues} from "./TableValues";
import {FormViews} from "./FormViews";
import {XMLTable} from "./XMLTable";
import ContentEditor from './contentEditor/ContentEditor';

/**
 * Erase template from ${}
 * @param tmpString
 * @return string
 */
const eraseTemplate = tmpString => tmpString.replace(/\$\{.+?\}/g, '');

/* Проверка файла перед добавлением (не знаю что хотел проверить)
 const checkAddedFile = function (e) {
 let input = e.target;
 if (!input.value.includes('csv')) {
 //return;
 }
 }*/

const admindb = {
  init() {
    this.onEvent();
    if (this.checkLoadContentEditor()) this.switchAdminType('content');
    else this.setDefault();
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
    switch (value) {
      case 'form':
        //f.hide(this.btnRefresh);
        //this.dbAction('loadFormConfig');
        //new FormViews();
        break;
      case 'table':
        //f.hide(this.btnRefresh);
        /*if (this.tableName === '') {
         f.Get({data: 'mode=load&dbAction=tables'})
         .then(data => this.showTablesName(data));
         } else {*/
        new TableValues();
        //}
        break;
      case 'config':
        /*f.show(this.btnRefresh);
        this.dbAction('loadXmlConfig');
        new XMLTable();*/
        break;
      case 'content':

        new ContentEditor();
        break;
    }
  },

  onEvent() {
    f.qA('input[data-action]').forEach(n => n.addEventListener('click', e => this.commonClick(e)));
  },
}

admindb.init();
