<template>
  <div class="col-12 col-md-6 border" id="managerForm">
    <h3 class="col-12 text-center">{{ $t('Manager') }}</h3>

    <div class="input-group my-3">
      <span class="input-group-text flex-grow-1">{{ $t('Additional fields') }}</span>
      <p-button v-tooltip.bottom="$t('Add new field')" icon="pi pi-plus-circle" class="p-button-success"
                @click="addField" />
    </div>

    <template v-for="(item, key) of managerFields" :key="key">
      <div class="input-group mb-1">
        <p-input-text v-model="item.code" class="form-control" />
        <p-input-text v-model="item.name" class="form-control" />
        <p-select class="col-5"
                  :options="managerFieldTypes"
                  option-value="id" option-label="name"
                  v-model="item.type" />
        <p-button v-tooltip.bottom="this.$t('Delete field')" icon="pi pi-times" class="p-button-danger"
                  @click="removeField(key)" />
      </div>
      <div v-if="item.type === 'list'" class="px-3">
        <div v-for="(option, index) of item.options" :key="index" class="input-group mb-1">
          <p-input-text v-model="item.options[index]" class="form-control" />
          <p-button v-tooltip.bottom="this.$t('Add option')" icon="pi pi-plus-circle" class="p-button-success"
                    @click="addOption(item, index)" />
          <p-button v-tooltip.bottom="this.$t('Delete option')" icon="pi pi-times" class="p-button-danger"
                    @click="removeOption(item, index)" />
        </div>
      </div>
      <div v-if="item.type === 'csvTable'" class="px-3">
        <div class="input-group mb-1">
          <p-select class="col-3"
                    :loading="loadingTable"
                    :options="csvTable"
                    option-value="fileName" option-label="name"
                    v-model="item.options.table" />
          <p-input-text class="col-3 form-control" v-tooltip.bottom="$t('Column for save')" v-model="item.options.saveKey" />
          <p-input-text class="col-3 form-control" v-tooltip.bottom="$t('Column for show')" v-model="item.options.showKey" />
          <div class="col-3 d-flex justify-content-center align-items-center gap-1">
            <label :for="'multiselect'">{{ $t('Multiselect') }}</label>
            <p-checkbox input-id="multiselect" binary v-model="item.options.multiselect" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>

const prepareCsvList = (data, path = '') => {
  return Object.entries(data).reduce((r, [k, v]) => {
    if (isFinite(+k)) r.push({ fileName: path + v.fileName, name: v.name });
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
      //{id: 'select',   name: _('Directory')},
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
          if (!field.options.table) field.options.table = this.csvTable[0].fileName;
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
          if (!field.options.table) field.options.table = this.csvTable[0].fileName;
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
