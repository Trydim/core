<template>
  <div>
    <Modal :visible="visible" variant="widget" @close="close">

      <HistoryLayout :currentDiff="currentDiff">

        <template #sidebar="{ collapse }">
          <div class="widget-sidebar">
            <List
              :filePath="filePath"
              @entrySelected="handleEntrySelected"
              @collapse="collapse"
            />
          </div>
        </template>

      </HistoryLayout>

    </Modal>
  </div>
</template>

<script>
import Modal from './components/ui/Modal.vue';
import HistoryLayout from './components/HistoryLayout.vue';
import List from './components/List.vue';

export default {
  name: 'HistoryWidget',
  components: { Modal, HistoryLayout, List },
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
@use './scss/mixin/functions' as *;

.widget-sidebar {
  height: 100%;
  border: 1px solid #ddd;
  border-radius: rem(4);
  background: #fff;
  overflow: hidden;
}
</style>
