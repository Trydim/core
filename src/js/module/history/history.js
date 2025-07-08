import { createApp } from 'vue';
import App from './HistoryApp.vue';

const app = createApp(App)

app.config.globalProperties.$t = function(id, ...params) {
  return window._(id, ...params);
};

app.mount('#history-page');
