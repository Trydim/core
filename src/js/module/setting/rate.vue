<template>
  <div class="col-12 col-md-6 border" id="rateForm">
    <h3 class="col-12 text-center">{{ $t('Exchange rates') }}</h3>

    <div class="col-12 row">
      <p class="col-8">{{ $t('Automatically update rates') }}</p>
      <div class="col-4 d-inline-flex">
        <p class="col mt-0 text-center">{{ $t('No') }}</p>
        <p-switch v-model="autoRefresh" />
        <p class="col mt-0 text-center">{{ $t('Yes') }}</p>
      </div>
    </div>

    <div v-if="autoRefresh" class="col-12 row mb-3">
      <div v-for="(label, key) of serverName" class="col-4 d-flex align-items-center">
        <p-radiobutton v-model="serverRefresh" :value="key" :id="'server' + key" />
        <label class="ms-1" :for="'server' + key">{{ label }}</label>
      </div>
    </div>

    <div v-if="!autoRefresh" class="col-12 text-center mb-3">
      <p-button v-tooltip.bottom="$t('Edit rates')" icon="pi pi-sliders-h" class="p-button-success"
                :label="$t('Edit')" @click="display = true" />
    </div>
  </div>

  <p-dialog v-model:visible="display" :modal="true" :closable="false">
    <template #header>
      <h4>{{$t('Currency rates')}}</h4>
    </template>

    <p-table :value="rate"
             class="text-center user-select-none"
             :rowClass="rowClass"
             :resizableColumns="true" columnResizeMode="fit" showGridlines
             :scrollable="true"
             editMode="cell"
             responsiveLayout="scroll"
             @cell-edit-complete="onEditComplete"
             style="width: 60vw"
    >
      <p-t-column field="ID" header="ID" style="width: 5%" />
      <p-t-column field="code" :sortable="true" :header="$t('Code')"  style="width: 10%" >
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="name" :sortable="true" :header="$t('Name')" style="width: 30%" >
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="scale" :header="$t('Nominal')" style="width: 10%" >
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm w-100" :disabled="autoRefresh" v-model.number="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="rate" :header="$t('Rate')" style="width: 20%" >
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm w-100" :disabled="autoRefresh" v-model.number="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="shortName" :header="$t('Symbol')" style="width: 10%">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="main" :header="$t('Main')" style="width: 10%">
        <template #body="slotProps">
          <p-checkbox type="radio" class="d-block mx-auto" name="main" :binary="true" v-model="slotProps.data.main"
                      @click="setMain(slotProps.data.ID)" />
        </template>
      </p-t-column>
      <p-t-column field="lastEditDate" :header="$t('Delete')">
        <template #body="slotProps">
          <p-button class="d-block mx-auto p-button-rounded p-button-text p-button-sm text-center" icon="pi pi-times"
                    @click="deleteRate(slotProps.data.ID)" />
        </template>
      </p-t-column>
    </p-table>

    <template #footer>
      <p-button class="p-button-info me-auto" :label="$t('Add')" icon="pi pi-plus" @click="addRate()" />
      <p-button class="p-button-success" :label="$t('Close')" icon="pi pi-check" @click="modalHide" />
    </template>
  </p-dialog>
</template>

<script>
export default {
  name: "rate",
  emits: ['update'],
  data: () => ({
    serverName: {
      BYN: 'ЦБ РБ',
      RUS: 'ЦБ РФ',
    },

    autoRefresh: f['CMS_SETTING']['autoRefresh'] || false,
    serverRefresh: f['CMS_SETTING']['serverRefresh'] || 'RUS',

    changed: false,
    display: false,
    rate: [],
  }),
  watch: {
    autoRefresh() { this.update(); },
    serverRefresh() { this.update(); },
  },
  methods: {
    loadData() {
      const node = f.qS('#dataRate');

      this.rate = node && node.value ? Object.values(JSON.parse(node.value)) : false;
      this.rate.forEach(rate => rate.main = rate.main === '1');

      node.remove();
    },
    rowClass(data) {
      return data.delete ? 'bg-danger' : '';
    },
    setMain(ID) {
      this.rate.forEach(rate => {
        if (rate.ID !== ID) rate.main = false;
      });
    },
    onEditComplete(event) {
      let {data, newValue, field} = event;

      switch (field) {
        case 'code':
        case 'name':
          if (newValue) data[field] = newValue;
          else event.preventDefault();
          break;
        case 'lastEditDate':
          data[field] = newValue.toLocaleDateString('en-US');
          break;
        case 'rate':
          if (newValue > 0) data[field] = newValue;
          else event.preventDefault();
          break;

        default: data[field] = newValue; break;
      }
    },
    update() {
      if (!this.changed) this.changed = true;

      console.log(this.rate);
      this.$emit('update', {
        data: this.rate,
        autoRefresh: this.autoRefresh,
        serverRefresh: this.serverRefresh,
      });
    },

    addRate() {
      this.rate.push({
        ID  : 'new' + f.random(),
        code: '', name: '', shortName: '',
        scale: 1, rate : 1,
        main: false,
        lastEditDate: new Date().toLocaleString().slice(0, 10),
      });
    },
    deleteRate(id) {
      this.rate.forEach(i => {
        if (i.ID === id) i.delete = i.delete !== undefined ? !i.delete : true;
      });
    },
    modalHide() {
      // Дождаться обновления компонентов v-model
      setTimeout(() => {
        this.display = false;

        if (this.changed) {
          f.showMsg(_('changing_rate_message_warning'), 'warning');
        }
      }, 100);
    },
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.$watch('rate', {
      deep: true,
      handler: this.update,
    });
  }
}
</script>
