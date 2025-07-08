
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
      const data = new FormData();
      data.set('mode', 'DB');
      data.set('dbAction', 'getCsvHistoryTree');


      const response =  /** @type {TreeApiResponse} */ await f.Get({data});
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
    handleEntrySelected(diff) {
      this.currentDiff = diff;
    }
  },
  mounted() {
    this.fetchTreeData();
  }
};
</script>

<style scoped>
.history-app {
  display: grid;
  grid-template-columns: 400px max-content;
  grid-template-rows: auto 1fr;
  gap: 20px;
  height: 100vh;
  padding: 20px;
}

.tree-container {
  grid-column: 1;
  grid-row: 1;
  max-height: 40vh;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.list-container {
  grid-column: 1;
  grid-row: 2;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.diff-container {
  grid-column: 2;
  grid-row: 1 / span 2;
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

</style>
