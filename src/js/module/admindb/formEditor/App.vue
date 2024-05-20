<template>
  <div class="form-editor container-fluid d-flex align-items-start gap-2">
    <div class="content-wrap">
      <!-- Спойлеры -->
      <template v-for="(spoiler, s) of mergedData" :key="s">
        <div v-if="s !== 's0'" class="content-spoiler" :class="{'solid': !showSpoiler}">
          <div v-show="showSpoiler" class="content-spoiler__header" @click="toggleSpoiler(s)">
            {{ s }}
            <i class="pi position-absolute end-0 top-0 p-2"
               :class="openSpoiler[s] ? 'pi-angle-up' : 'pi-angle-down'"
            ></i>
          </div>

          <div class="form-content" :class="openSpoiler[s] ? '' : 'd-none'" :style="contentStyle">
            <!-- Шапка -->
            <div v-for="(head, k) of header" :key="k" class="form-content__header">
              <span>{{ head.value }}</span>
            </div>
            <!-- Содержимое -->
            <template v-for="(row, i, rIndex) of spoiler" :key="i">
              <div v-for="(cell, j, cIndex) of row" :key="'' + i + j + cell.value" class="cell"
                   :class="{
                     'first': cIndex === 0,
                     'last-row': itemSpoiler[s] === rIndex + 1,
                     'selected': checkSelectedCell(i, j),
                   }"
                   @click="selectCell($event, cell)"
                   @mousedown="startSelect($event, cell)"
                   @mouseup="stopSelect($event, cell)"
              >
                <InputText v-if="cell.param.type === 'string' || i === 0" :cell="cell" v-model="contentData[i][j]"/>
                <InputNumber v-else-if="cell.param.type === 'number'" :cell="cell" v-model="contentData[i][j]"/>
                <SimpleList v-else-if="cell.param.type === 'simpleList'" :cell="cell" v-model="contentData[i][j]"/>
                <CustomEvent v-else-if="cell.param.type === 'customEvent'" :cell="cell" v-model="contentData[i][j]"/>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <div class="control-wrap">
      <div class="radio-group">
        <label class="radio-group__item">
          <input type="radio" hidden value="set" v-model="change.type">
          <span class="radio-group__span">Установить</span>
        </label>
        <label class="radio-group__item">
          <input type="radio" hidden value="change" v-model="change.type">
          <span class="radio-group__span">Изменить</span>
        </label>
      </div>
      <div class="radio-group mt-2">
        <label class="radio-group__item">
          <input type="radio" hidden value="absolute" v-model="change.valueType">
          <span class="radio-group__span">Значение</span>
        </label>
        <label class="radio-group__item">
          <input type="radio" hidden value="relative" v-model="change.valueType">
          <span class="radio-group__span">Проценты</span>
        </label>
      </div>

      <input type="text" class="control-input mt-2" v-model="change.value">

      <div class="d-flex justify-content-between mt-4 gap-4">
        <button type="button" class="col btn btn-white" @click="applyChange">Применить</button>
        <button type="button" class="col btn btn-gray" title="Снять выделение" @click="clearSelected">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>

//import Modal from "../contentEditor/Modal";

import InputText from "./form/text.vue";
import InputNumber from "./form/number.vue";
import SimpleList from "./form/simpleList.vue";
import CustomEvent from "./form/custom.vue";

const getCellKey = (i, j) => `s${i}x${j}`;

