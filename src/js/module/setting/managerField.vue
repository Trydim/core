<template>
  <p-panel class="col-12 col-md-6 mb-3 p-0" id="managerForm" :header="$t('Manager')">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <span>{{ $t('Additional fields') }}</span>
      <p-button v-tooltip.bottom="$t('Add new field')" icon="pi pi-plus-circle" severity="success"
                @click="addField" />
    </div>

    <template v-for="(item, key) of managerFields" :key="key">
      <p-input-group class="mb-1 py-0">
        <p-input-text class="py-0" v-model="item.code" />
        <p-input-text class="py-0" v-model="item.name" />
        <p-select class="py-0" :options="managerFieldTypes"
                  option-value="id" option-label="name"
                  v-model="item.type" />
        <p-button class="py-0" v-tooltip.bottom="$t('Delete field')" icon="pi pi-times" severity="danger"
                  @click="removeField(key)" />
      </p-input-group>
      <p-input-group v-if="item.type === 'list'" class="mb-1">
        <template v-for="(option, index) of item.options" :key="index">
          <p-input-text class="col" v-model="item.options[index]" />
          <p-button v-tooltip.bottom="$t('Add option')" icon="pi pi-plus-circle" severity="success"
                    @click="addOption(item, index)" />
          <p-button v-tooltip.bottom="$t('Delete option')" icon="pi pi-times" severity="danger"
                    @click="removeOption(item, index)" />
        </template>
      </p-input-group>
      <p-input-group v-if="item.type === 'csvTable'" class="mb-1 py-0">
        <p-select :title="$t('Csv tables')"
                  :loading="loadingTable"
                  :options="csvTable"
                  option-value="filename" option-label="name"
                  v-model="item.options.table" />
        <p-input-text v-tooltip.bottom="$t('Column for save')" v-model="item.options.saveKey" />
        <p-input-text v-tooltip.bottom="$t('Column for show')" v-model="item.options.showKey" />
        <p-input-group-addon class="gap-1 py-0">
          <p-checkbox :input-id="'multiselect-' + key" binary v-model="item.options.multiselect" />
          <label :for="'multiselect-' + key">{{ $t('Multiselect') }}</label>
        </p-input-group-addon>
      </p-input-group>
    </template>
  </p-panel>
</template>

<script>

const prepareCsvList = (data, path = '') => {
  return Object.entries(data).reduce((r, [k, v]) => {
    if (isFinite(+k)) r.push({ filename: path + v.fileName, name: v.name });
    else r = r.concat(prepareCsvList(v, k + '/' + path));
    return r;
  }, []);
};

export default {
  props: {
    propFields: {
      required: true,
      type: Object,
    },
  },
  emits: ['update'],
  data: () => ({
    managerFields: {},

    managerFieldTypes: [
      {id: 'text',     name: _('Text (~200 characters)')},
      {id: 'textarea', name: _('Text (long)')},
      {id: 'number',   name: _('Number')},
      {id: 'checkbox', name: _('Yes/No')},
      {id: 'date',     name: _('Date')},
      {id: 'list',     name: _('List')},
      {id: 'csvTable', name: _('Table')},
    ],

    loadingTable: true,
    csvTable: [],
  }),
  watch: {
    managerFields: {
      deep: true,
      handler() {
        this.checkListType();
        this['$emit']('update', this.getFields());
      },
    },
  },
  methods: {
    getFields() {
      return Object.values(this.managerFields).reduce((r, field) => {
        r[field.code] = field;
        return r;
      }, {});
    },

    loadCsv(field) {
      return f.Get({data: 'mode=DB&cmsAction=tables'}).then(d => {
        if (d.status) {
          this.csvTable = prepareCsvList(d['csvFiles']);
          if (!field.options.table) field.options.table = this.csvTable[0].filename;
        }

        this.loadingTable = false;
      });
    },
    checkListType() {
      Object.values(this.managerFields).forEach(field => {
        if (field.type === 'list' && field.options.length === 0) field.options = ['Option1'];
        else if (field.type === 'csvTable') {
          if (!field.options.saveKey) field.options = {saveKey: 'id', showKey: 'name'};

          if (this.csvTable.length === 0) this.loadCsv(field);
          if (!field.options.table) field.options.table = this.csvTable[0].filename;
          if (field.options.multiselect === undefined) field.options.multiselect = false;
        }
      });
    },

    addField() {
      const rand = 'cf' + ((Math.random() * 1e8) | 0);
      this.managerFields[rand] = {code: _('Code') + rand, name: _('Field') + '-' + rand, type: 'text'};
    },
    removeField(id) {
      delete this.managerFields[id];
    },

    addOption(field, index) { field.options.splice(index, 0, 'Option' + (index + 1)) },
    removeOption(field, index) { f.arrRemoveItem(field.options, index) },
  },
  created() {
    this.managerFields = this.propFields;
  },
}
</script>
