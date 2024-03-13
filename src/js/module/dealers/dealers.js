'use strict';

import '../../../css/module/admindb/handsontable.min.css';
import '../../libs/handsontable.full.min';

import { createApp } from 'vue';
import App from "./App.vue";

import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

const vue = createApp(App);

vue.config.errorHandler = (err, vm, info) => {
  debugger
  console.error(err, 'error', false);
  console.error(info, 'error', false);
}

// Перевод
vue.config.globalProperties.$t = function (str) { return window._(str); };

document.addEventListener("DOMContentLoaded", () => {
  const app = f.gI('dealerApp');

  if (app) {
    vue.use(PrimeVue);
    vue.directive('tooltip', Tooltip);

    window.DealersInstance = vue;
    // Delay for hooks
    setTimeout(() => vue.mount(app), 0);
  } else {
    const form = f.gI('editDb'),
          report = f.gI('reportArea');

    form.onsubmit = function (e) {
      e.preventDefault();

      f.Post({data: new FormData(form)}).then(d => {
        if (d.status) {
          const r = d['report'];

          report.innerHTML =
            r['error'].join('<br>') + '<br>' + r['error'].length + '<br><br>'
            + r['complete'].join('<br>') + '<br>' + r['complete'].length;
        }
      });
    }
  }
});
