<template>
  <div class="d-flex justify-content-between mb-3">
    <Button v-if="!false" type="button" class="btn btn-success" @click="addDealer">{{ $t('Add') }}</Button>
    <Button v-if="false" type="button" class="ms-auto btn btn-danger" @click="deleteDealer">{{ $t('Delete') }}</Button>
  </div>

  <DataTable v-if="dealers.length"
             :value="dealers" datakey="id"
             :loading="dealerLoading"
             show-gridlines
             selection-mode="single" :meta-key-selection="false"
             :paginator="dealers.length > 10" :rows="10" :rows-per-page-options="[10,20,50]"
             paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
             current-page-report-template="Showing {first} to {last} of {totalRecords}"
             responsive-layout="scroll"
             v-model:selection="selected"
             @dblclick="dblClick($event)">
    <!--<template #header>
      <p-multi-select :model-value="columnsSelected"
                      :options="columns"
                      option-label="name"
                      @update:model-value="onToggle"
                      placeholder="Настроить колонки" style="width: 20em"
      ></p-multi-select>
    </template>-->
    <Column v-if="checkColumn('id')" field="id" :sortable="true" :header="this.$t('id')" class="text-center">
      <template #body="slotProps">
        <span :data-id="slotProps.data.id">{{ slotProps.data.id }}</span>
      </template>
    </Column>
    <Column field="name" :sortable="true" :header="this.$t('Name')"></Column>
    <Column field="contacts" :sortable="false" :header="this.$t('Contacts')">
      <template #body="slotProps">
        <div v-if="slotProps.data.contacts.phone">{{ slotProps.data.contacts.phone }}</div>
        <div v-if="slotProps.data.contacts.email">{{ slotProps.data.contacts.email }}</div>
        <div v-if="slotProps.data.contacts.address">{{ slotProps.data.contacts.address }}</div>
      </template>
    </Column>
    <Column field="registerDate" :sortable="false" :header="this.$t('Register date')"></Column>
    <Column v-if="checkColumn('activity')" field="activity" :sortable="true" :header="this.$t('Activity')" class="text-center">
      <template #body="slotProps">
        <span v-if="!!+slotProps.data.activity" class="pi pi-check pi-green"></span>
        <span v-else class="pi pi-times pi-red"></span>
      </template>
    </Column>
    <Column field="settings" :sortable="false" :header="this.$t('Setting')">
      <template #body="slotProps">
        <template v-for="(value, key) of slotProps.data.settings" :key="key">
          <p v-if="getPropertyType(key) === 'bool'" class="m-0">
            {{ getPropertyName(key) }}: <i class="ms-2 pi fw-bold" :class="{'pi-green pi-plus': value, 'pi-red pi-times': !value}"></i>
          </p>
          <p v-else class="m-0 text-nowrap">
            {{ getPropertyName(key) }}: {{ getPropertyValue(key, value) }}
          </p>
        </template>
      </template>
    </Column>
  </DataTable>

  <div class="d-flex my-3">
    <Button type="button" class="btn btn-warning" @click="changeDealer">Редактировать</Button>
  </div>

  <Dialog v-model:visible="modal.display" :modal="true" :base-z-index="-100">
    <template #header>
      <h4>{{ modal.title }}</h4>
    </template>

    <div v-if="queryParam.dbAction !== 'deleteDealer'" class="row" style="min-width: 500px; max-width: 80vw">
      <div class="col-6">
        <!-- Наименование -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Название:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.name" autofocus></InputText>
        </div>
        <template v-if="queryParam.dbAction === 'addDealer'">
          <div class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5">Логин:</span>
            <InputText class="p-inputtext-sm" v-model="dealer.login" autofocus></InputText>
          </div>
          <div class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5">Пароль:</span>
            <InputText class="p-inputtext-sm" v-model="dealer.password" autofocus></InputText>
          </div>
        </template>
        <!-- Контакты номер -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Телефон:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.contacts.phone"></InputText>
        </div>
        <!-- Контакты почта -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Почта:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.contacts.email"></InputText>
        </div>
        <!-- Контакты адрес -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Адрес:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.contacts.address"></InputText>
        </div>
        <!-- Доступен -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Доступ:</span>
          <ToggleButton on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                        on-label="Активен" off-label="Неактивен"
                        v-model="dealer.activity"
          ></ToggleButton>
        </div>
      </div>

      <div class="col-6">
        <!--<Button label="Обновить" icon="pi pi-refresh" class="w-100 my-2"
          v-tooltip.bottom="'Обновить свойства'"
          @click="refreshProperties"
        ></Button>-->
        <div v-for="(prop, key) of properties" :key="key"
             class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">{{ prop.name }}</span>

          <InputText v-if="prop.type === 'text'" v-model="dealer.settings[key]"></InputText>
          <InputNumber v-else-if="prop.type === 'number'" :max-fraction-digits="10" v-model="dealer.settings[key]" @focus="this.value = ''"></InputNumber>
          <Textarea v-else-if="prop.type === 'textarea'" v-model="dealer.settings[key]" style="min-height: 42px"></Textarea>
          <ToggleButton v-else-if="prop.type === 'bool'" class="w-100"
                        on-icon="pi pi-check" off-icon="pi pi-times"
                        on-label="Да" off-label="Нет"
                        v-model="dealer.settings[key]"
          ></ToggleButton>
          <Calendar v-else-if="prop.type === 'date'" date-format="dd.mm.yy" v-model="dealer.settings[key]"></Calendar>
          <Dropdown v-else-if="prop.type === 'select'" option-label="name" option-value="ID"
                    :options="Object.values(prop.values)"
                    v-model="dealer.settings[key]"
          ></Dropdown>
          <MultiSelect v-else-if="prop.type === 'multiSelect'" option-label="name" option-value="ID"
                       :options="Object.values(prop.values)"
                       v-model="dealer.settings[key]"
          ></MultiSelect>
        </div>
      </div>

      <div class="col-12">
        <template v-for="(prop, key) of properties" :key="key">
          <property-table v-if="prop.type === 'table'" :prop="prop" :dealer="dealer"
                          @changed="changedTableProperty"
          ></property-table>
        </template>
      </div>
    </div>
    <div v-else>
      Удалить Дилера
    </div>

    <template #footer>
      <Button :label="this.$t('Confirm')" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="modalConfirm()"></Button>
      <Button :label="this.$t('Cancel')" icon="pi pi-times" class="p-button-text" @click="modalCancel()"></Button>
    </template>
  </Dialog>
