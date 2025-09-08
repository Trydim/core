<template>
  <div class="col-12 col-md-6 border" id="statsForm">
    <h3 class="w-100 text-center">{{ $t('Statuses') }}</h3>
    <div id="ordersStatusForm" class="col">
      <div class="input-group my-3">
        <span class="input-group-text flex-grow-1">{{ $t('Set order statuses') }}</span>
        <button type="button" class="btn btn-outline-secondary" @click="addStatus()">
          <i class="pi pi-plus-circle align-text-bottom pi-green"></i>
        </button>
      </div>

      <div class="mb-3" style="max-height: 140px; overflow-y: auto">
        <template v-for="(item, index) of status" :key="item.ID">
          <div v-if="!item.delete" class="input-group mb-1">
            <p-input-text v-tooltip.bottom="$t('Code (optional)')" class="form-control"
                          :disabled="!!+item.required" v-model="item.code" />
            <p-input-text v-model="item.name" class="form-control w-50" @blur="checkNames" />
            <p-input-text v-tooltip.bottom="$t('Sorting')" v-model="item.sort" class="form-control" />
            <div class="input-group-text">
              <p-radiobutton v-tooltip.bottom="$t('Default')" v-model="statusDef" :value="item.ID" />
            </div>
            <p-button v-tooltip.bottom="$t('Delete')" icon="pi pi-times" class="p-button-danger"
                      :disabled="!!+item.required"
                      @click="removeStatus(index)" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

const toast = new f.Toast();

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
        ID: f.random(1e3, 1e4),
        code: 'status',
        name: 'Новый статус',
        sort: 50,
      });
    },
    removeStatus(index) {
      this.status[index].delete = true;
    },

    checkNames() {
      const names = new Set(),
            list = Object.values(this.status);

      list.forEach((item) => names.add(item.name));

      if (list.length !== names.size) toast.warning(_('This status name exists! It is highly recommended to use unique names.'));
      else toast.closeToasts();
    },
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
