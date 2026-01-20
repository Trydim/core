<template>
  <div class="app-container">
    <HistoryLayout :currentDiff="currentDiff">

      <template #sidebar="{ collapse }">
        <HistorySidebar
          :isCollapsed="false"
          :treeData="treeData"
          :isLoadingTree="isLoadingTree"
          :selectedFile="selectedFile"
          @toggle="collapse"
          @update:selectedFile="handleFileSelected"
          @entrySelected="handleEntrySelected"
          @refresh-tree="fetchTreeData"
        />
      </template>

    </HistoryLayout>
  </div>
</template>

<script>
import HistoryLayout from './components/HistoryLayout.vue';
import HistorySidebar from './components/HistorySidebar.vue';
import { loadHistoryTree } from './api/historyApi.js';

export default {
  name: 'HistoryApp',
  components: {HistoryLayout, HistorySidebar},
  data() {
    return {
      /** @type {TreeNode[]} */
      treeData: [],
      /** @type {string|null} */
      selectedFile: null,
      /** @type {DiffData|null} */
      currentDiff: null,
      isLoadingTree: false,
    };
  },
  methods: {
    async fetchTreeData() {
      this.selectedFile = null;
      this.currentDiff = null;
      this.isLoadingTree = true;

      try {
        const response = await loadHistoryTree();

        if (response.status && Array.isArray(response.historyTree)) {
          this.treeData = response.historyTree.map(n => ({
            ...n,
            isOpen: true
          }));
        } else {
          this.treeData = [];
        }
      } catch (e) {
        console.error("Failed to fetch history tree:", e);
        this.treeData = [];
      } finally {
        this.isLoadingTree = false;
      }
    },

    /**
     * @param {string} filePath
     */
    handleFileSelected(filePath) {
      this.selectedFile = filePath;
    },

    /**
     * @param {CsvDiffData|null} diff
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
@use './scss/mixin/functions.scss' as *;

.app-container {
  height: 95vh;
  padding: rem(15);
  background: #fff;
}
</style>
