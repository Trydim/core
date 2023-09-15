'use strict';

import '../../../css/module/admindb/handsontable.min.css';
import "../../libs/handsontable.full.min";

import { createApp } from 'vue';
import App from "./App.vue";

import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

const vue = createApp(App);
vue.use(PrimeVue);
vue.directive('tooltip', Tooltip);

vue.config.errorHandler = (err, vm, info) => {
  debugger
  console.error(err, 'error', false);
  console.error(info, 'error', false);
}

// Перевод
vue.config.globalProperties.$t = function (str) { return window._(str); };

vue.mount('#dealerApp');
window.DealersInstance = vue;
