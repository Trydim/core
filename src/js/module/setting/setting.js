'use strict';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';

// Import libraries
// ---------------------------------------------------------------------------------------------------------------------
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';

// Import components
// ---------------------------------------------------------------------------------------------------------------------
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Image from 'primevue/image';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import InputSwitch from 'primevue/inputswitch';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
//import ToggleButton from 'primevue/togglebutton';
//import MultiSelect from 'primevue/multiselect';
//import TreeSelect from 'primevue/treeselect';
//import FileUpload from 'primevue/fileupload';

// Custom components
// ---------------------------------------------------------------------------------------------------------------------
import PickList from './components/picklist.esm';
import Mail from "./mail.vue";
import UserFields from "./userField.vue";
import Permission from "./permission.vue";
import ManagerFields from "./managerField.vue";
import Rate from "./rate.vue";
import OrderStatus from "./orderStatus.vue";
import Properties from "./properties.vue";
import Other from "./other.vue";

// Import Directives
// ---------------------------------------------------------------------------------------------------------------------
import Tooltip from 'primevue/tooltip';

// Import Modules
import App from './app';

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  debugger
  console.error(err, 'error', false);
  console.error(info, 'error', false);
}

app.config.globalProperties.$t = function (id) { return window._(id) }

document.addEventListener("DOMContentLoaded", () => {
  // Hook - beforeCreateApp
  f.HOOKS.beforeCreateApp({App});

  const node = f.gI('settingForm');

  app.use(PrimeVue);
  app.component('p-accordion', Accordion);
  app.component('p-accordion-tab', AccordionTab);
  app.component('p-button', Button);
  app.component('p-calendar', Calendar);
  app.component('p-checkbox', Checkbox);
  app.component('p-dialog', Dialog);
  app.component('p-image', Image);
  app.component('p-input-text', InputText);
  app.component('p-input-number', InputNumber);
  app.component('p-picklist', PickList);
  app.component('p-radiobutton', RadioButton);
  app.component('p-select', Dropdown);
  app.component('p-switch', InputSwitch);
  app.component('p-t-column', Column);
  app.component('p-table', DataTable);
  app.component('p-textarea', Textarea);
  //app.component('p-toggle-button', ToggleButton);
  //app.component('p-multi-select', MultiSelect);
  //app.component('p-tree-select', TreeSelect);
  //app.component('p-file', FileUpload);

  // Custom component
  app.component('setting-mail', Mail);
  app.component('setting-user', UserFields);
  app.component('setting-permission', Permission);
  app.component('setting-manager-field', ManagerFields);
  app.component('setting-rate', Rate);
  app.component('setting-order-status', OrderStatus);
  app.component('setting-properties', Properties);
  app.component('setting-other', Other);

  app.directive('tooltip', Tooltip);

  // Hook - beforeMounded
  f.HOOKS.beforeMoundedApp({vueApp: app, App, template: node});

  window.SettingsInstance = app;

  // Delay for hooks
  setTimeout(() => {
    const that = app.mount(node);

    f.HOOKS.afterMoundedApp({vueApp: app, App, that}); // Hook - afterMounded
  }, 0);
});
