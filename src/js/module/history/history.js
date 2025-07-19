import { createApp } from 'vue';

import App from './HistoryApp.vue';
import Widget from './HistoryWidget.vue';

import './index.scss';

const applyAppSettings = (app) => {
  app.config.globalProperties.$t = function(id, ...params) {
    return window._(id, ...params);
  };
}


window.addEventListener("DOMContentLoaded", (e) => {
  const btnShowHistory = document.getElementById('btnShowHistory');

  if (btnShowHistory) {
    const app = createApp(Widget)

    applyAppSettings(app);

    const widgetContainer = document.createElement('div');
    app.mount(widgetContainer);

    btnShowHistory.addEventListener('click', () => {
      window.dispatchEvent(new Event('open-history-widget'));
    });

  } else {
    const app = createApp(App)

    applyAppSettings(app);

    app.mount('#history-page');
  }


});
