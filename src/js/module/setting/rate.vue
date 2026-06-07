<template>
  <p-panel id="rateForm" class="col-12 col-md-6 mb-3 p-0" :header="$t('Exchange rates')">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <span>{{ $t('Auto-update') }}</span>
      <div class="d-inline-flex align-items-center gap-2">
        <span>{{ $t('No') }}</span>
        <p-switch v-model="autoRefresh" />
        <span>{{ $t('Yes') }}</span>
      </div>
    </div>

    <div v-if="autoRefresh" class="row g-3 mb-3">
      <div v-for="(label, key) of serverName" :key="key" class="col d-flex align-items-center gap-2">
        <p-radiobutton v-model="serverRefresh" :value="key" :input-id="'server' + key" />
        <label :for="'server' + key">{{ label }}</label>
      </div>
    </div>

    <div v-if="!autoRefresh" class="text-center">
      <p-button v-tooltip.bottom="$t('Edit rates')" icon="pi pi-sliders-h" severity="success"
                :label="$t('Edit')" @click="display = true" />
    </div>
  </p-panel>

  <p-dialog v-model:visible="display" :modal="true" :closable="false">
    <template #header>
      <h4>{{ $t('Currency rates') }}</h4>
    </template>

    <p-table :value="rate"
             class="w-100 text-center user-select-none"
             :rowClass="rowClass"
             :resizableColumns="true" columnResizeMode="fit" showGridlines
             :scrollable="true"
             editMode="cell"
             responsiveLayout="scroll"
             @cell-edit-complete="onEditComplete"
    >
      <p-t-column field="id" header="id" />
      <p-t-column field="code" :sortable="true" :header="$t('Code')">
        <template #editor="{data, field}">
          <p-input-text class="w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="name" :sortable="true" :header="$t('Name')">
        <template #editor="{data, field}">
          <p-input-text class="w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="scale" :header="$t('Nominal')">
        <template #editor="{data, field}">
          <p-input-text class="w-100" :disabled="autoRefresh" v-model.number="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="rate" :header="$t('Rate')">
        <template #editor="{data, field}">
          <p-input-text class="w-100" :disabled="autoRefresh" v-model.number="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="shortName" :header="$t('Symbol')">
        <template #editor="{data, field}">
          <p-input-text class="w-100" v-model="data[field]" />
        </template>
      </p-t-column>
      <p-t-column field="main" :header="$t('Main')">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <p-checkbox type="radio" name="main" :binary="true" v-model="slotProps.data.main"
                        @click="setMain(slotProps.data.id)" />
          </div>
        </template>
      </p-t-column>
      <p-t-column field="lastEditDate" :header="$t('Delete')">
        <template #body="slotProps">
          <p-button icon="pi pi-times" rounded text size="small"
                    @click="deleteRate(slotProps.data.id)" />
        </template>
      </p-t-column>
    </p-table>

    <template #footer>
      <div class="d-flex justify-content-between gap-2 w-100">
        <p-button severity="info" :label="$t('Add')" icon="pi pi-plus" @click="addRate()" />
        <p-button severity="success" :label="$t('Close')" icon="pi pi-check" @click="modalHide" />
      </div>
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
    setMain(id) {
      this.rate.forEach(rate => {
        if (rate.id !== id) rate.main = false;
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
        rateAutoRefresh  : this.autoRefresh,
        rateServerRefresh: this.serverRefresh,
      });
    },

    addRate() {
      this.rate.push({
        id  : 'new' + f.random(),
        code: '', name: '', shortName: '',
        scale: 1, rate : 1,
        main: false,
        lastEditDate: new Date().toLocaleString().slice(0, 10),
      });
    },
    deleteRate(id) {
      this.rate.forEach(i => {
        if (i.id === id) i.delete = i.delete !== undefined ? !i.delete : true;
      });
    },
    modalHide() {
      // Дождаться обновления компонентов v-model
      setTimeout(() => {
        this.display = false;

        if (this.changed) {
          f.showMsg('To apply the changes to the courses, click "Save"', 'warning');
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
