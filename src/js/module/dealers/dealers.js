'use strict';

import { createApp } from 'vue';
import App from "./App.vue";

(() => {
  const vue = createApp(App);

  vue.config.errorHandler = (err, vm, info) => {
    debugger
    console.error(err, 'error', false);
    console.error(info, 'error', false);
  }

  vue.mount('#dealerApp');
})();
