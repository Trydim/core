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
import FloatLabel from 'primevue/floatlabel';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Panel from 'primevue/panel';

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

const applySettingCompactOverrides = () => {
  if (document.getElementById('settingPrimeCompactStyle')) return;

  const style = document.createElement('style');
  style.id = 'settingPrimeCompactStyle';
  style.textContent = `
    #settingForm .p-inputtext:not(.p-floatlabel .p-inputtext),
    #settingForm .p-textarea:not(.p-floatlabel .p-textarea) {
      --p-inputtext-padding-x: 0.625rem;
      --p-inputtext-padding-y: 0.4rem;
    }
  `;
  document.head.appendChild(style);
};

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
            list: {
              option: {
                padding: '0.4rem 0.625rem',
              },
              optionGroup: {
                padding: '0.4rem 0.625rem',
              }
            }
          },
          components: {
            panel: {
              header: {
                padding: '0.5rem 1rem',
              },
              toggleableHeader: {
                padding: '0.25rem 1rem',
              },
              content: {
                padding: '0.75rem',
              },
              footer: {
                padding: '0.5rem',
              }
            },
            accordion: {
              header: {
                padding: '0.5rem',
              }
            },
            datatable: {
              header: {
                cell: {
                  padding: '0.5rem',
                }
              }
            },
            inputgroup: {
              addon: {
                padding: '0.625rem 0.5rem',
                minWidth: '2.25rem',
              }
            },
            button: {
              root: {
                paddingX: '6.5px',
                paddingY: '6.5px',
                iconOnlyWidth: '2.25rem',
              }
            },
            select: {
              root: {
                paddingX: '0.5rem',
                paddingY: '0.3rem',
              },
              dropdown: {
                width: '2rem',
              }
            },
            checkbox: {
              root: {
                width: '1.05rem',
                height: '1.05rem',
              },
              icon: {
                size: '0.75rem',
              }
            },
            radiobutton: {
              root: {
                width: '1.05rem',
                height: '1.05rem',
              },
              icon: {
                size: '0.8rem',
              }
            },
            picklist: {
              root: {
                gap: '0.75rem',
              },
              controls: {
                gap: '0.35rem',
              }
            },
            toggleswitch: {
              root: {
                width: '2.375rem',
                height: '1.25rem',
                handle: {
                  size: '1rem',
                },
              },
            },
          },
        });

  app.use(PrimeVue, {
    theme: {preset, options: {prefix: 'p', cssLayer: false}},
    locale: {emptyMessage: ''},
  });
  applySettingCompactOverrides();
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
  app.component('p-float-label', FloatLabel);
  app.component('p-input-group', InputGroup);
  app.component('p-input-group-addon', InputGroupAddon);
  app.component('p-panel', Panel);

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
