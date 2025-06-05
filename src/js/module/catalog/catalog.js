'use strict';

// Import libraries
// ---------------------------------------------------------------------------------------------------------------------
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Lara from '@primevue/themes/lara';

// Import components
// ---------------------------------------------------------------------------------------------------------------------
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Image from 'primevue/image';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import ToggleButton from 'primevue/togglebutton';
import Textarea from 'primevue/textarea';
import TreeSelect from 'primevue/treeselect';
//import FileUpload from 'primevue/fileupload';

// Import Directives
// ---------------------------------------------------------------------------------------------------------------------
import Tooltip from 'primevue/tooltip';

import App from './app';

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  debugger
  console.error(err, 'error', false);
  console.error(info, 'error', false);
}

app.config.globalProperties.$t = function (id) { return window._(id) }

document.addEventListener("DOMContentLoaded", () => {
  const preset = definePreset(Lara, {
          root: {
            inputtextFocusBorderColor: 'transparent',
          },
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
            },
          }
        });

  app.use(PrimeVue, {
    theme: {preset, options: {prefix: 'p', cssLayer: false}},
    locale: {emptyMessage: ''},
  });
  app.component('p-button', Button);
  app.component('p-calendar', Calendar);
  app.component('p-checkbox', Checkbox);
  app.component('p-dialog', Dialog);
  app.component('p-input-text', InputText);
  app.component('p-input-number', InputNumber);
  app.component('p-image', Image);
  app.component('p-multi-select', MultiSelect);
  app.component('p-table', DataTable);
  app.component('p-t-column', Column);
  app.component('p-textarea', Textarea);
  app.component('p-toggle-button', ToggleButton);
  app.component('p-tree-select', TreeSelect);
  app.component('p-select', Dropdown);

  //app.component('p-file', FileUpload);

  app.directive('tooltip', Tooltip);

  window.CatalogInstance = app;

  // Delay for hooks
  setTimeout(() => app.mount('#catalogForm'), 0);
});
