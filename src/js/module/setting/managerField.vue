<template>
  <div class="col-6 border" id="managerForm">
    <h3 class="col-12 text-center">{{ $t('Manager settings') }}</h3>

    <div class="input-group my-3">
      <span class="input-group-text flex-grow-1">{{ $t('Additional fields for managers') }}</span>
      <p-button v-tooltip.bottom="this.$t('Add new field')" icon="pi pi-plus-circle" class="p-button-success"
                @click="addField"></p-button>
    </div>

    <template v-for="(item, key) of managerFields" :key="key">
      <div class="input-group mb-1">
        <p-input-text v-model="item.code" class="form-control"></p-input-text>
        <p-input-text v-model="item.name" class="form-control"></p-input-text>
        <p-select option-label="name" option-value="id"
                  :options="managerFieldTypes"
                  v-model="item.type"
                  class="col-5"
        ></p-select>
        <p-button v-tooltip.bottom="this.$t('Delete field')" icon="pi pi-times" class="p-button-danger"
                  @click="removeField(key)"></p-button>
      </div>
      <div v-if="item.type === 'list'" class="px-3">
        <div v-for="(option, index) of item.options" :key="index" class="input-group mb-1">
          <p-input-text v-model="item.options[index]" class="form-control"></p-input-text>
          <p-button v-tooltip.bottom="this.$t('Add option')" icon="pi pi-plus-circle" class="p-button-success"
                    @click="addOption(item, index)"></p-button>
          <p-button v-tooltip.bottom="this.$t('Delete option')" icon="pi pi-times" class="p-button-danger"
                    @click="removeOption(item, index)"></p-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>

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
      {id: 'text', name: _('Text (~200 characters)')},
      {id: 'textarea', name: _('Text (many)')},
      {id: 'number', name: _('Number')},
      {id: 'checkbox', name: _('Checkbox')},
      {id: 'date', name: _('Date')},
      {id: 'list', name: _('List')},
    ],
  }),
  methods: {
    getFields() {
      return Object.values(this.managerFields).reduce((r, field) => {
        r[field.code] = field;
        return r;
      }, {});
    },

    checkListType() {
      Object.values(this.managerFields).forEach(field => {
        if (field.type === 'list' && !field.options) field.options = ['Option1'];
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

    this.$watch('managerFields', {
      deep: true,
      handler() {
        this.checkListType();
        this['$emit']('update', this.getFields());
      },
    });
  },
}
</script>
