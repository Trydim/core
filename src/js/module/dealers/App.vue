<template>
  <div class="d-flex justify-content-between mb-3">
    <Button v-if="false" type="button" class="btn btn-success" @click="addDealer">Добавить</Button>
    <Button v-if="false" type="button" class="ms-auto btn btn-danger" @click="delDealer">Удалить</Button>
  </div>

  <DataTable v-if="dealers.length"
             :value="dealers" datakey="id"
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
    <Column v-if="checkColumn('id')" field="id" :sortable="true" header="id" class="text-center">
      <template #body="slotProps">
        <span :data-id="slotProps.data.id">{{ slotProps.data.id }}</span>
      </template>
    </Column>
    <Column field="name" :sortable="true" header="Name"></Column>
    <Column field="contacts" :sortable="false" header="Contacts">
      <template #body="slotProps">
        <div v-if="slotProps.data.contacts.phone">{{ slotProps.data.contacts.phone }}</div>
        <div v-if="slotProps.data.contacts.email">{{ slotProps.data.contacts.email }}</div>
        <div v-if="slotProps.data.contacts.address">{{ slotProps.data.contacts.address }}</div>
      </template>
    </Column>
    <Column field="registerDate" :sortable="false" header="Register date"></Column>
    <Column v-if="checkColumn('activity')" field="activity" :sortable="true" header="Activity" class="text-center">
      <template #body="slotProps">
        <span v-if="!!+slotProps.data.activity" class="pi pi-check pi-green"></span>
        <span v-else class="pi pi-times pi-red"></span>
      </template>
    </Column>
    <Column field="settings" :sortable="false" header="Settings">
      <template #body="slotProps">
        <div v-for="(setting, key) of slotProps.data.settings" :key="key">
          {{ setting.name }}: {{ setting.value }}
        </div>
      </template>
    </Column>
  </DataTable>

  <div class="d-flex my-3">
    <Button v-if="false" type="button" class="btn btn-warning" @click="changeDealer">Изменить</Button>
    <Button type="button" class="ms-3 btn btn-warning" @click="setupDealer">Настроить</Button>
  </div>

  <Dialog v-model:visible="modal.display" :modal="true">
    <template #header>
      <h4>{{ modal.title }}</h4>
    </template>

    <div v-if="queryParam.dbAction === 'changeDealer'" style="min-width: 500px">
      <!-- Тип элемента -->
      <div class="p-inputgroup my-2">
        <span class="p-inputgroup-addon col-5">Название:</span>
        <!--<input-text v-model="dealer.name" @input="dealerNameInput()" autofocus></input-text>-->
      </div>
      <!-- Имя элемента -->
      <div class="p-inputgroup my-2">
        <span class="p-inputgroup-addon col-5">Контакты:</span>
        <!--<p-input-text v-model="dealer.c" @input="dealerNameInput()" autofocus></p-input-text>-->
      </div>
      <!-- Доступен -->
      <div class="p-inputgroup my-2">
        <span class="p-inputgroup-addon col-5">Доступ:</span>
        <ToggleButton on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                      on-label="Активен" off-label="Неактивен"
                      v-model="modal.activity"
        ></ToggleButton>
      </div>
    </div>
    <div v-else-if="queryParam.dbAction === 'setupDealer'">
      <div v-for="(setting, key) of this.dealer.settings" :key="key"
           class="p-inputgroup my-2">
        <span class="p-inputgroup-addon col-5">{{ setting.name }}</span>
        <InputNumber v-model="setting.value" autofocus
                     @focus="this.value = ''"
                     @input="modal.confirmDisabled = false"
        ></InputNumber>
      </div>
    </div>
    <div v-else>
      Удалить Дилера
    </div>

    <template #footer>
      <Button label="Подтвердить" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="modalConfirm()"></Button>
      <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="modalCancel()"></Button>
    </template>
  </Dialog>
</template>

<script>

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
//import Checkbox from 'primevue/checkbox';
//import InputText from 'primevue/inputtext';
//import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
//import Dropdown from 'primevue/dropdown';
//import MultiSelect from 'primevue/multiselect';
//import TreeSelect from 'primevue/treeselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
//import Calendar from 'primevue/calendar';

export default {
  name: 'dealer',
  components: {
    Button, ToggleButton, InputNumber,
    DataTable, Column,
    Dialog
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

    reloadFn: undefined,
    queryParam: {
      dbTable: 'dealers',
      dbAction: 'loadDealers',
    },
    msg: {
      text: undefined,
      type: null,
    },

    modal: {
      display        : false,
      confirmDisabled: true,
      title          : '',
      loading        : false,
    },
  }),
  computed: {
  },
  watch: {
    /*dealer: {
      deep: true,
      handler() {
        this.modal.confirmDisabled = false;
      },
    }*/
  },
  methods: {
    query() {
      const data = new FormData();
      data.set('mode', 'DB');

      Object.entries(this.queryParam).forEach(([key, value]) => data.set(key, value.toString()));

      f.Post({data}).then(data => {
        if (this.reloadFn) {
          this.reloadFn();
          this.reloadFn = () => {};
          return;
        }

        data['dealers'] && this.setData(data['dealers']);
        if (this.msg.text) {
          f.showMsg(this.msg.text, this.msg.type);
          this.msg.text = '';
        }
      });
    },
    setData(data) {
      this.dealers = data;
      this.selected = {};
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

    checkColumn() { return true; },

    addDealer() {
      this.queryParam.dbAction = 'addDealer';
      //this.reloadAction = this.reload;
      this.query();
    },
    changeDealer() {},
    setupDealer() {
      if (!this.selected.name) { f.showMsg('Ничего не выбрано', 'error'); return; }
      const el = this.dealer = this.selected;

      this.queryParam.dbAction = 'setupDealer';

      /*временно*/
      if (!el.settings.margin) {
        this.dealer.settings.margin = {
          name: 'Наценка, %',
          type: 'number',
          value: 0,
        };
      }

      this.setModal('Настройка для дилера', true);
      this.reloadAction = this.reload;
    },
    delDealer() {},

    dblClick(e) {
      let tr = e.target.closest('tr'),
          n  = tr && tr.querySelector('[data-id]'),
          id = n && +n.dataset.id;
      id && this.setupDealer(id);
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
    this.query();
  },
  mounted() {

  },
}

</script>

<style lang="scss"></style>
