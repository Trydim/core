<template>
  <div class="col-12 col-md-6 border" id="statsForm">
    <h3 class="w-100 text-center">Внешний доступ (ключи)</h3>
    <div id="ordersStatusForm" class="col">
      <div class="input-group my-3">
        <span class="input-group-text flex-grow-1">Настройка статусов заказов</span>
        <button type="button" class="btn btn-outline-secondary" @click="addStatus()">
          <i class="pi pi-plus-circle align-text-bottom pi-green"></i>
        </button>
      </div>

      <div class="mb-3" style="max-height: 140px; overflow-y: auto">
        <template v-for="(item, index) of status" :key="item.ID">
          <div v-if="!item.delete" class="input-group mb-1">
            <p-input-text v-tooltip.bottom="'код (необязательно)'" class="form-control"
                          :disabled="+item.required" v-model="item.code" />
            <p-input-text v-model="item.name" class="form-control w-50" />
            <p-input-text v-tooltip.bottom="'сортировка'" v-model="item.sort" class="form-control" />
            <div class="input-group-text">
              <p-radiobutton v-tooltip.bottom="'По умолчанию'" v-model="statusDef" :value="item.ID" />
            </div>
            <p-button v-tooltip.bottom="'Удалить'" icon="pi pi-times" class="p-button-danger"
                      :disabled="+item.required"
                      @click="removeStatus(index)" />
          </div>
        </template>
      </div>
    </div>
  </div>
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
      if (!this.statusDef) this.statusDef = this.status[0].ID;

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
        ID: Math.random(),
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
