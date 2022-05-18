<template>
  <div class="col-6 border" id="rateForm">
    <h3 class="col-12 text-center">Курсы валют</h3>

    <div class="col-12 row">
      <p class="col-8">Автоматически обновлять курсы</p>
      <div class="col-4 d-inline-flex">
        <p class="col text-center">Нет</p>
        <p-switch v-model="autoRefresh"></p-switch>
        <p class="col text-center">Да</p>
      </div>
    </div>

    <div v-if="autoRefresh" class="col-12 row mb-3">
      <div v-for="(label, key) of serverName" class="col-4 d-flex align-items-center">
        <p-radiobutton v-model="serverRefresh" :value="key" :id="'server' + key"></p-radiobutton>
        <label class="ms-1" :for="'server' + key">{{ label }}</label>
      </div>
    </div>

    <div v-if="!autoRefresh" class="col-12 text-center mb-3">
      <p-button v-tooltip.bottom="'Редактировать курсы'" icon="pi pi-sliders-h" class="p-button-success"
                label="Редактировать курсы"
                @click="editRate"
      ></p-button>
    </div>
  </div>

  <p-dialog v-model:visible="display" :modal="true">
    <template #header>
      <h4>Курсы валют</h4>
    </template>

    <p-table :value="rate"
             :class="'text-center user-select-none'"
             :rowClass="rowClass"
             :resizableColumns="true" columnResizeMode="fit" showGridlines
             :scrollable="true"
             editMode="cell"
             responsiveLayout="scroll"
             @cell-edit-complete="onEditComplete"
             style="width: 60vw; user-select: none;"
    >
      <p-t-column field="ID" header="ID"></p-t-column>
      <p-t-column field="code" :sortable="true" header="Код">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm" v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="name" :sortable="true" header="Название">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm" v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="scale" header="Номинал">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm" :disabled="autoRefresh" v-model.number="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="rate" header="Курс">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm" :disabled="autoRefresh" v-model.number="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="shortName" header="Обозначение">
        <template #editor="{data, field}">
          <p-input-text class="p-inputtext-sm" v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="main" header="Основная">
        <template #body="slotProps">
          <p-checkbox type="radio" class="mx-auto" name="main" :binary="true" v-model="slotProps.data.main"
                      @click="setMain(slotProps.data.ID)"
          ></p-checkbox>
        </template>
      </p-t-column>
      <p-t-column field="lastEditDate" header="Удалить">
        <template #body="slotProps">
          <p-button class="mx-auto p-button-rounded p-button-text p-button-sm" icon="pi pi-times" @click="deleteRate(slotProps.data.ID)"></p-button>
        </template>
      </p-t-column>
    </p-table>

    <template #footer>
      <p-button class="float-start p-button-success" label="Добавить" icon="pi pi-plus" @click="addRate()"></p-button>
      <p-button label="Закрыть" icon="pi pi-check" @click="modalHide"></p-button>
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

    autoRefresh: f['cmsSetting']['autoRefresh'] || false,
    serverRefresh: f['cmsSetting']['serverRefresh'] || 'RUS',

    display: false,
    rate: {},
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
      this.$nextTick(() => {
        let notMain = true;

        this.rate.forEach(rate => {
          if (rate.ID !== ID) rate.main = false;
          if (notMain && rate.main) notMain = false;
        });

        if (notMain) this.rate[0].main = true;
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
      this.$emit('update', {
        data: this.rate,
        autoRefresh: this.autoRefresh,
        serverRefresh: this.serverRefresh,
      });
    },

    modalHide() {
      this.display = false;
    },
    addRate() {
      const newRate = Object.entries(this.rate[0]).reduce((r, [k]) => {
        if (k === 'ID') r[k] = 'new';
        else if (k === 'lastEditDate') r[k] = new Date().toLocaleString().slice(0, 10);
        else r[k] = '';
        return r;
      }, {});

      this.rate.push(newRate);
    },
    editRate() {
      this.display = true;
    },
    deleteRate(id) {
      this.rate.forEach(i => {
        if (i.ID === id) i.delete = i.delete !== undefined ? !i.delete : true;
      });
    },
  },
  created() {
    this.loadData();

    this.$watch('rate', {
      deep: true,
      handler: this.update,
    });
  },
}
</script>