export default {
  name: "FormsTable",
  components: {
    InputText,
    InputNumber,
    SimpleList,
    CustomEvent,
  },
  data() {
    return {
      showModal: false,
      showSpoiler: true,
      openSpoiler: {},
      itemSpoiler: {},

      contentData: this.$db.contentData,
      contentConfig: this.$db.contentConfig || {},
      contentProperties: this.$db.contentProperties || {},
      mergedData: {},

      focusedCell: undefined,
      selectedCells: {},
      startCell: undefined,
      param: {
        type: 'string',
      },

      change: {
        type: 'set',
        valueType: 'absolute', // Значение или проценты
        value: '',
      },
    };
  },
  computed: {
    header() {
      return Object.values(this.mergedData['s0'][0]).map(k => {
        k.value = window._(k.value);
        return k;
      });
    },
    columns() { return Object.keys(this.header).length },
    contentStyle() { return 'grid-template-columns: repeat(' + this.columns + ', auto)' },
  },
  watch: {
    contentData: {
      deep: true,
      handler() { this.$db.enableBtnSave() },
    },
  },
  methods: {
    mergeData() {
      const config = this.contentConfig['rows'], // Есть всегда
            props  = this.contentProperties,
            xmlDefRow = config[0].params.param,
            res = {
              s0: {}, // первый спойлер, если будет только один не отображать
            };

      let spoilerKey = 's0';

      this.contentData.forEach((csvRow, rowI) => {
        const xmlRow = config[rowI] ? config[rowI].params.param : xmlDefRow;

        if (xmlRow[0]['@attributes'].type === 'spoiler') {

          spoilerKey = xmlRow[0]['@attributes'].name;
          res[spoilerKey] = {};
          return;
        }
        if (csvRow.join('').length === 0) return;

        res[spoilerKey][rowI] = csvRow.reduce((cR, csvCell, cellI) => {
          const defParam = xmlDefRow[cellI]['@attributes'],
                param    = xmlRow[cellI]['@attributes'],
                isInherit = param.type === 'inherit';

          if (param.type === 'hidden' || (isInherit && defParam.type === 'hidden')) return cR;
          // simpleList
          if (props[param.type]) param.props = props[param.type][param.list];

          cR[cellI] = {
            rowI, cellI,
            value: csvCell,
            param: isInherit ? defParam : param,
          };

          return cR;
        }, {});

        this.itemSpoiler[spoilerKey] = Object.keys(res[spoilerKey]).length;
      });

      if (Object.keys(res).length === 1) {
        this.showSpoiler = false;
        this.openSpoiler.s1 = true;
        res.s1 = {...res.s0};
        delete res.s1[0]; // Удалить шапку
      }

      this.mergedData = res;
    },
    checkSelectedCell(i, j) { return this.selectedCells.hasOwnProperty(getCellKey(i, j)) },

    toggleSpoiler(s) { this.openSpoiler[s] = !this.openSpoiler[s] },

    selectCell(e, cell) {
      if (cell.param.type === 'customEvent') return;

      const key = getCellKey(cell.rowI, cell.cellI);

      this.focusedCell = cell;

      if (e.metaKey || e.ctrlKey) {
        if (this.selectedCells[key]) delete this.selectedCells[key];
        else this.selectedCells[key] = cell;
      }
    },
    clearSelected() { this.selectedCells = {} },
    startSelect(e, cell) {
      //this.startCell = getCellKey(cell.rowI, cell.cellI);

      // Если отпустил в любом другом месте прекратить выделение
    },
    stopSelect(e, cell) {
      /*if (this.startCell === getCellKey(cell.rowI, cell.cellI)) {
        this.startCell = undefined;
        return;
      }*/
    },

    applyChange() {
      const c = this.change;

      if (c.value.toString() === '') {
        f.showMsg('Введите значение', 'error');
        return;
      }
      if (!Object.keys(this.selectedCells).length) {
        f.showMsg('Ничего не выбрано', 'error');
        return;
      }

      Object.values(this.selectedCells).forEach(cell => {
        const i = cell.rowI,
              j = cell.cellI;

        if (c.type === 'set') {
          cell.value = this.contentData[i][j] = c.value;
        } else {
          let cV = cell.value,
              nV = c.value,
              result;

          if (isFinite(cV) || cell.param.type === 'number') {
            result = c.valueType === 'absolute' ? +cV + +nV
                                                : +cV * (1 + +nV / 100);
          }

          cell.value = this.contentData[i][j] = result;
        }
      });
    },
  },
  created() {
    this.mergeData();
  },
}
</script>
