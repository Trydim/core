
<template>
  <div class="history-app">
    <div class="tree-container">
      <Tree
        :treeData="treeData"
        :selectedPath="selectedFile"
        @fileSelected="handleFileSelected"
        @update:selectedPath="selectedFile = $event"
      />
    </div>
    <div class="list-container" v-if="treeData.length">
      <List
        :filePath="selectedFile"
        @entrySelected="handleEntrySelected"
      />
    </div>
    <div class="diff-container" v-if="currentDiff">
      <TableDiff :diff="currentDiff" />
    </div>
  </div>
</template>

<script>
/**
 * @typedef {Object} TreeNode
 * @property {string} name
 * @property {string} path
 * @property {boolean} isFile
 * @property {TreeNode[]} children
 */
/**
 * @typedef {Object} TreeApiResponse
 * @property {boolean} status
 * @property {TreeNode[]} [historyTree]
 */

/**
 * Обработанный объект различий, содержащий результат сравнения CSV и метаданные
 * @typedef {Object} ProcessedCsvDiff
 * @property {string[]} columns - Заголовки столбцов
 * @property {RowDiff[]} rows - Массив строк с различиями
 * @property {BackupMeta} currentMeta - Метаданные текущей (новой) версии
 * @property {BackupMeta} previousMeta - Метаданные предыдущей (старой) версии
 */

import Tree from './components/Tree.vue';
import List from './components/List.vue';
import TableDiff from './components/TableDiff.vue';

export default {
  name: 'HistoryApp',
  components: { Tree, List, TableDiff },
  data() {
    return {
      treeData: [],
      selectedFile: null,
      currentDiff: null
    };
  },
  methods: {
    async fetchTreeData() {
      const response =  /** @type {TreeApiResponse} */ await f.Post({data: {
          mode: 'DB', dbAction: 'loadHistoryTree',
      }});

      if (response.status) {
        this.treeData = response.historyTree?.length ? response.historyTree.map(node => ({
          ...node,
          isOpen: true //Открываем первый уровень дерева
        })) : [];
      }
    },
    handleFileSelected(filePath) {
      this.selectedFile = filePath;
    },

    /**
     * @param {ProcessedCsvDiff} diff - Объект с обработанными различиями между версиями CSV
     */
    handleEntrySelected(diff) {
      this.currentDiff = diff;
    }
  },
  mounted() {
    this.fetchTreeData();
  }
};
</script>

<style lang="scss" scoped>
@import './../../../css/mixin/functions.scss';

.history-app {
  display: grid;
  grid-template-columns: rem(360) 1fr;
  grid-template-rows: 0.8fr 1.2fr;
  gap: rem(20);
  height: 95vh;
  max-height: 100%;
  padding: rem(10);
}

.tree-container {
  grid-column: 1;
  grid-row: 1;
  height: 100%;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: rem(8);
  padding: rem(10);
}

.list-container {
  grid-column: 1;
  grid-row: 2;
  height: 100%;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: rem(8);
  padding: rem(10);
}

.diff-container {
  grid-column: 2;
  grid-row: 1 / span 2;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: rem(8);
  padding: rem(15);
  height: 100%;
}

</style>
