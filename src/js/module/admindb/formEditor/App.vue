<template>
  <div class="form-editor">
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
              <span>{{ head.translateValue }}</span>
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
                   @touchstart="startTouch($event, cell)"
                   @touchend="stopTouch($event, cell)"
                   @mousedown="startSelect($event, cell)"
                   @mousemove="moveSelect($event, cell, sKey)"
                   @mouseup="stopSelect($event, cell)"
              >
                <FormInputs :ref="`cell${i}x${j}`"
                            :component="i === 0 ? 'string' : cell.param.type"
                            :cell="cell"
                            v-model:cellValue="cell.value"
                            v-model="contentData[i][j]"
                            @keydown="inputKeyDown($event, i, j)"
                />
              </div>
            </template>
          </div>
        </div>
      </template>

      <ContextMenu v-if="selected.row" :style="contextMenuPosition" v-model:show="selected.row"
                   @remove="removeRow" @add-row="addRow" />
    </div>

    <teleport to="body">
      <CellChanger @apply="applyChange" @undo="undoChanges" @clear="clearSelected" />
    </teleport>
  </div>
</template>

<script>

//import Modal from "../contentEditor/Modal";

import FormInputs from "./form/FormInputs.vue";
import ContextMenu from "./ContextMenu.vue";
import CellChanger from "./CellChanger.vue";

import methods from "./methods";

export default {
  name: "FormsTable",
  components: {FormInputs, CellChanger, ContextMenu},
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
      containerWidth: this.$db.mainNode.getBoundingClientRect().width - 30, // первая колонка и скролл
      columnWidths: [],

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

      return arr.map(k => { k.translateValue = window._(k.value); return k; });
    },
    columns() { return Object.keys(this.header).length },
    contentStyle() {
      let style = 'grid-template-columns: 30px',
          totalWidth = this.columnWidths.reduce((r, w) => r += (w + 2), 0),
          scale = this.containerWidth / totalWidth;

      this.columnWidths.forEach(w => {
        style += ' ' + Math.floor((w + 2) * scale) + 'px';
      });

      return style;
    },
  },
  watch: {
    contentData: {
      deep: true,
      handler() { this.$db.enableBtnSave() },
    },
  },
  methods,
  created() {
    this.observer = new ResizeObserver(entries => {
      setTimeout(() => this.containerWidth = entries[0].contentRect.width - 30, 300);
    });

    this.observer.observe(this.$db.mainNode);

    this.mergeData();
    this.calcColumnsWidth();
  },
  unmounted() {
    this.observer.unobserve(this.$db.mainNode);
  },
}
</script>
