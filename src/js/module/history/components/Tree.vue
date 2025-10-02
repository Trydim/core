<template>
  <div class="tree">
    <div v-if="treeData.length === 0" class="empty-message">
      {{ $t('История пуста') }}
    </div>

    <div v-for="node in treeData" :key="node.path" class="tree-node">
      <div
        class="node-item"
        :class="[
          node.isFile ? 'is-file' : 'is-folder',
          selectedPath === node.path ? 'selected' : ''
        ]"
        @click="handleClick(node)"
      >
        <span class="node-icon">
          {{ node.isFile ? '📄' : (node.isOpen ? '📂' : '📁') }}
        </span>
        <span class="node-name">{{ $t(node.name) }}</span>
      </div>

      <div v-if="hasChildren(node)" class="children">
        <Tree
          :treeData="node.children"
          :selectedPath="selectedPath"
          @fileSelected="$emit('fileSelected', $event)"
          @update:selectedPath="$emit('update:selectedPath', $event)"
          class="child-nodes"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tree',
  props: {
    treeData: {
      type: Array,
      required: true
    },
    selectedPath: {
      type: String,
      default: null
    }
  },
  methods: {
    handleClick(node) {
      if (node.isFile) {
        this.$emit('update:selectedPath', node.path);
        this.$emit('fileSelected', node.path);
      } else {
        node.isOpen = !node.isOpen;
      }
    },
    hasChildren(node) {
      return node.children?.length > 0 && node.isOpen;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './../../../../css/mixin/functions.scss';

.tree {
  max-width: rem(400);
  user-select: none;

  .node-item {
    padding: rem(4) rem(8);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f0f0f0;
    }

    &.is-file {
      color: #333;
    }

    &.is-folder {
      font-weight: bold;
      color: #2c3e50;
    }

    &.selected {
      font-weight: bold;
      background-color: #e0f7e9;
    }
  }

  .node-icon {
    margin-right: rem(5);
  }

  .node-name {
    flex-grow: 1;
  }

  .children {
    border-left: 1px dashed #ccc;
    margin-left: rem(8);
  }

  .child-nodes {
    margin-left: rem(8);
  }

  .empty-message {
    padding: rem(20);
    color: #888;
    font-style: italic;
  }
}
</style>
