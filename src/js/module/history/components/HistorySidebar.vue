<template>
  <div class="sidebar-wrapper">

    <div v-if="!isCollapsed" class="sidebar-expanded">

      <!-- Общий заголовок панели -->
      <div class="panel-header">
        <div class="title">{{ $t('File Explorer') }}</div>
        <div class="actions">
          <!-- Кнопка обновления дерева -->
          <button class="icon-btn" @click="$emit('refresh-tree')" :title="$t('Refresh tree')">
            <i class="pi pi-refresh"></i>
          </button>
          <!-- Кнопка сворачивания -->
          <button class="icon-btn" @click="toggle" :title="$t('Collapse panel')">
            <i class="pi pi-angle-double-left"></i>
          </button>
        </div>
      </div>

      <!-- Дерево и Список -->
      <div class="panel-content">
        <div class="tree-section">
          <Tree
            :treeData="treeData"
            :selectedPath="selectedFile"
            @fileSelected="$emit('update:selectedFile', $event)"
            @update:selectedPath="$emit('update:selectedPath', $event)"
            :isLoading="isLoadingTree"
          />
        </div>

        <div class="section-divider"></div>

        <div class="list-section">
          <List
            :filePath="selectedFile"
            @entrySelected="$emit('entrySelected', $event)"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Tree from './Tree.vue';
import List from './List.vue';

export default {
  name: 'HistorySidebar',
  components: {Tree, List},
  props: {
    isCollapsed: {
      type: Boolean,
      required: true
    },
    treeData: {
      type: Array,
      default: () => []
    },
    isLoadingTree: {
      type: Boolean,
      default: false
    },
    selectedFile: {
      type: String,
      default: null
    }
  },
  emits: [
    'toggle',
    'update:selectedFile',
    'update:selectedPath',
    'entrySelected',
    'refresh-tree'
  ],
  methods: {
    toggle() {
      this.$emit('toggle');
    }
  }
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-main;
  border: rem(1) solid $border-main;
  border-radius: rem(4);
  overflow: hidden;
}

.sidebar-expanded {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  min-height: rem(42);
  padding: rem(10) rem(12);

  background: $bg-panel;
  border-bottom: rem(1) solid $border-main;

  .title {
    font-weight: 700;
    font-size: rem(14);
    color: $text-title;
    text-transform: uppercase;
    letter-spacing: rem(0.5);
  }

  .actions {
    display: flex;
    gap: rem(8);
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tree-section {
  flex: 0.45;
  overflow-y: auto;
  padding: rem(5);
}

.section-divider {
  height: rem(1);
  background: $border-main;
  flex-shrink: 0;
}

.list-section {
  display: flex;
  flex-direction: column;
  flex: 0.55;
  overflow: hidden;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: rem(4);
  color: $text-secondary;
  padding: rem(4);
  transition: all 0.2s;

  &:hover {
    background-color: $bg-hover;
    color: $text-primary;
  }

  i {
    font-size: rem(14);
  }
}

.sidebar-collapsed-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  cursor: pointer;
  background: $bg-hover;
  transition: background-color 0.2s;

  &:hover {
    background-color: $bg-hover-light;

    .vertical-text {
      color: $text-primary;
    }
  }

  .vertical-text {
    display: flex;
    align-items: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap;
    padding: rem(20) 0;
    font-size: rem(13);
    font-weight: 600;
    color: $text-muted;
    letter-spacing: rem(2);
  }
}
</style>
