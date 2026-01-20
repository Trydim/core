<template>
  <div class="diff-wrapper">

    <DiffToolbar
      v-model:showOnlyChanges="showOnlyChanges"
      v-model:syncScroll="syncScroll"
      v-model:isVertical="isVertical"
      :isSidebarCollapsed="isSidebarCollapsed"
      @toggle-sidebar="$emit('toggle-sidebar', $event)"
      @open-settings="$emit('open-settings')"
    />

    <div class="diff-container" :class="{ 'vertical-layout': isVertical }">
      <TableSide
        ref="leftSide"
        side="left"
        :rows="processedRows"
        :content="diff?.previousContent"
        :title="$t('Previous version')"
        :meta="diff?.previousMeta"
        @scroll="onSyncScroll($event, 'left')"
        @request-details="onShowDetails"
      />

      <TableSide
        ref="rightSide"
        side="right"
        :rows="processedRows"
        :content="diff?.currentContent"
        :title="$t('Current version')"
        :meta="diff?.currentMeta"
        @scroll="onSyncScroll($event, 'right')"
        @request-details="onShowDetails"
      />
    </div>

    <!-- Слой попапов, управляется через ref -->
    <PopupLayer ref="popupLayer"/>

  </div>
</template>

<script>
import {generateTextDiff} from '../utils/csvDiff.js';
import {getProcessedRows} from '../utils/diffProcessor.js';
import TableSide from './TableSide.vue';
import DiffToolbar from './DiffToolbar.vue';
import PopupLayer from './PopupLayer.vue';

export default {
  name: 'TableDiff',
  components: {TableSide, DiffToolbar, PopupLayer},
  emits: ['toggle-sidebar', 'open-settings'],
  props: {
    diff: {
      type: Object,
      required: true
    },
    isSidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showOnlyChanges: false,
      syncScroll: true,
      isVertical: false,
      contextLines: 3,
      isScrolling: false,
    };
  },
  computed: {
    rawRows() {
      if (!this.diff?.previousContent || !this.diff?.currentContent) return [];
      return generateTextDiff(this.diff.previousContent, this.diff.currentContent);
    },
    processedRows() {
      return getProcessedRows(this.rawRows, this.showOnlyChanges, this.contextLines);
    }
  },
  watch: {
    // Очищаем попапы при смене diff (выборе другого файла/версии)
    diff() {
      this.$refs.popupLayer?.clearAll();
    }
  },
  methods: {
    onSyncScroll(pos, source) {
      if (!this.syncScroll) return;
      if (this.isScrolling) return;

      this.isScrolling = true;

      const targetRef = source === 'left' ? this.$refs.rightSide : this.$refs.leftSide;
      if (targetRef) {
        targetRef.setScrollPosition(pos.top, pos.left);
      }

      setTimeout(() => {
        this.isScrolling = false;
      }, 10);
    },

    // Обработчик события из TableSide
    onShowDetails(payload) {
      this.$refs.popupLayer.show(payload);
    }
  }
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.diff-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-main;
  padding: rem(10);
}

.diff-container {
  display: flex;
  flex: 1;
  background: $bg-main;
  border: rem(1) solid $border-main;
  overflow: hidden;
  transition: all 0.3s ease;

  flex-direction: row;

  &.vertical-layout {
    flex-direction: column;

    :deep(.side-wrapper) {
      border-right: none;
      border-bottom: rem(1) solid $border-main;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
