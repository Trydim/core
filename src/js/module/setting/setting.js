'use strict';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';

import { createApp } from 'vue';
import PrimeVue from 'primevue/config';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
//import ToggleButton from 'primevue/togglebutton';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import TreeSelect from 'primevue/treeselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import FileUpload from 'primevue/fileupload';

import Image from 'primevue/image';

import PickList from './components/picklist.esm';

import Tooltip from 'primevue/tooltip';


import App from './app';

const app = createApp(App);
app.use(PrimeVue);
app.component('p-accordion', Accordion);
app.component('p-accordion-tab', AccordionTab);
app.component('p-dialog', Dialog);
app.component('p-button', Button);
app.component('p-switch', InputSwitch);
//app.component('p-toggle-button', ToggleButton);
app.component('p-checkbox', Checkbox);
app.component('p-input-text', InputText);
app.component('p-input-number', InputNumber);
app.component('p-select', Dropdown);
app.component('p-multi-select', MultiSelect);
app.component('p-tree-select', TreeSelect);
app.component('p-table', DataTable);
app.component('p-t-column', Column);
app.component('p-file', FileUpload);

app.component('p-picklist', PickList);

app.component('p-image', Image);

app.directive('tooltip', Tooltip);

app.config.errorHandler = (err, vm, info) => {
  debugger
  console.error(err, 'error', false);
  console.error(info, 'error', false);
}

app.mount('#settingForm');
