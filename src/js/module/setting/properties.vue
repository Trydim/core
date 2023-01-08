<template>
  <div class="col-12" id="propertiesWrap">
    <p-accordion @tab-open="openAccordion()">
      <p-accordion-tab :header="accordionHeader">
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
          <p-t-column :rowReorder="true" header-style="width: 3rem" header="Очередность"></p-t-column>
          <p-t-column field="name" header="Название"></p-t-column>
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
                    :loading="loading" @click="createProperty"></p-button>
          <p-button v-tooltip.bottom="'Изменить'" icon="pi pi-cog" class="p-button-warning mx-1"
                    :loading="loading" @click="changeProperty"></p-button>
          <p-button v-tooltip.bottom="'Удалить'" icon="pi pi-trash" class="p-button-danger mx-1"
                    :loading="loading" @click="deleteProperty"></p-button>
        </div>
      </p-accordion-tab>
    </p-accordion>

    <p-dialog v-model:visible="modal.display" :modal="true">
      <template #header>
        <h4>{{ modal.title }}</h4>
      </template>

      <div v-if="queryParam.cmsAction !== 'deleteProperties'" style="width: 600px">
        <!-- Имя -->
        <div class="col-12 row my-1">
          <div class="col">Название свойства:</div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newName" autofocus></p-input-text>
          </div>
        </div>
        <!-- Код свойства -->
        <div class="col-12 row my-1">
          <div class="col">
            Код свойства:
            <i class="ms-1 pi pi-tag" v-tooltip.bottom="'При изменении, обновить значение у дилеров'"></i>
          </div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.newCode"></p-input-text>
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
                      v-model="property.type">
            </p-select>
          </div>
        </div>
        <!-- Составной тип-->
        <template v-if="property.type === 'select'">
          <div class="col-12 row mb-1">
            <div class="col">Дополнительные поля свойства (имя есть):</div>
            <div class="col">
              <p-button v-tooltip.bottom="'Добавить поле'" icon="pi pi-plus-circle" class="w-100 p-button-raised"
                        label="Добавить поле"
                        @click="addPropertyField"></p-button>
            </div>
          </div>

          <div v-for="(field, key) of property.fields" class="row mb-1 border" :key="key">
            <div class="col-5 text-center">
              <p-input-text class="w-100" v-model="field.newName"></p-input-text>
            </div>
            <div class="col-6">
              <p-select class="w-100"
                        :options="propertiesDataBaseTypes"
                        option-value="id" option-label="name"
                        v-model="field.type">
              </p-select>
            </div>
            <div class="col-1 text-center">
              <p-button v-tooltip.bottom="'Удалить поле'" icon="pi pi-times" class="p-button-danger"
                        @click="removePropertyField(key)"></p-button>
            </div>
          </div>
        </template>
      </div>
      <div v-else style="min-width: 300px">
        Удалить свойство
      </div>

      <template #footer>
        <p-button label="Yes" icon="pi pi-check" :disabled="modal.confirmDisabled" @click="propertiesConfirm"></p-button>
        <p-button label="No" icon="pi pi-times" class="p-button-text" @click="propertiesCancel"></p-button>
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
          {id: 'text', name: 'Текст (~200 символов)'},
          {id: 'textarea', name: 'Текст (много)'},
          {id: 'number', name: 'Число'},
          {id: 'date', name: 'Дата'},
          {id: 'bool', name: 'Флаг (да/нет)'},
        ]
      },
      {
        label: 'Составные',
        items: [
          {id: 'select', name: 'Справочник'},
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
  watch: {
    'property.newName'() {
      this.property.newCode = f.transLit(this.property.newName).toLowerCase().replace(/\s/g, '');
    },
  },
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
    deleteAction() {
      return this.type === 'catalog' ? 'deleteProperty'
                                     : 'deleteDealersProperty';
    },

    allTypes() {
      return this.propertiesTypes[0].items.concat(this.propertiesTypes[1].items);
    }
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
    },

    openAccordion() {
      this.loadProperties();
    },
    createProperty() {
      this.queryParam.cmsAction = this.createAction;

      this.property.name = '';
      this.property.code = '';
      this.property.type = 'text';
      this.property.fields = {};

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

      if (this.property.type === 'select') {
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
      delete this.property.fields.splice(id, 1);
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
