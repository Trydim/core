"use strict";

import * as Vue from 'vue';

import {Main} from '../Main.js';

import App from './App.vue';

export class FormsTable extends Main {
  constructor() {
    super();
    this.setPageStyle();
    this.showData();
    this.onEvent();
  }

  setPageStyle() {
    document.body.style.overflow = 'auto';
  }

  async showData() {
    await this.dbAction('loadFormsTable');
    this.contentData       = this.queryResult['csvValues'];
    this.contentConfig     = this.queryResult['XMLValues'];
    this.contentProperties = this.queryResult['XMLProperties'];

    this.setVueConfig();
    this.vueInit();
    this.loaderTable.stop();
  }

  setVueConfig() {
    this.self = {
      install: app => app.config.globalProperties.$db = this,
    };
  }
  vueInit() {
    const vue = Vue.createApp(App);

    vue.config.errorHandler = (err) => {
      debugger
      console.log(err);
      f.showMsg(err, 'error', false);
    }

    vue.use(this.self);
    vue.mount(this.mainNode);
    this.vueApp = vue;
  }

  destroy() {
    this.vueApp.unmount();
    this.btnSave.onclick = undefined;
  }

  // DB event function
  //--------------------------------------------------------------------------------------------------------------------

  save() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveTable');
    data.set('tableName', this.tableName);
    data.set('csvData', JSON.stringify(this.contentData));

    f.Post({data}).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      this.disableBtnSave();
    });
  }

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.onclick = () => this.save();
  }
}
