<template>
  <div class="col-12" id="propertiesWrap">
    <p-accordion @tab-open="openAccordion()">
      <p-accordion-tab header="Редактировать параметры каталога">
        <p-table v-if="propertiesData"
                 :value="propertiesData"
                 :loading="loading"
                 :resizable-columns="true" column-resize-mode="fit" show-gridlines
                 selection-mode="single" :meta-key-selection="false"
                 :scrollable="true"
                 responsive-layout="scroll"
                 v-model:selection="propertiesSelected"
                 @dblclick="changeProperty($event)"
                 :bodyClass="'text-center'"
        >
          <p-t-column field="name" header="Название"></p-t-column>
          <p-t-column field="code" :sortable="true" header="Код"></p-t-column>
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
            <p-input-text class="w-100" v-model="property.name" autofocus></p-input-text>
          </div>
        </div>
        <!-- Код свойства -->
        <div class="col-12 row my-1">
          <div class="col">Код свойства:</div>
          <div class="col">
            <p-input-text class="w-100" v-model="property.code"></p-input-text>
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
              <p-input-text class="w-100"
                            v-model="field.name"
              ></p-input-text>
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
      code: '',
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
      {id: 'number', name: 'Целое число'},
      {id: 'float', name: 'Дробное число'},
      {id: 'date', name: 'Дата'},
      {id: 'file', name: 'Файл'},
      {id: 'bool', name: 'Флаг (да/нет)'},
    ],
  }),
  watch: {
    'property.name'() {
      this.property.code = f.transLit(this.property.name);
    },
  },
  computed: {
    allTypes() {
      return this.propertiesTypes[0].items.concat(this.propertiesTypes[1].items);
    }
  },
  methods: {
    loadProperties() {
      this.queryParam.cmsAction = 'loadProperties';
      this.query().then(data => {
        this.propertiesData = data['optionProperties'];
        this.loading = false;
      });
    },

    getTypeLang(type) {
      return this.allTypes.find(i => i.id === type).name;
    },

    // -------------------------------------------------------------------------------------------------------------------
    // Action
    // -------------------------------------------------------------------------------------------------------------------

    openAccordion() {
      this.loadProperties();
    },
    createProperty() {
      this.queryParam.cmsAction = 'createProperty';

      this.property.name = '';
      this.property.code = '';
      this.property.type = 'text';
      this.property.fields = {};

      this.modal.title = 'Создать свойство';
      this.modal.display = true;
    },
    changeProperty() {
      this.queryParam.cmsAction = 'createProperty';

      this.modal.title = 'В разработке';
      this.modal.display = true;
    },
    deleteProperty() {
      this.queryParam.cmsAction = 'deleteProperties';

      this.property = {...this.propertiesSelected};

      this.modal.title = 'Удалить свойство';
      this.modal.display = true;
    },

    addPropertyField() {
      let random = Math.random() * 10000 | 0;

      this.property.fields[random] = {
        name: 'Поле' + random,
        type: 'text',
      }
    },
    removePropertyField(id) {
      delete this.property.fields[id];
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
/*
const getFieldNode = (p, field) => p.querySelector(`[data-field=${field}]`);

class Properties {
  constructor(modal) {
    this.form = f.qS('#propertiesTable');
    if (!this.form) return;

    this.setParam(modal);

    this.onEvent();
  }

  setParam(modal) {
    this.M = modal;

    this.needReload = false;
    this.delayFunc = () => {};
    this.queryParam = {
      cmsAction: 'loadProperties',
    };

    this.field = {
      body: this.form.querySelector('tbody'),
    }

    this.tmp = {
      create: f.gTNode('#propertiesCreateTmp'),
      property: this.field.body.innerHTML,
    };

    this.field.propertyType = getFieldNode(this.tmp.create, 'propertyType');
    this.field.colsField    = getFieldNode(this.tmp.create, 'propertiesCols');
    this.tmp.colItem        = getFieldNode(this.tmp.create, 'propertiesColItem');
    this.tmp.colItem.remove();

    this.loader = new f.LoaderIcon(this.field.body, false, true, {small: false});
    this.selected = new f.SelectedRow({table: this.form});

    f.relatedOption(this.tmp.create);
  }

  reloadQuery() {
    this.queryParam = {cmsAction: 'loadProperties'};
    this.needReload = false;
  }
  // Events function
  //--------------------------------------------------------------------------------------------------------------------


  changeProperty() {
    let props = this.selected.getSelected();
    if (props.length !== 1) {
      f.showMsg('Выберите 1 параметр', 'error');
      return;
    }

    this.queryParam.props = props;

    this.M.show('Удалить параметр?', this.tmp.edit);
  }
  delProperty() {
    let props = this.selected.getSelected();
    if (!props.length) {
      f.showMsg('Выберите параметр', 'error');
      return;
    }

    this.queryParam.props = props;
    this.M.show('Удалить параметр?', props.join(', '));
  }

  addCol(keyValue = false, typeValue = false) {
    let node = this.tmp.colItem.cloneNode(true),
        key = getFieldNode(node, 'key'),
        type = getFieldNode(node, 'type'),
        randName = new Date().getTime();

    key.name = 'colName' + randName;
    key.value = keyValue || 'Поле' + randName.toString().slice(-2);
    type.name = 'colType' + randName;
    type.value = typeValue || 'string';
    this.field.colsField.append(node);
  }
}*/
</script>
