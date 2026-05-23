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
        <template v-for="(item, index) of status" :key="item.id">
          <div v-if="!item.delete" class="input-group mb-1">
            <p-input-text class="form-control" v-tooltip.bottom="$t('Code (optional)')"
                          :disabled="!!+item.required" v-model.trim="item.code" />
            <p-input-text class="form-control w-50" v-model.trim="item.name" @blur="checkNames" />
            <p-input-text class="form-control" v-tooltip.bottom="$t('Sorting')" v-model="item.sort" />
            <div class="input-group-text">
              <p-radiobutton v-tooltip.bottom="$t('Default')" :value="item.id" v-model="statusDef" />
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
    statusList: {
      required: true,
      type: Object,
    },
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
  watch: {
    statusList() {
      if (Object.values(this.statusList).length) this.setList(this.statusList);
    },
  },
  methods: {
    setList(list) {
      this.status = Object.values(list);
    },
    loadData() {
      const node = f.qS('#dataOrdersStatus');

      if (node && node.value) this.setList(JSON.parse(node.value));
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
        id  : Math.random(),
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
