<template>
  <div class="col-6 border" id="rateForm">
    <h3 class="col-12 text-center">Курсы валют</h3>

    <div class="col-12 row">
      <p class="col-8">Автоматически обновлять курсы</p>
      <div class="col-4 d-inline-flex">
        <p class="col text-center">Нет</p>
        <p-switch v-model="rate.autoRefresh"></p-switch>
        <p class="col text-center">Да</p>
      </div>
    </div>

    <div v-if="!rate.autoRefresh" class="col-12 text-center mb-3">
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
             :bodyClass="'text-center'"
             :resizableColumns="true" columnResizeMode="fit" showGridlines
             :scrollable="true"
             editMode="cell"
             responsiveLayout="scroll"
             @cell-edit-complete="onEditComplete"
    >
      <p-t-column field="ID" header="ID"></p-t-column>
      <p-t-column field="code" :sortable="true" header="Код">
        <template #editor="{ data, field }">
          <p-input-text v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="name" :sortable="true" header="name">
        <template #editor="{ data, field }">
          <p-input-text v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="lastEditDate" header="Дата обновления">
        <template #editor="{ data, field }">
          <p-calendar v-model="data[field]"></p-calendar>
        </template>
      </p-t-column>
      <p-t-column field="rate" header="rate">
        <template #editor="{ data, field }">
          <p-input-number v-model.number="data[field]"></p-input-number>
        </template>
      </p-t-column>
      <p-t-column field="shortName" header="shortName">
        <template #editor="{ data, field }">
          <p-input-text v-model="data[field]"></p-input-text>
        </template>
      </p-t-column>
      <p-t-column field="main" header="Основная">
        <template #body="slotProps">
          <p-checkbox type="radio" name="main" :binary="true" v-model="slotProps.data.main"
                      @click="setMain(slotProps.data.ID)"
          ></p-checkbox>
        </template>
      </p-t-column>
    </p-table>

    <template #footer>
      <p-button label="Yes" icon="pi pi-check" @click="modalHide"></p-button>
    </template>
  </p-dialog>
</template>

<script>
export default {
  name: "rate",
  emits: ['update'],
  data: () => ({
    display: false,
    rate: {},
  }),
  methods: {
    loadData() {
      const node = f.qS('#dataRate');

      this.rate = node && node.value ? Object.values(JSON.parse(node.value)) : false;
      this.rate.forEach(rate => rate.main = rate.main === '1');

      node.remove();
    },

    setMain(ID) {
      this.rate.forEach(rate => {
        if (rate.ID !== ID) rate.main = false;
      });
    },

    modalHide() {
      this.display = false;
    },

    editRate() {
      this.display = true;
    },

    onEditComplete(event) {
      debugger
      let { data, newValue, field } = event;

      switch (field) {
        case 'code':
        case 'name':
          if (newValue) {
            data[field] = newValue;
          }
          else event.preventDefault();
          break;

        case 'lastEditDate':
          data[field] = newValue.toLocaleDateString('en-US');
          break;
        case 'rate':
          if (newValue > 0) data[field] = newValue;
          else event.preventDefault();
          break;
      }
    },
  },
  created() {
    this.loadData();

    this.$watch('rate', {
      deep: true,
      handler() {
        debugger;
      }
    });
  },
}
</script>
