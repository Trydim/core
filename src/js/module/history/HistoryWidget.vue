<template>
  <teleport to="body">
    <div v-if="visible" class="modal-history-overlay" @click.self="close">
      <button class="close-btn" @click="close">×</button>

      <div class="modal-content">
        <div class="modal-content-scrollable">

          <div class="history-widget">
            <div class="list-container">
              <List :filePath="filePath" @entrySelected="handleEntrySelected"/>
            </div>
            <div class="diff-container">
              <TableDiff v-if="currentDiff" :diff="currentDiff"/>
            </div>
          </div>

        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import List from './components/List.vue';
import TableDiff from './components/TableDiff.vue';

export default {
  name: 'HistoryWidget',
  components: {List, TableDiff},
  data() {
    return {
      visible: false,
      filePath: null,
      currentDiff: null,
    };
  },
  methods: {
    open() {
      const params = new URLSearchParams(window.location.search);
      const path = params.get('tableName');
      if (path) {
        this.filePath = path;
        this.visible = true;
        this.currentDiff = null;
      }
    },
    close() {
      this.visible = false;
    },
    handleEntrySelected(diff) {
      this.currentDiff = diff;
    },
    onKeyDown(event) {
      if (event.key === 'Escape' && this.visible) {
        this.close();
      }
    }
  },
  mounted() {
    window.addEventListener('open-history-widget', this.open);
    window.addEventListener('close-history-widget', this.close);
    window.addEventListener('keydown', this.onKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('open-history-widget', this.open);
    window.removeEventListener('close-history-widget', this.close);
    window.removeEventListener('keydown', this.onKeyDown);
  }
};
</script>

<style lang="scss" scoped>
@import "index";

.history-widget {
  display: grid;
  grid-template-columns: rem(360) 1fr;
  grid-template-rows: auto 1fr;
  gap: rem(20);
  height: 100%;
  padding: rem(20);
}

.list-container {
  grid-column: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: rem(8);
  padding: rem(15);
}

.diff-container {
  grid-column: 2;
  overflow: auto;
  border: 1px solid #eee;
  border-radius: rem(8);
  padding: rem(15);

}

.modal-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  height: 96vh;
  width: 96vw;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 0;
}

.modal-content-scrollable {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 20px;
  border-radius: inherit;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 14px;
  font-size: 20px;
  background: white;
  border: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

</style>
