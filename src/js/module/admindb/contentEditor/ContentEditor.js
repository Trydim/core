"use strict";

import './codeMirror/codemirror.css';
import './codeMirror/show-hint.css';

import { createApp } from 'vue';

import {Main} from '../Main.js';

import App from './App.vue';

export default class extends Main {
  constructor() {
    super();
    this.setInterface();
    this.showData();
    this.onEvent();
  }

  setInterface() {
    f.hide(this.viewsField);
  }

  async showData() {
    await this.dbAction('showTable');
    this.contentData = JSON.parse(this.queryResult['content']);

    this.setConfig();
    this.init();
    this.loaderTable.stop();
  }

  setConfig() {
    this.directives = {};
    this.component = {};

    this.self = {
      install: app => {
        app.config.globalProperties.$db = this

        app.config.globalProperties.$t = (id, ...params) => window._(id, ...params);
      },
    };
  }
  init() {
    const app = createApp(App);

    Object.entries(this.directives).forEach(([dName, param]) => {
      app.directive(dName, param);
    });
    Object.entries(this.component).forEach(([component, param]) => {
      app.component(component, param);
    });

    app.config.errorHandler = (err, vm, info) => {
      debugger
      console.log(err);
      f.showMsg(err, 'error', false);
      // обработка ошибки
      // `info` — специфическая информация об ошибке,
      // например, в каком хуке жизненного цикла была найдена ошибка
    }

    app.use(this.self);
    app.mount(this.mainNode);
  }

  // DB event function
  //--------------------------------------------------------------------------------------------------------------------

  save() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveTable');
    data.set('tableName', this.tableName);
    data.set('contentData', JSON.stringify(this.contentData));

    f.Post({data}).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      this.disableBtnSave();
    });
  }

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.addEventListener('click', () => this.save());
  }
}
