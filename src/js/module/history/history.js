import {createApp} from 'vue';

import App from './HistoryApp.vue';
import Widget from './HistoryWidget.vue';

const applyAppSettings = (app) => {
  app.config.globalProperties.$t = function (id, ...params) {
    return window._ ? window._(id, ...params) : id;
  };
};

window.addEventListener("DOMContentLoaded", () => {
  const btnShowHistory = document.getElementById('btnShowHistory');
  const historyPageContainer = document.getElementById('historyPage');

  if (btnShowHistory && !btnShowHistory.dataset.vueInitialized) {
    btnShowHistory.dataset.vueInitialized = "true";

    const app = createApp(Widget);
    applyAppSettings(app);

    const widgetContainer = document.createElement('div');
    app.mount(widgetContainer);

    btnShowHistory.addEventListener('click', () => {
      window.dispatchEvent(new Event('open-history-widget'));
    });

  } else if (historyPageContainer && !historyPageContainer.dataset.vueInitialized) {
    historyPageContainer.dataset.vueInitialized = "true";

    const app = createApp(App);
    applyAppSettings(app);
    app.mount(historyPageContainer);
  }
});
