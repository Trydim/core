'use strict';

// Import libraries
// ---------------------------------------------------------------------------------------------------------------------
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Lara from '@primevue/themes/lara';

// Import components
// ---------------------------------------------------------------------------------------------------------------------
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import PickList from 'primevue/picklist';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import Select from 'primevue/select';
//import ToggleButton from 'primevue/togglebutton';
//import MultiSelect from 'primevue/multiselect';
//import TreeSelect from 'primevue/treeselect';
//import FileUpload from 'primevue/fileupload';

// Custom components
// ---------------------------------------------------------------------------------------------------------------------
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

  const node = f.gI('settingForm'),
        preset = definePreset(Lara, {
          semantic: {
            primary: {
              50: '{indigo.50}',
              100: '{indigo.100}',
              200: '{indigo.200}',
              300: '{indigo.300}',
              400: '{indigo.400}',
              500: '{indigo.500}',
              600: '{indigo.600}',
              700: '{indigo.700}',
              800: '{indigo.800}',
              900: '{indigo.900}',
              950: '{indigo.950}'
            }
          }
        });

  app.use(PrimeVue, {
    theme: {preset, options: {prefix: 'p', cssLayer: false}}
  });
  app.component('p-accordion', Accordion);
  app.component('p-accordion-panel', AccordionPanel);
  app.component('p-accordion-header', AccordionHeader);
  app.component('p-accordion-content', AccordionContent);
  app.component('p-button', Button);
  app.component('p-calendar', Calendar);
  app.component('p-checkbox', Checkbox);
  app.component('p-dialog', Dialog);
  app.component('p-image', Image);
  app.component('p-input-text', InputText);
  app.component('p-input-number', InputNumber);
  app.component('p-picklist', PickList);
  app.component('p-radiobutton', RadioButton);
  app.component('p-t-column', Column);
  app.component('p-table', DataTable);
  app.component('p-textarea', Textarea);
  app.component('p-switch', ToggleSwitch);
  app.component('p-select', Select);
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
