<template>
  <div class="form-editor container-fluid d-flex align-items-start gap-2">
    <div class="content-wrap">
      <!-- Спойлеры -->
      <template v-for="(spoiler, sKey) of mergedData" :key="sKey">
        <div v-if="sKey !== 's0'" class="content-spoiler" :class="{'solid': !showSpoiler}">
          <div v-show="showSpoiler" class="content-spoiler__header" @click="toggleSpoiler(sKey)">
            {{ sKey }}
            <i class="pi position-absolute end-0 top-0 p-2"
               :class="openSpoiler[sKey] ? 'pi-angle-up' : 'pi-angle-down'"
            ></i>
          </div>

          <div class="form-content" :class="openSpoiler[sKey] ? '' : 'd-none'" :style="contentStyle">
            <!-- Шапка -->
            <div v-for="(head, k) of header" :key="k" class="form-content__header">
              <span>{{ head.value }}</span>
            </div>
            <!-- Содержимое -->
            <template v-for="(row, i, rIndex) of spoiler" :key="i">
              <div class="form-editor__menu-icon cell first pi pi-list"
                   :class="{
                     'selected-row': i === selected.row,
                     'last-row': itemSpoiler[sKey] === rIndex + 1
                   }"
                   @click="selectRow($event, sKey, i)"
              ></div>
              <div v-for="(cell, j) of row" :key="i + '-' + j" class="cell"
                   :class="{
                     'selected-row': i === selected.row,
                     'last-row': itemSpoiler[sKey] === +rIndex + 1,
                     'selected': checkSelectedCell(i, j),
                   }"
                   @click="selectCell($event, cell)"
                   @mousedown="startSelect($event, cell)"
                   @mouseup="stopSelect($event, cell)"
              >
                <InputText v-if="cell.param.type === 'string' || i === 0" :cell="cell" v-model:cell="cell.value" v-model="contentData[i][j]" />
                <InputNumber v-else-if="cell.param.type === 'number'" :cell="cell" v-model:cell="cell.value" v-model="contentData[i][j]" />
                <InputCheckbox v-else-if="cell.param.type === 'checkbox'" :cell="cell" v-model="contentData[i][j]" />
                <InputColor v-else-if="cell.param.type === 'color'" :cell="cell" v-model="contentData[i][j]" />
                <SimpleList v-else-if="cell.param.type === 'simpleList'" :cell="cell" v-model="contentData[i][j]" />
                <CustomEvent v-else-if="cell.param.type === 'customEvent'" :cell="cell" v-model="contentData[i][j]" />
              </div>
            </template>
          </div>
        </div>
      </template>

      <ContextMenu v-if="selected.row" :style="contextMenuPosition" v-model:show="selected.row"
                   @remove="removeRow" @add-row="addRow" />
    </div>
    <div class="control-wrap">
      <CellChanger @apply="applyChange" @undo="undoChanges" @clear="clearSelected"></CellChanger>
    </div>
  </div>
</template>

<script>

//import Modal from "../contentEditor/Modal";

import InputText from "./form/text.vue";
import InputNumber from "./form/number.vue";
import InputCheckbox from "./form/checkbox.vue";
import InputColor from "./form/color.vue";
import SimpleList from "./form/simpleList.vue";
import CustomEvent from "./form/custom.vue";
import ContextMenu from "./ContextMenu.vue";
import CellChanger from "./CellChanger.vue";

import methods from "./methods";

export default {
  name: "FormsTable",
  components: {
    InputColor, InputCheckbox, InputText, InputNumber,
    SimpleList, CustomEvent,
    CellChanger,
    ContextMenu,
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

      selected: {
        spoiler: undefined,
        row    : undefined,
      },
      focusedCell: undefined,
      selectedCells: {},
      startCell: undefined,
      param: {
        type: 'string',
      },

      contextMenuPosition: '',
    };
  },
  computed: {
    header() {
      const arr = [{value: ''}].concat(...Object.values(Object.values(this.mergedData['s0'])[0]));

      return arr.map(k => { k.value = window._(k.value); return k; });
    },
    columns() { return Object.keys(this.header).length },
    contentStyle() { return 'grid-template-columns: 30px repeat(' + (this.columns - 1) + ', auto)' },
  },
  watch: {
    contentData: {
      deep: true,
      handler() { this.$db.enableBtnSave() },
    },
  },
  methods,
  created() {
    this.mergeData();
  },
}
</script>
