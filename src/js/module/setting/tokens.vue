<template>
  <p-panel id="statsForm" class="col-12 col-md-6 mb-3 p-0" header="Внешний доступ (ключи)">
    <div id="ordersStatusForm">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
        <span>Настройка статусов заказов</span>
        <p-button v-tooltip.bottom="'Добавить'" icon="pi pi-plus-circle" severity="success" @click="addStatus()" />
      </div>

      <div class="overflow-auto">
        <template v-for="(item, index) of status" :key="item.id">
          <div v-if="!item.delete" class="row g-1 align-items-center mb-1">
            <p-input-text v-tooltip.bottom="'код (необязательно)'"
                          :disabled="+item.required" v-model="item.code" />
            <p-input-text v-model="item.name" />
            <p-input-text v-tooltip.bottom="'сортировка'" v-model="item.sort" />
            <div class="col-auto d-flex justify-content-center">
              <p-radiobutton v-tooltip.bottom="'По умолчанию'" v-model="statusDef" :value="item.id" />
            </div>
            <p-button v-tooltip.bottom="'Удалить'" icon="pi pi-times" severity="danger"
                      :disabled="+item.required"
                      @click="removeStatus(index)" />
          </div>
        </template>
      </div>
    </div>
  </p-panel>
</template>

<script>

export default {
  props: {
    propStatusDef: {
      required: true,
      type: Number,
    },
  },
  emits: ['update'],
  data: () => ({
    status: {},
    statusDef: undefined,
  }),

  methods: {
    loadData() {
      const node = f.qS('#dataOrdersStatus');

      this.status = node && node.value ? JSON.parse(node.value) : false;
      if (!this.statusDef) this.statusDef = this.status[0].id;

      node.remove();
    },

    emits() {
      this.$emit('update', {
        orderStatus: this.status,
        statusDefault: this.statusDef,
      });
    },

    addStatus() {
      this.status.push({
        id: Math.random(),
        code: 'status',
        name: 'Новый статус',
        sort: 50,
      });
    },
    removeStatus(index) {
      this.status[index].delete = true;
    }
  },
  created() {
    this.statusDef = this.propStatusDef.toString();
    this.loadData();

    this.$watch('status', {
      deep: true,
      handler() { this.emits() },
    });

    this.$watch('statusDef', () => this.emits());
  },
}

</script>
