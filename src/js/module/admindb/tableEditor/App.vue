<template>
  <div>
    <div v-for="(row, i) of contentData" :key="i" class="row">
      <div class="col-4 border">
        <div>
          <small>{{ row['@attributes'].id }}</small>-<span>{{ row['@attributes'].description }}</span>
        </div>
      </div>

      <div v-for="(param, j) of row.params.param" :key="j" class="col-auto" role="button"
           :data-param="param.key">
        <span>{{ param['@attributes'].type }}</span><br>
        <span>{{ param['@attributes']['currentValue'] }}</span>
        <i class="pointer pi pi-cog" @click="editParamModal = true"></i>
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
            <option value="string">Строка</option>
            <option value="number">Число</option>
            <!--<option value="simpleList">Простой Список</option>
            <option value="relationTable">Справочник</option>
            <option value="checkbox">Чекбокс</option>
            <option value="color">Цвет</option>-->
          </select>
        </label>
      </div>
      <div v-if="param.type === 'string'" class="d-flex flex-column simpleList">
        <p>В каждой строке 1 значение!</p>
        <p>ключ=значение.</p>
        <textarea name="listItems" cols="30" rows="5"></textarea>
      </div>
      <div v-else-if="param.type === 'number'" class="d-flex flex-column typeNumber">
        <label>минимум<input type="number" v-model="param.min"></label>
        <label>максимум<input type="number" v-model="param.max"></label>
        <label>шаг<input type="number" v-model="param.step"></label>
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
      <div class="d-flex flex-column typeCheckbox">
        <label>Зависимое поле<input type="text" placeholder="ID зависимого поля" name="relTarget"></label>
        <label>Отображать, если активен<input type="checkbox" checked name="relativeWay"></label>
      </div>-->
    </Modal>
  </div>
</template>

<script>

import Modal from "../contentEditor/Modal.vue";

export default {
  name: "TableEditor",
  components: {Modal},
  data() {
    return {
      editParamModal: false,

      contentData: this.$db.contentData['rows'], // Всегда есть

      param: {
        type: 'string',
      }
    };
  },
  watch: {
    contentData: {
      deep: true,
      handler: () => this.$db.enableBtnSave(),
    },
    'param.type'() {
      this.param = {type: this.param.type};

      switch (this.param.type) {
        case "string": break;
        case "number":
          this.param.min  = 0;
          this.param.max  = 1e10;
          this.param.step = 1;
          break;
      }
    },
  },
  methods: {
    confirmEditParam() {
      this.$emit('image', this.src);
      this.closeModal();
    },
    closeModal() {
      this.editParamModal = false;
    },
  },
}

</script>
