<template>
  <p-panel id="statsForm" class="col-12 col-md-6 mb-3 p-0" :header="$t('Statuses')">
    <div id="ordersStatusForm">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>{{ $t('Set order statuses') }}</span>
        <p-button v-tooltip.bottom="$t('Add')" icon="pi pi-plus-circle" severity="success" @click="addStatus()" />
      </div>

      <div class="overflow-auto">
        <template v-for="(item, index) of status" :key="item.id">
          <p-input-group v-if="!item.delete" class="align-items-center my-1">
            <p-input-text v-tooltip.bottom="$t('Code (optional)')"
                          :disabled="!!+item.required" v-model.trim="item.code" />
            <p-input-text v-model.trim="item.name" @blur="checkNames" />
            <p-input-text v-tooltip.bottom="$t('Sorting')" v-model="item.sort" />
            <p-input-group-addon>
              <p-radiobutton v-tooltip.bottom="$t('Default')" :value="item.id" v-model="statusDef" />
            </p-input-group-addon>
            <p-button v-tooltip.bottom="$t('Delete')" icon="pi pi-times" severity="danger"
                      :disabled="!!+item.required"
                      @click="removeStatus(index)" />
          </p-input-group>
        </template>
      </div>
    </div>
  </p-panel>
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
