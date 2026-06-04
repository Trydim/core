"use strict";

import {createApp} from 'vue';

import {Main} from '../Main.js';

import App from './App.vue';

export class FormsTable extends Main {
  constructor() {
    super();
    this.setPageStyle();
    void this.showData();
    this.onEvent();
  }

  setPageStyle() {
    document.body.style.overflow = 'auto';
  }

  async showData() {
    await this.dbAction('loadFormsTable');

    if (!this.queryResult) return;

    this.contentData       = this.queryResult['csvValues'];
    this.contentConfig     = this.queryResult['configValues'];
    this.contentProperties = this.queryResult['configProperties'];

    this.setConfig();
    this.init();
    this.loaderTable.stop();
  }

  setConfig() {
    this.self = {
      install: app => app.config.globalProperties.$db = this,
    };
  }
  init() {
    const app = createApp(App);

    app.config.errorHandler = (err) => {
      debugger
      console.log(err);
      f.showMsg(err, 'error', false);
    }

    app.use(this.self);
    app.mount(this.mainNode);
    this.vueApp = app;
  }

  destroy() {
    this.vueApp && this.vueApp.unmount();
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
      f.showMsg(data['status'] ? 'Saved' : 'An error occurred!');
      this.disableBtnSave();
    });
  }

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.onclick = () => this.save();
  }
}
