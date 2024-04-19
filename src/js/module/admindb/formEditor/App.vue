<template>
  <div class="form-editor container-fluid row">
    <div class="col-10">
      <!-- Спойлеры -->
      <template v-for="(spoiler, s) of mergedData" :key="s">
        <details v-if="s !== 's0'" class="mt-3" open="open" :style="spoilerStyle">
          <summary v-show="showSpoiler" class="border border-2 rounded-5 p-2 bg-white">Нажми на меня</summary>

          <div class="form-content d-grid gap-2 mt-1 p-1" :style="contentStyle">
            <!-- Шапка -->
            <div v-for="(head, k) of header" :key="k" class="fw-bold text-nowrap hidden text-center">
              <span>{{ head.value }}</span>
            </div>
            <!-- Содержимое -->
            <template v-for="(row, i) of spoiler" :key="i">
              <div v-for="(cell, j) of row" :key="'' + i + j + cell.value" class="cell"
                   :class="{'selected': checkSelectedCell(i, j)}"
                   @click="selectCell($event, cell)"
              >
                <InputText v-if="cell.param.type === 'string' || i === 0" :cell="cell" v-model="contentData[i][j]"/>
                <InputNumber v-else-if="cell.param.type === 'number'" :cell="cell" v-model="contentData[i][j]"/>
                <SimpleList v-else-if="cell.param.type === 'simpleList'" :cell="cell" v-model="contentData[i][j]"/>
                <CustomEvent v-else-if="cell.param.type === 'customEvent'" :cell="cell" v-model="contentData[i][j]"/>
              </div>
            </template>
          </div>
        </details>
      </template>
    </div>
    <div class="col-2">
      <div class="row">
        <div class="col-6 p-0">
          <input type="radio" class="btn-check" id="changeTypeS" value="set" v-model="change.type">
          <label class="btn btn-outline-primary w-100" for="changeTypeS">Установить</label>
        </div>
        <div class="col-6 p-0">
          <input type="radio" class="btn-check" id="changeTypeC" value="change" v-model="change.type">
          <label class="btn btn-outline-primary w-100" for="changeTypeC">Изменить</label>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-6 p-0">
          <input type="radio" class="btn-check" id="changeValueA" value="absolute" v-model="change.valueType">
          <label class="btn btn-outline-primary w-100" for="changeValueA">Значение</label>
        </div>
        <div class="col-6 p-0">
          <input type="radio" class="btn-check" id="changeValueP" value="relative" v-model="change.valueType">
          <label class="btn btn-outline-primary w-100" for="changeValueP">Проценты</label>
        </div>
      </div>
      <div class="row mt-2">
        <input type="text" class="form-control" v-model="change.value">
      </div>
      <div class="row mt-2">
        <button type="button" class="col-12 btn btn-primary" @click="applyChange">Применить</button>
      </div>
      <div class="row mt-2">
        <button type="button" class="col-6 btn btn-info" title="Снять выделение" @click="clearSelected">
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

      contentData: this.$db.contentData,
      contentConfig: this.$db.contentConfig || {},
      contentProperties: this.$db.contentProperties || {},
      mergedData: {},

      focusedCell: undefined,
      selectedCells: {},
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
    header() { return this.mergedData['s0'][0] },
    columns() { return Object.keys(this.header).length },
    spoilerStyle() {
      return this.showSpoiler ? 'background-image: linear-gradient(180deg, white 20px, #838383 20px)'
                              : 'background: #838383';
    },
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
              s0: {}, // первый спойлер, если он будет один не отображать
            };

      let spoilerI = 0,
          rowI = 0;

      this.contentData.forEach(csvRow => {
        if (csvRow.join('').length === 0) return;
        if (csvRow[0] === '<s>') {
          spoilerI++;
          res['s' + spoilerI] = {};
          return;
        }

        const xmlRow = config[rowI].params.param;

        res['s' + spoilerI][rowI] = csvRow.reduce((cR, csvCell, cellI) => {
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

        rowI++;

      });

      if (Object.keys(res).length === 1) {
        this.showSpoiler = false;
        res.s1 = {...res.s0};
        delete res.s1[0]; // Удалить шапку
      }

      this.mergedData = res;
    },
    checkSelectedCell(i, j) { return this.selectedCells.hasOwnProperty(getCellKey(i, j)) },

    selectCell(e, cell) {
      const key = getCellKey(cell.rowI, cell.cellI);

      this.focusedCell = cell;

      if (e.metaKey || e.ctrlKey) {
        if (this.selectedCells[key]) delete this.selectedCells[key];
        else this.selectedCells[key] = cell;
      }
    },
    clearSelected() { this.selectedCells = {} },

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
              nV = c.value;

          if (isFinite(cV) || cell.param.type === 'number') {
            cV = +cV;
            nV = +nV;
          }

          cell.value = this.contentData[i][j] = cV + nV;
        }
      });
    },
  },
  created() {
    this.mergeData();
  },
}
</script>
