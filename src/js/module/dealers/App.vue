<template>
  <div class="d-flex justify-content-between mb-3">
    <Button type="button" class="btn btn-success" @click="addDealer">Добавить</Button>
    <Button type="button" class="ms-auto btn btn-danger" @click="delDealer">Удалить</Button>
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
             @dblclick="dblClick($event)"
             bodyClass="text-center">
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
    <Column field="contacts" :sortable="false" header="Contacts"></Column>
    <Column field="registerDate" :sortable="false" header="Register date"></Column>
    <Column v-if="checkColumn('activity')" field="activity" :sortable="true" header="Activity" class="text-center">
      <template #body="slotProps">
        <span v-if="!!+slotProps.data.activity" class="pi pi-check pi-green"></span>
        <span v-else class="pi pi-times pi-red"></span>
      </template>
    </Column>
  </DataTable>

  <div class="d-flex my-3">
    <Button type="button" class="btn btn-warning" @click="changeDealer">Изменить</Button>
    <Button type="button" class="ms-3 btn btn-warning" @click="setupDealer">Настроить</Button>
  </div>
</template>

<script>

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
//import ToggleButton from 'primevue/togglebutton';
//import Checkbox from 'primevue/checkbox';
//import InputText from 'primevue/inputtext';
//import Textarea from 'primevue/textarea';
//import InputNumber from 'primevue/inputnumber';
//import Dropdown from 'primevue/dropdown';
//import MultiSelect from 'primevue/multiselect';
//import TreeSelect from 'primevue/treeselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
//import Calendar from 'primevue/calendar';

export default {
  name: 'dealer',
  components: {
    Button,
    DataTable, Column,
    Dialog
  },
  data: () => ({
    dealers: [],
    selected: [],

    queryParam: {},
  }),
  computed: {

  },
  watch: {

  },
  methods: {
    query() {
      const data = new FormData();

      data.set('mode', 'DB');
      data.set('dbAction', 'addDealer');

      Object.entries(this.queryParam).forEach(([key, value]) => {
        data.set(key, value.toString());
      });

      f.Post({data}).then(data => {
      });
    },
    loadData() {
      this.dealers = f.getDataAsArray('#dealersData');
    },

    checkColumn() { return true; },

    addDealer() {

    },
    changeDealer() {},
    setupDealer() {},
    delDealer() {},

    dblClick(e) {

    }
  },
  created() {
    this.loadData();
  },
  mounted() {

  },
}

</script>

<style lang="scss"></style>
