<template>
  <div class="d-grid gap-1 mt-1 p-1 overflow-auto text-nowrap" :style="contentStyle">
    <template v-for="(row, i) of contentConfig" :key="i">
      <span class="d-flex align-items-center justify-content-center">{{ i + 1 }}</span>
      <template v-for="(param, j) of row" :key="j">
        <div v-if="j === 0 || !checkSpoiler(contentConfig[i][0])"
             class="border px-1" :class="{'border-dark': checkSpoiler(param)}"
             :style="checkSpoiler(param) ? 'grid-column: span ' + this.columns : ''"
        >
          <div class="text-center overflow-hidden pointer" title="Редактировать" @click="onEditParam(param, i, j)">
            <span>{{ param.key }} - {{ param.type }}</span>
            <span v-if="checkSpoiler(param)"> - {{ param.name }}</span>
            <br><small class="opacity-50">{{ contentData[i][j] }}</small>
          </div>
        </div>
      </template>
    </template>

    <Modal v-if="editParamModal" title="Настройка параметров" @confirm="confirmEditParam" @cancel="closeModal">
      <label class="d-flex justify-content-between align-items-center mb-2">
        <span class="col-6">Тип:</span>
        <select class="col" v-model="param.type">
          <option v-for="(v, k) of paramType" :key="k"
                  :disabled="disabledSpoiler(k)"
                  :value="k">
            {{ v }}
          </option>
        </select>
      </label>

      <label v-if="param.type === 'spoiler'" class="d-flex justify-content-between align-items-center">
        <span class="col-6">Заголовок</span>
        <input type="text" class="col" v-model="param.name">
      </label>
      <label v-else-if="param.type === 'string'" class="d-flex justify-content-between align-items-center">
        <span class="col-6">Нельзя редактировать</span>
        <span class="col-6 text-center"><input type="checkbox" v-model="param.disabled"></span>
      </label>
      <div v-else-if="param.type === 'number'">
        <label class="d-flex justify-content-between align-items-center">
          <span class="col-6">Минимум</span>
          <input type="number" class="col" v-model="param.min">
        </label>
        <label class="d-flex justify-content-between align-items-center">
          <span class="col-6">Максимум</span>
          <input type="number" class="col" v-model="param.max">
        </label>
        <label class="d-flex justify-content-between align-items-center">
          <span class="col-6">шаг</span>
          <input type="number" class="col" v-model="param.step">
        </label>
      </div>
      <div v-else-if="param.type === 'checkbox'" class="d-flex justify-content-between align-items-center">
        <!--Ограничения для флага-->
      </div>
      <div v-else-if="param.type === 'simpleList'">
        <!-- Выбор списка добавление/удаление/переименование списка -->
        <div class="d-flex align-items-center mb-2">
          <span class="col-3">Название:</span>
          <EditedSelect class="col" :options="simpleList" v-model="param.list" @addListKey="addListKey" />
        </div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="col-6">Множественный</span>
          <span class="col-6 text-center"><input type="checkbox" v-model="param.multiple"></span>
        </div>
        <p class="text-center">значение / ключ : значение</p>
        <textarea class="w-100" rows="5" v-model="simpleListEntries"></textarea>
      </div>
      <label v-else-if="param.type === 'customEvent'" class="d-flex justify-content-between align-items-center">
        <span class="col-6">Ключ</span><input type="text" class="col" v-model="param.id">
      </label>
      <div v-else-if="param.type === 'relationTable'"></div>

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

import cloneDeep from 'lodash/clonedeep';

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
        spoiler      : 'Спойлер',     // Спойлер для первой колонки с пустым значением
        string       : 'Строка',
        number       : 'Число',
        simpleList   : 'Простой Список',
        checkbox     : 'Да/Нет',
        relationTable: 'Справочник',
        color        : 'Цвет',
        customEvent  : 'Свой режим'
      },

      editParamModal: false,

      contentData  : this.$db.contentData,
      contentConfig: this.$db.contentConfig,
      contentProperties,

      simpleList: contentProperties.simpleList, // Простые списки

      editedParam: {},
      param: {
        type: 'string',
      },
    };
  },
  computed: {
    columns() { return this.contentData[0].length },
    contentStyle() {
      return 'grid-template-columns: 25px repeat(' + this.columns + ', minmax(auto, 250px))'
    },
  },
  watch: {
    contentConfig: {
      deep: true,
      handler() { this.$db.enableBtnSave() },
    },

    editParamModal() {
      if (this.editParamModal && this.param.list === 'simpleList') this.convertSimpleList();
    },

    'param.type'() {
      this.param = {
        key : this.param.key,
        type: this.param.type,
      };

      switch (this.param.type) {
        case "string":
          this.param.min = 0;
          this.param.max = 1000;
          break;
        case "number":
          this.param.min  = 0;
          this.param.max  = 1e10;
          this.param.step = 1;
          break;
        case 'simpleList':
          this.param.list = this.param.list || Object.keys(this.simpleList)[0];
          this.param.multiple = false;
          break;
      }
    },
    'param.list'() {
      this.convertSimpleList();
    },
    simpleListEntries() {
      // Преобразовывает из: 'key1:value1\nkey2:value2' в {key1:'value1', key2:'value2'}
      this.simpleList[this.param.list] = this.simpleListEntries.split('\n').reduce((r, str) => {
        const [k, v] = str.split(':');
        if (k) r[k.trim()] = v ? v.trim() : k.trim();
        return r;
      }, {});
    },
  },
  methods: {
    addListKey(listKey) {
      this.simpleList[listKey] = cloneDeep(this.simpleList['new']);
      this.param.list = listKey;
      this.simpleList['new'] = {};
    },
    convertSimpleList() {
      // Преобразовывает из: {key1:'value1', key2:'value2'} в 'key1:value1\nkey2:value2'
      this.simpleListEntries = Object.entries(this.simpleList[this.param.list]).reduce((r, [k, v]) => {
        r.push(k === v ? k : k + ':' + v);
        return r;
      }, []).join('\n') || '';
    },
    checkSpoiler(param) { return param.type === 'spoiler' },
    disabledSpoiler(key) {
      const {i, j} = this.editedParam;

      if (key !== 'spoiler') return false;

      return !(i > 0 && j === 0 && this.contentData[i][0] === '');
    },

    onEditParam(param, i, j) {
      this.editedParam = {i, j};
      Object.assign(this.param, param);
      this.editParamModal = true;
    },
    confirmEditParam() {
      const {i, j} = this.editedParam;

      Object.assign(this.contentConfig[i][j], this.param);
      this.closeModal();
    },
    closeModal() {
      this.editParamModal = false;
    },
  },
}

</script>