</template>

<script>

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ToggleButton from 'primevue/togglebutton';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';

import cloneDeep from 'lodash/clonedeep';
import PropertyTable from "./propertyTable.vue";

export default {
  name: 'dealer',
  components: {
    Button, Checkbox, ToggleButton, InputText, InputNumber, Textarea, Calendar, Dropdown, MultiSelect,
    DataTable, Column,
    PropertyTable,
    Dialog,
  },
  data: () => ({
    dealers: [],
    selected: {},

    dealer: {
      id: undefined,
      name: undefined,
      contacts: {
        phone: undefined,
        email: undefined,
        address: undefined,
      },
      activity: undefined,
      settings: {},
    },
    dealersProperties: {},
    dealerLoading: false,

    reloadFn: undefined,
    queryParam: {
      mode: 'DB',
      dbTable: 'dealers',
      dbAction: undefined,
    },
    msg: {
      text: undefined,
      type: null,
    },

    modal: {
      display: false,
      title  : '',
      loading: false,
      confirmDisabled: true,
    },
  }),
  computed: {
    properties() {
      return Object.entries(this.dealersProperties).reduce((r, [code, p]) => {
        p.code = code; r[code] = p; return r;
      }, Object.create(null));
    },
  },
  watch: {
    dealer: {
      deep: true,
      handler() {
        this.modal.confirmDisabled = !this.dealer.name;
      },
    },
  },
  methods: {
    query() {
      const data = new FormData();
      this.dealerLoading = true;

      Object.entries(this.queryParam).forEach(([key, value]) => data.set(key, value.toString()));

      f.Post({data}).then(data => {
        if (this.reloadFn) {
          this.reloadFn(data);
          this.reloadFn = undefined;
          return;
        }

        this.setData('dealers', data);
        if (this.msg.text) {
          f.showMsg(this.msg.text, this.msg.type);
          this.msg.text = '';
        }
        this.dealerLoading = false;
      });
    },
    setData(dataKey, data) {
      if (dataKey === 'dealers') this.selected = {};

      if (data[dataKey] || data) this[dataKey] = data[dataKey] || data;
      else f.showMsg('Query set data error' + dataKey, 'error');
    },
    setModal(title, confirmDisabled) {
      this.$nextTick(() => {
        this.modal = {display: true, title, confirmDisabled};
      });
    },
    reload() {
      this.queryParam.dbAction = 'loadDealers';
      this.query();
    },

    changedTableProperty() { this.modal.confirmDisabled = !this.dealer.name; },

    checkColumn() { return true; },
    getPropertyName(k) { return this.properties[k] ? this.properties[k].name : k; },
    getPropertyType(k) { return this.properties[k] ? this.properties[k].type : k; },
    getPropertyValue(k, v) {
      v = v.toString();
      const res = this.properties[k] && this.properties[k].values && this.properties[k].values.filter(i => v.includes(i.id));

      return res ? res.map(i => i.name).join(', ') : v;
    },
    setProperty() {
      const de = this.dealer;
      de.settings = {};

      Object.values(this.dealersProperties).forEach(prop => {
        let v = 0,
            currentValue = de.settings[prop] ? de.settings[prop].value : null;

        if (prop.type === 'select') v = '1';
        else {
          switch (prop.type) {
            case 'text': case 'textarea': v = ''; break;
            case 'number': v = '0'; break;
            case 'date': v = new Date().getTime(); break;
            case 'bool': v = false; break;
          }
        }

        de.settings[prop.code] = currentValue || v;
      });
    },
    updateProperty() {
      const keys = Object.keys(this.properties);

      Object.keys(this.dealer.settings).forEach(key => {
        if (!keys.includes(key)) {
          f.showMsg('Свойство: ' + this.getPropertyName(key) + ' - будет удалено!', 'warning');
          delete this.dealer.settings[key];
        }
      });
    },

    addDealer() {
      this.queryParam.dbAction = 'addDealer';

      this.dealer = {
        name: '',
        contacts: {
          phone: '',
          email: '',
          address: '',
        },
        activity: true,
      };

      this.setProperty();
      this.setModal('Добавить дилера', true);
      this.reloadFn = this.reload;
    },
    changeDealer(id) {
      if (typeof id === 'number') this.selected = this.dealers.find(d => +d.id === id);
      if (!this.selected || !this.selected.name) { f.showMsg('Ничего не выбрано', 'error'); return; }

      this.queryParam.dbAction = 'changeDealer';
      this.dealer = cloneDeep(this.selected);
      this.dealer.activity = !!+this.dealer.activity;

      if (!this.dealer.settings) this.setProperty();
      else this.updateProperty();

      this.setModal('Настройка для дилера', true);
      this.reloadFn = this.reload;
    },
    refreshProperties() {
      this.setProperty();
    },
    deleteDealer() {
      if (!this.selected || !this.selected.name) { f.showMsg('Ничего не выбрано', 'error'); return;
      }
    },

    dblClick(e) {
      let tr = e.target.closest('tr'),
          n  = tr && tr.querySelector('[data-id]'),
          id = n && +n.dataset.id;
      id && this.changeDealer(id);
    },

    modalConfirm() {
      this.queryParam = {...this.queryParam, dealer: JSON.stringify(this.dealer)};
      this.query();
      this.modalCancel();
    },
    modalCancel() {
      this.modal.display = false;
    },
  },
  created() {
    // Set properties
    this.setData('dealersProperties', f.getData('#dataProperties'));

    // Load dealers second
    this.queryParam.mode     = 'DB';
    this.queryParam.dbAction = 'loadDealers';
    this.query();
  },
  mounted() { },
}

</script>
