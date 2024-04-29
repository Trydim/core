<template>
  <div class="d-flex justify-content-between mb-3">
    <Button @click="addDealer">{{ $t('Add') }}</Button>
    <Button v-if="!false" @click="deleteDealer" class="p-button-danger">{{ $t('Delete') }}</Button>
  </div>

  <div class="col-4 flex justify-content-between mb-3 position-relative">
    <InputText class="w-100" :placeholder="this.$t('Keyword Search')" v-model="search"></InputText>
    <i class="position-absolute h-100 end-0 pi pi-search" style="padding: 16px"></i>
  </div>

  <DataTable v-if="filteredDealers.length"
             :value="filteredDealers" datakey="id"
             :loading="dealerLoading"
             show-gridlines
             selection-mode="single" :meta-key-selection="false"
             :paginator="filteredDealers.length > 10" :rows="10" :rows-per-page-options="[10,20,50]"
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
        <a target="_blank" :href="'../dealer/' + slotProps.data.id" :data-id="slotProps.data.id">{{ slotProps.data.id }}</a>
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
    <Column field="settings" :sortable="false" :header="this.$t('setting')">
      <template #body="slotProps">
        <template v-for="(value, key) of slotProps.data.settings" :key="key">
          <p v-if="getPropertyType(key) === 'bool'" class="m-0">
            {{ getPropertyName(key) }}: <i class="ms-2 pi fw-bold" :class="value ? 'pi-green pi-plus' : 'pi-red pi-times'"></i>
          </p>
          <TablePropertyValue v-else-if="getPropertyType(key) === 'table'"
                              :name="getPropertyName(key)" :value="value"
          ></TablePropertyValue>
          <p v-else class="m-0 text-nowrap">
            {{ getPropertyName(key) }}: {{ getPropertyValue(key, value) }}
          </p>
        </template>
      </template>
    </Column>
  </DataTable>

  <div class="d-flex gap-3 my-3">
    <Button class="btn-warning" @click="changeDealer">{{ $t('Edit dealer') }}</Button>
    <!--<Button class="btn-warning" @click="changeDealerUser">{{ $t('Edit dealer users') }}</Button>-->
  </div>

  <Dialog v-model:visible="modal.display" :modal="true" :base-z-index="-100">
    <template #header>
      <h4>{{ modal.title }}</h4>
    </template>

    <div v-if="queryParam.dbAction !== 'deleteDealer'" class="row" style="min-width: 500px; max-width: 80vw">
      <div class="col-6">
        <!-- Название -->
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Название:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.name" autofocus></InputText>
        </div>

        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Логин:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.login"></InputText>
        </div>
        <div class="p-inputgroup my-2">
          <span class="p-inputgroup-addon col-5">Пароль:</span>
          <InputText class="p-inputtext-sm" v-model="dealer.password"></InputText>
        </div>
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
        <template v-for="(prop, key) of properties" :key="key">
          <div v-if="prop.type !== 'table'" class="p-inputgroup my-2">
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
        </template>
      </div>

      <div class="col-12">
        <template v-for="(prop, key) of properties" :key="key">
          <PropertyTable v-if="prop.type === 'table'" :prop-key="key" :prop="prop" :dealer="dealer" @changed="changedTableProperty"
          ></PropertyTable>
        </template>
      </div>
    </div>
    <div v-else class="fw-bold">
      Последствия не обратимы!<br>Для продолжения наберите <span class="pi-red">{{ secureCode }}</span>!
      <div class="p-inputgroup my-2">
        <InputText class="p-inputtext-sm" v-model="inputSecureCode"></InputText>
      </div>
    </div>

    <template #footer>
      <Button :label="this.$t('Confirm')" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="modalConfirm"></Button>
      <Button :label="this.$t('Cancel')" icon="pi pi-times" class="p-button-text" @click="modalCancel"></Button>
    </template>
  </Dialog>
</template>

<script>

import 'primevue/resources/themes/saga-blue/theme.css';

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

import TablePropertyValue from './TablePropertyValue.vue';
import PropertyTable from "./PropertyTable.vue";

export default {
  name: 'dealer',
  components: {
    Button, Checkbox, ToggleButton, InputText, InputNumber, Textarea, Calendar, Dropdown, MultiSelect,
    DataTable, Column,
    TablePropertyValue, PropertyTable,
    Dialog,
  },
  data: () => ({
    search: '',

    secureCode: '0',
    inputSecureCode: '',

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
    properties() { return this.dealersProperties },

    filteredDealers() {
      if (this.search.length < 3) return this.dealers;

      let reg = new RegExp(this.search, 'i');

      return this.dealers.filter(dealer => reg.test(dealer.id + dealer.name));
    },
  },
  watch: {
    inputSecureCode() { this.modal.confirmDisabled = this.secureCode !== this.inputSecureCode },

    dealer: {
      deep: true,
      handler() {
        let d = this.dealer,
            valid = d.name.length > 2 ? 0b1 : 0b0;

        valid |= d.login ? 0b10 : 0b0;
        valid |= d.login && d.login.length > 2 ? 0b100 : 0b0;

        valid |= d.password ? 0b1000 : 0b0;
        valid |= d.password && d.password.length > 2 ? 0b10000 : 0b0;

        this.msg.text = valid === 0b11111 ? this.$t('Login and password changed!') : '';

        this.modal.confirmDisabled = !(valid === 0b11111 || valid === 0b1);
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

        if (data.status && this.msg.text) f.showMsg(this.msg.text, this.msg.type);
        this.msg.text = '';
        this.dealerLoading = false;
      });
    },
    setData(dataKey, data) {
      if (dataKey === 'dealers') this.selected = {};

      if (data[dataKey] || data) this[dataKey] = data[dataKey] || data;
      else f.showMsg('Query set data error' + dataKey, 'error');
    },
    setModal(title, confirmDisabled) {
      this.$nextTick(() => this.modal = {display: true, title, confirmDisabled});
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

      if (Object.keys(this.dealer.settings).length === 0) this.setProperty();
      else this.updateProperty();

      this.setModal('Настройка для дилера', true);
      this.reloadFn = this.reload;
    },
    changeDealerUser() {
      if (!this.selected || !this.selected.name) { f.showMsg('Ничего не выбрано', 'error'); return; }

      f.Get({data: {
        mode: 'DB',
        cmsAction: 'loadDealerUsers',
        dealerId: this.selected.id,
      }}).then(d => {
        if (d.status && d['dealerUsers']) {
          this.dealerUsers = d['dealerUsers'];
        }

        this.modal.loading = false;
      })
      this.queryParam.dbAction = 'update';
      this.queryParam.dealerId = this.selected.id;

      this.modal.loading = true;
      this.setModal('Пользователи дилера', true);
    },
    refreshProperties() { this.setProperty() },
    deleteDealer() {
      if (!this.selected || !this.selected.name) { f.showMsg('Ничего не выбрано', 'error'); return; }

      this.queryParam.dbAction = 'deleteDealer';
      this.dealer = cloneDeep(this.selected);

      this.secureCode = f.random(1000, 9999).toString();
      this.inputSecureCode = '';

      this.setModal('Удалить выбранных дилеров', true);
      this.reloadFn = this.reload;
      this.msg.text = `Дилер №${this.selected.id} - ${this.selected.name} удален!`;
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
    modalCancel() { this.modal.display = false },
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
