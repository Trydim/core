'use strict';

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

vue.mount('#dealerApp');
window.DealersInstance = vue;
