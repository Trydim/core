"use strict";

import * as Vue from 'vue';

import {Main} from '../Main.js';

import App from './App.vue';

export class TableEditor extends Main {
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
    await this.dbAction('loadXmlConfig');
    this.contentData       = this.queryResult['XMLValues'];
    this.contentProperties = this.queryResult['XMLProperties'];

    this.setVueConfig();
    this.vueInit();
    this.loaderTable.stop();
  }

  setVueConfig() {
    this.directives = {};
    this.component = {};

    this.self = {
      install: app => app.config.globalProperties.$db = this,
    };
  }
  vueInit() {
    const vue = Vue.createApp(App);

    Object.entries(this.directives).forEach(([dName, param]) => {
      vue.directive(dName, param);
    });
    Object.entries(this.component).forEach(([component, param]) => {
      vue.component(component, param);
    });

    vue.config.errorHandler = (err, vm, info) => {
      debugger
      console.log(err);
      f.showMsg(err, 'error', false);
      // обработка ошибки
      // `info` — специфическая для Vue информация об ошибке,
      // например, в каком хуке жизненного цикла была найдена ошибка
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
    data.set('dbAction', 'saveXMLConfig');
    data.set('tableName', this.tableName);
    data.set('XMLConfig', JSON.stringify(this.contentData));

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
