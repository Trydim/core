<template>
  <div id="propertiesWrap" class="px-0">
    <p-accordion @tabOpen="openAccordion()" value="-1">
      <p-accordion-panel value="0">
        <p-accordion-header>{{ accordionHeader }}</p-accordion-header>
        <p-accordion-content>
          <p-table v-if="propertiesData"
                   :value="propertiesData"
                   :loading="loading"
                   :resizable-columns="true" column-resize-mode="fit" show-gridlines
                   selection-mode="single" :meta-key-selection="false"
                   :scrollable="true"
                   responsive-layout="scroll"
                   v-model:selection="propertiesSelected"
                   @rowReorder="onRowReorder"
                   @dblclick="dblClickProperty($event)"
          >
            <p-t-column :rowReorder="true" :header="$t('Priority')" />
            <p-t-column field="name" :header="$t('Name')" />
            <p-t-column field="code" :header="$t('Code')">
              <template #body="slotProps">
                <span :data-code="slotProps.data.code">{{ slotProps.data.code }}</span>
              </template>
            </p-t-column>
            <p-t-column field="type" :header="$t('type')">
              <template #body="slotProps">
                {{ getTypeLang(slotProps.data.type) }}
              </template>
            </p-t-column>
          </p-table>

          <div class="my-3 text-center">
            <p-button v-tooltip.bottom="$t('Add')" icon="pi pi-plus-circle" severity="warn" class="mx-1"
                      :loading="loading" @click="createProperty" />
            <p-button v-tooltip.bottom="$t('Change')" icon="pi pi-cog" severity="warn" class="mx-1"
                      :loading="loading" @click="changeProperty" />
            <p-button v-tooltip.bottom="$t('Delete')" icon="pi pi-trash" severity="danger" class="mx-1"
                      :loading="loading" @click="deleteProperty" />
          </div>
        </p-accordion-content>
      </p-accordion-panel>
    </p-accordion>

    <p-dialog :base-z-index="10" :modal="true" v-model:visible="modal.display">
      <template #header>
        <h4>{{ modal.title }}</h4>
      </template>

      <div v-if="queryParam.cmsAction !== deleteAction" class="w-100" style="min-width: 450px;">
        <!-- Имя -->
        <div class="col-12 row align-items-center my-1">
          <div class="col-5">{{ $t('Property Name') }}:</div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newName" autofocus />
          </div>
        </div>
        <!-- Код свойства -->
        <div class="col-12 row align-items-center my-1">
          <div class="col-5">
            {{ $t('Property Code')}}:
            <i class="pi pi-tag ms-1" v-tooltip.bottom="$t('When changed, update the value for dealers')"></i>
          </div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newCode" />
          </div>
        </div>
        <!-- Тип данных -->
        <div class="col-12 row align-items-center my-1">
          <div class="col-5">{{ $t('Data type')}}:</div>
          <div class="col">
            <p-select class="w-100"
                      :options="propertiesTypes"
                      option-group-label="label" option-group-children="items"
                      option-value="id" option-label="name"
                      v-model="property.type" />
          </div>
        </div>
        <!-- Составной тип (справочники) -->
        <template v-if="typeIsSelect">
          <div class="col-12 row align-items-center mb-1">
            <div class="col-4">{{ $t('Additional fields of the property (there is a name)') }}:</div>
            <div class="col">
              <p-button v-tooltip.bottom="$t('Add field')" icon="pi pi-plus-circle" class="w-100" raised
                        :label="$t('Add field')"
                        @click="addPropertyField" />
            </div>
          </div>

          <div v-for="(field, key) of property.fields" class="row mb-1 align-items-center border" :key="key">
            <div class="col-5 text-center">
              <p-input-text class="w-100" v-model="field.newName" />
            </div>
            <div class="col-6">
              <p-select class="w-100"
                        :options="propertiesDataBaseTypes"
                        option-value="id" option-label="name"
                        v-model="field.type" />
            </div>
            <div class="col-1 text-center">
              <p-button v-tooltip.bottom="$t('Delete Field')" icon="pi pi-times" severity="danger"
                        @click="removePropertyField(key)" />
            </div>
          </div>
        </template>
        <template v-if="typeIsTable">
          <div class="col-12 row align-items-center mb-1">
            <div class="col-5">{{$t('Columns')}}:</div>
            <div class="col">
              <p-button v-tooltip.bottom="$t('Add column to the table')" icon="pi pi-plus-circle" class="w-100" raised
                        :label="$t('Add column')" @click="addTableColumn" />
            </div>
          </div>

          <div v-for="(field, index) of property.fields" class="col-12 row align-items-center mb-1" :key="index">
            <div class="col-4 flex-grow-1 p-0 text-center">
              <p-input-text class="w-100" v-model="property.fields[index]" />
            </div>
            <div v-if="property.fields.length > 1" class="col-1 m-0">
              <p-button v-tooltip.bottom="$t('Delete column')" icon="pi pi-times" severity="danger"
                        @click="removeTableColumn(index)" />
            </div>
          </div>
        </template>
      </div>
      <div v-else class="w-100">
        {{$t('Delete property')}}
      </div>

      <template #footer>
        <p-button :label="$t('Yes')" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="propertiesConfirm" />
        <p-button :label="$t('No')" icon="pi pi-times" text @click="propertiesCancel" />
      </template>
    </p-dialog>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      required: true,
      type: String,
    },
    query: {
      type: Function,
    },
    queryParam: {
      type: Object,
    }
  },
  emits: ['update'],
  data: () => ({
    propertiesData: [],
    propertiesSelected: [],

    property: {
      name: '',
      newName: '',
      code: '',
      newCode: '',
      type: '',
      fields: {},
    },

    loading: true,
    modal: {
      display: false,
      title: '',
      confirmDisabled: false,
    },
    propertiesTypes: [
      {
        label: _('Simple'),
        items: [
          {id: 'text',     name: _('Text (~200 characters)')},
          {id: 'textarea', name: _('Text (long)')},
          {id: 'number',   name: _('Number')},
          {id: 'bool',     name: _('Yes/No')},
          {id: 'date',     name: _('Date')},
        ]
      },
      {
        label: _('Composite'),
        items: [
          {id: 'select',      name: _('Reference')},
          {id: 'multiSelect', name: _('Multiple reference')},
          {id: 'table',       name: _('Table')},
        ]
      }
    ],
    propertiesDataBaseTypes: [
      {id: 'text',     name: _('Text (~200 characters)')},
      {id: 'textarea', name: _('Text (long)')},
      {id: 'int',      name: _('Integer')},
      {id: 'float',    name: _('Float')},
      {id: 'date',     name: _('Date')},
      {id: 'file',     name: _('File')},
      {id: 'bool',     name: _('Checkbox (yes/no)')},
    ],
  }),
  computed: {
    accordionHeader() {
      return this.type === 'catalog' ? _('Edit catalog parameters')
                                     : _('Edit dealer parameters');
    },
    responseKey() {
      return this.type === 'catalog' ? 'optionProperties'
                                     : 'dealersProperties';
    },
    loadAction() {
      return this.type === 'catalog' ? 'loadProperties'
                                     : 'loadDealersProperties';
    },
    createAction() {
      return this.type === 'catalog' ? 'createProperty'
                                     : 'createDealersProperty';
    },
    changeAction() {
      return this.type === 'catalog' ? 'changeProperty'
                                     : 'changeDealersProperty';
    },
    changeRowOrder() {
      return this.type === 'catalog' ? 'changePropertyOrder'
                                     : 'changeDealersPropertyOrder';
    },
    deleteAction() {
      return this.type === 'catalog' ? 'deleteProperty'
                                     : 'deleteDealersProperty';
    },

    allTypes() {
      return this.propertiesTypes[0].items.concat(this.propertiesTypes[1].items);
    },
    typeIsSelect() { return this.property.type.toLowerCase().includes('select'); },
    typeIsTable() { return this.property.type === 'table'; },
  },
  watch: {
    'property.newName'() {
      const name = this.property.newName;
      if (!name) return;

      this.property.newCode = f.transLit(name).toLowerCase().replace(/\s/g, '');
    },
    typeIsSelect() {
      if (this.typeIsSelect) this.property.fields = {};
    },
    typeIsTable() {
      if (this.typeIsTable) this.property.fields = ['column_1'];
    },
  },
  methods: {
    loadProperties() {
      this.queryParam.cmsAction = this.loadAction;
      this.query().then(data => {
        this.propertiesData = data[this.responseKey];
        this.loading = false;
      });
    },

    getTypeLang(type) {
      return this.allTypes.find(i => i.id === type).name;
    },

    // -------------------------------------------------------------------------------------------------------------------
    // Action
    // -------------------------------------------------------------------------------------------------------------------

    onRowReorder(event) {
      this.propertiesData = event.value;

      this.$nextTick(() => {
        this.loading = true;
        this.queryParam.cmsAction = this.changeRowOrder;
        this.queryParam.property = JSON.stringify(this.propertiesData);
        this.query().then(() => this.loading = false);
      });
    },

    openAccordion() {
      this.loadProperties();
    },
    createProperty() {
      this.queryParam.cmsAction = this.createAction;

      this.property.name = '';
      this.property.code = '';
      this.property.type = 'text';

      this.modal.title = _('Create property');
      this.modal.display = true;
    },
    dblClickProperty(e) {
      const node = e.target.closest('tr').querySelector('[data-code]'),
            code = node && node.dataset.code;

      if (code) {
        this.propertiesSelected = this.propertiesData.find(e => e.code === code);
        this.changeProperty();
      }
    },
    changeProperty() {
      if (!this.propertiesSelected) return;
      this.queryParam.cmsAction = this.changeAction;

      this.property = {...this.propertiesSelected};
      this.property.newName = this.property.name;
      this.property.newCode = this.property.code;

      if (this.typeIsSelect) {
        Object.values(this.property.fields).forEach(f => {
          f.newName = f.name;
          f.newCode = f.code;
        });
      }
      this.$nextTick(() => this.property.code = this.propertiesSelected.code);

      this.modal.title = _('Editing property');
      this.modal.display = true;
    },
    deleteProperty() {
      this.queryParam.cmsAction = this.deleteAction;

      this.property = {...this.propertiesSelected};

      this.modal.title = _('Delete property');
      this.modal.display = true;
    },

    addPropertyField() {
      let random = f.random();

      this.property.fields[random] = {
        newName: 'field_' + random,
        type: 'text',
      }
    },
    removePropertyField(id) {
      delete this.property.fields[id];
    },

    addTableColumn() {
      let index = this.property.fields.length;

      this.property.fields.push('column_' + (index + 1));
    },
    removeTableColumn(id) {
      this.property.fields.splice(id, 1);
    },

    propertiesConfirm() {
      this.loading = true;

      this.queryParam.property = JSON.stringify(this.property);
      this.query().then(() => this.loadProperties());
      this.modal.display = false;
    },
    propertiesCancel() {
      this.modal.display = false;
    },
  },
}
</script>
