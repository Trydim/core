<template>
  <div class="overflow-auto">
    <div v-for="(row, i) of contentData" :key="i" class="row flex-nowrap">
      <div class="col-2 border">
        <small v-if="row['@attributes']">{{ row['@attributes'].id }}</small>
      </div>

      <div v-for="(param, j) of row.params.param" :key="j" class="col-auto" role="button">
        <span>{{ param['@attributes'].key }}</span>-<span>{{ param['@attributes'].type }}</span><br>
        <i class="pointer pi pi-cog" @click="onEditParam(param, i, j)"></i>
      </div>
    </div>

    <Modal v-if="editParamModal"
      title="Настройка параметров"
      @confirm="confirmEditParam"
      @cancel="closeModal"
    >
      <div class="d-flex w-100">
        <label>Тип:
          <select v-model="param.type">
            <option v-for="(v, k) of paramType" :key="k" :value="k">{{ v }}</option>
          </select>
        </label>
      </div>
      <div v-if="param.type === 'string'" class="d-flex">
        <p>Нельзя редактировать</p>
        <input type="checkbox" v-model="param.disabled">
        <!--<p>ключ=значение.</p>
        <textarea name="listItems" cols="30" rows="5"></textarea>-->
      </div>
      <div v-else-if="param.type === 'number'" class="d-flex flex-column">
        <label class="w-100">минимум<input type="number" v-model="param.min"></label>
        <label class="w-100">максимум<input type="number" v-model="param.max"></label>
        <label class="w-100">шаг<input type="number" v-model="param.step"></label>
      </div>
      <div v-else-if="param.type === 'checkbox'" class="d-flex">
        Ограничения для флага
      </div>
      <div v-else-if="param.type === 'simpleList'" class="">
        <!-- Выбор списка добавление/удаление/переименование списка -->
        <EditedSelect :options="simpleList" v-model="param.list"
                      @list="updateSimpleListKeys"
                      @updateSimpleListKeys="updateSimpleListKeys"
        ></EditedSelect>
        <p>ключ:значение</p>
        <textarea v-model="simpleListEntries" class="w-100" rows="5"></textarea>
      </div>

      <!--<div class="d-flex justify-content-between">
        <label>Таблица (файл)</label>
        <select name="dbTable" data-field="dbTables" data-action="selectDbTables"></select>
      </div>
      <div class="d-flex justify-content-between">
        <label>Поля зависимостей(колонка)</label>
        <select name="tableCol" data-field="tableCol"></select>
      </div>
      <div class="d-flex justify-content-between">
        <label>Множественный</label>
        <input type="checkbox" name="multiple" value="true">
      </div>
      <div class="d-flex flex-column">
        <label>Зависимое поле<input type="text" placeholder="ID зависимого поля" name="relTarget"></label>
        <label>Отображать, если активен<input type="checkbox" checked name="relativeWay"></label>
      </div>-->
    </Modal>
  </div>
</template>

<script>

import EditedSelect from "./EditedSelect.vue";
import Modal from "../contentEditor/Modal.vue";

export default {
  name: "TableEditor",
  components: {EditedSelect, Modal},
  data() {
    if (!this.$db.contentProperties) this.$db.contentProperties = {};
    const contentProperties = this.$db.contentProperties;

    if (!contentProperties.hasOwnProperty('simpleList')) contentProperties.simpleList = {'new': {}};

    return {
      paramType: {
        hidden       : 'Скрыт',
        inherit      : 'Наследовать',
        string       : 'Строка',
        number       : 'Число',
        simpleList   : 'Простой Список',
        checkbox     : 'Да/Нет',
        relationTable: 'Справочник',
        color        : 'Цвет',
        customEvent  : 'Свой режим'
      },

      editParamModal: false,

      contentData: this.$db.contentData['rows'], // Всегда есть
      contentProperties,

      simpleList: contentProperties.simpleList, // Простые списки

      editedParam: {},
      param: {
        type: 'string',
      },
    };
  },
  computed: {
    simpleListEntries: {
      get() {
        // Преобразовывает из: {key1:'value1', key2:'value2'} в 'key1:value1\nkey2:value2'
        return Object.entries(this.simpleList[this.param.list]).reduce((r, [k, v]) => {
          r.push(k + ':' + v);
          return r;
        }, []).join('\n') || '';
      },
      set(v) {
        // Преобразовывает из: 'key1:value1\nkey2:value2' в {key1:'value1', key2:'value2'}
        this.simpleList[this.param.list] = v.split('\n').reduce((r, str) => {
          const [k, v] = str.split(':');
          r[k.trim()] = v.trim();
          return r;
        }, {});
      }
    }
  },
  watch: {
    contentData: {
      deep: true,
      handler() { this.$db.enableBtnSave() },
    },

    'param.type'() {
      this.param = {
        key : this.param.key,
        type: this.param.type,
      };

      switch (this.param.type) {
        case "string": break;
        case "number":
          this.param.min  = 0;
          this.param.max  = 1e10;
          this.param.step = 1;
          break;
        case 'simpleList':
          this.param.list = this.param.list || Object.keys(this.simpleList)[0];
          break;
      }
    },
  },
  methods: {
    updateSimpleListKeys(options) { this.simpleList = options },

    onEditParam(param, i, j) {
      this.editedParam = {i, j};
      Object.assign(this.param, param['@attributes']);
      this.editParamModal = true;
    },
    confirmEditParam() {
      const {i, j} = this.editedParam;

      Object.assign(this.contentData[i].params.param[j]['@attributes'], this.param);
      this.closeModal();
    },
    closeModal() {
      this.editParamModal = false;
    },
  },
}

</script>
