<template>
  <div class="form-editor container-fluid row">
    <div class="col-10">
      <!-- Спойлеры -->
      <template v-for="(spoiler, s) of mergedData" :key="s">
        <details v-if="s !== 's0'" class="mt-3" open="open"
                 style="background-image: linear-gradient(180deg, white 20px, #838383 20px);">
          <summary class="border border-2 rounded-5 p-2 bg-white">Нажми на меня</summary>

          <div class="d-grid gap-2 mt-1 p-1" :style="contentStyle">
            <!-- Шапка -->
            <div v-for="(head, k) of header" :key="k" class="fw-bold text-nowrap hidden text-center">
              <span>{{ head.value }}</span>
            </div>
            <!-- Содержимое -->
            <template v-for="(row, i) of spoiler" :key="i">
              <div v-for="(cell, j) of row" :key="j" class="cell">
                <InputText v-if="cell.param.type === 'string' || i === 0" :cell="cell" v-model="contentData[i][j]"></InputText>
                <input v-else-if="cell.param.type === 'number'" type="number" class="w-100 text-end"
                         :min="cell.param.min || 0"
                         :max="cell.param.max || 1e12"
                         :step="cell.param.step || 1"
                         :disabled="cell.param.disabled"
                         :value="cell.value"
                       @change="numberChange($event.target, i, j)">
              </div>
            </template>
          </div>
        </details>
      </template>
    </div>
    <div class="col-2 border">
      редактор
    </div>
  </div>
</template>

<script>

//import Modal from "../contentEditor/Modal";

import InputText from "./form/text.vue";

export default {
  name: "FormsTable",
  components: {InputText},
  data() {
    return {
      showModal: false,

      contentData: this.$db.contentData,
      contentConfig: this.$db.contentConfig || {},
      contentProperties: this.$db.contentProperties || {},
      mergedData: {},

      selected: {},
      param: {
        type: 'string',
      },
    };
  },
  computed: {
    header() {
      return this.mergedData['s0'][0]
    },
    columns() {
      return Object.keys(this.header).length; // как-то это высчитывать
    },
    contentStyle() {
      return 'grid-template-columns: repeat(' + this.columns + ', auto)';
    },
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

          cR[cellI] = {
            rowI, cellI,
            value: csvCell,
            param: isInherit ? defParam : param,
          };

          return cR;
        }, {});

        rowI++;

      });

      this.mergedData = res;
    },

    numberChange(t, i, j) {
      this.contentData[i][j] = t.value;
    },
  },
  created() {
    this.mergeData();
  },
}
</script>
