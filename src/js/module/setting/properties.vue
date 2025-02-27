<template>
  <div class="col-12" id="propertiesWrap">
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
            <p-t-column :rowReorder="true" header-style="width: 3rem" header="Очередность" />
            <p-t-column field="name" header="Название" />
            <p-t-column field="code" header="Код">
              <template #body="slotProps">
                <span :data-code="slotProps.data.code">{{ slotProps.data.code }}</span>
              </template>
            </p-t-column>
            <p-t-column field="type" header="Тип">
              <template #body="slotProps">
                {{ getTypeLang(slotProps.data.type) }}
              </template>
            </p-t-column>
          </p-table>

          <div class="my-3 text-center">
            <p-button v-tooltip.bottom="'Добавить'" icon="pi pi-plus-circle" class="p-button-warning mx-1"
                      :loading="loading" @click="createProperty" />
            <p-button v-tooltip.bottom="'Изменить'" icon="pi pi-cog" class="p-button-warning mx-1"
                      :loading="loading" @click="changeProperty" />
            <p-button v-tooltip.bottom="'Удалить'" icon="pi pi-trash" class="p-button-danger mx-1"
                      :loading="loading" @click="deleteProperty" />
          </div>
        </p-accordion-content>
      </p-accordion-panel>
    </p-accordion>

    <p-dialog v-model:visible="modal.display" :modal="true" :base-z-index="-100">
      <template #header>
        <h4>{{ modal.title }}</h4>
      </template>

      <div v-if="queryParam.cmsAction !== deleteAction" style="width: 600px">
        <!-- Имя -->
        <div class="col-12 row my-1">
          <div class="col">Название свойства:</div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newName" autofocus />
          </div>
        </div>
        <!-- Код свойства -->
        <div class="col-12 row my-1">
          <div class="col">
            Код свойства:
            <i class="ms-1 pi pi-tag" v-tooltip.bottom="'При изменении, обновить значение у дилеров'"></i>
          </div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newCode" />
          </div>
        </div>
        <!-- Тип данных -->
        <div class="col-12 row my-1">
          <div class="col">Тип данных:</div>
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
          <div class="col-12 row mb-1">
            <div class="col">Дополнительные поля свойства (имя есть):</div>
            <div class="col">
              <p-button v-tooltip.bottom="'Добавить поле'" icon="pi pi-plus-circle" class="w-100 p-button-raised"
                        label="Добавить поле"
                        @click="addPropertyField" />
            </div>
          </div>

          <div v-for="(field, key) of property.fields" class="row mb-1 border" :key="key">
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
              <p-button v-tooltip.bottom="'Удалить поле'" icon="pi pi-times" class="p-button-danger"
                        @click="removePropertyField(key)" />
            </div>
          </div>
        </template>
        <template v-if="typeIsTable">
          <div class="col-12 row mb-1">
            <div class="col">Колонки:</div>
            <div class="col">
              <p-button v-tooltip.bottom="'Добавить колонку в таблицу'" icon="pi pi-plus-circle" class="w-100 p-button-raised"
                        label="Добавить колонку" @click="addTableColumn" />
            </div>
          </div>

          <div v-for="(field, index) of property.fields" class="row  mb-1 border" :key="index">
            <div class="col flex-grow-1 p-0 text-center">
              <p-input-text class="w-100" v-model="property.fields[index]" />
            </div>
            <div v-if="property.fields.length > 1" class="col-1 m-0 text-center">
              <p-button v-tooltip.bottom="'Удалить колонку'" icon="pi pi-times" class="p-button-danger"
                        @click="removeTableColumn(index)" />
            </div>
          </div>
        </template>
      </div>
      <div v-else style="min-width: 300px">
        Удалить свойство
      </div>

      <template #footer>
        <p-button :label="$t('Yes')" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="propertiesConfirm" />
        <p-button :label="$t('No')" icon="pi pi-times" class="p-button-text" @click="propertiesCancel" />
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
        label: 'Простые',
        items: [
          {id: 'text',     name: _('Text (~200 characters)')},
          {id: 'textarea', name: _('Text (many)')},
          {id: 'number',   name: _('Number')},
          {id: 'bool',     name: _('Checkbox')},
          {id: 'date',     name: _('Date')},
        ]
      },
      {
        label: 'Составные',
        items: [
          {id: 'select', name: 'Справочник'},
          {id: 'multiSelect', name: 'Справочник множественный'},
          {id: 'table', name: 'Таблица'},
        ]
      }
    ],
    propertiesDataBaseTypes: [
      {id: 'text', name: 'Текст (~200 символов)'},
      {id: 'textarea', name: 'Текст (много)'},
      {id: 'int', name: 'Целое число'},
      {id: 'float', name: 'Дробное число'},
      {id: 'date', name: 'Дата'},
      {id: 'file', name: 'Файл'},
      {id: 'bool', name: 'Флаг (да/нет)'},
    ],
  }),
  computed: {
    accordionHeader() {
      return this.type === 'catalog' ? 'Редактировать параметры каталога'
                                     : 'Редактировать параметры дилеров';
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

      this.modal.title = 'Создать свойство';
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

      this.modal.title = 'Редактирование свойства';
      this.modal.display = true;
    },
    deleteProperty() {
      this.queryParam.cmsAction = this.deleteAction;

      this.property = {...this.propertiesSelected};

      this.modal.title = 'Удалить свойство';
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
