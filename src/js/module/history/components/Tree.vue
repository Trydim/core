<template>
  <div class="tree-component-root" :class="{ 'is-loading': isLoading }">

    <LoaderSpinner v-if="isLoading"/>

    <div class="tree" v-else>
      <div v-if="treeData.length === 0" class="empty-message">
        {{ $t('History is empty') }}
      </div>

      <div v-for="node in treeData" :key="node.path" class="tree-branch">
        <div
          class="node-item"
          :class="[
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

  </div>
</template>

<script>
import LoaderSpinner from "./ui/LoaderSpinner.vue";

export default {
  name: 'Tree',
  components: {LoaderSpinner},
  emits: ['fileSelected', 'update:selectedPath'],
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
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
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.tree-component-root {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: rem(50);
  height: 100%;

  &.is-loading {
    align-items: center;
    justify-content: center;
  }
}

.tree {
  position: relative;
  width: 100%;
  font-size: rem(13);
  color: $text-primary;
  user-select: none;
}

.node-item {
  display: flex;
  align-items: center;
  padding: rem(4) rem(8);
  cursor: pointer;
  border: rem(1) solid transparent;
  border-radius: rem(2);

  &:hover {
    background-color: $bg-hover;
  }

  &.selected {
    background-color: $bg-active;
    border-color: $color-primary-border;
    color: $color-primary-text;
    font-weight: 500;
  }
}

.node-icon {
  margin-right: rem(6);
  font-size: rem(14);
  opacity: 0.8;
}

.node-name {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.children {
  margin-left: rem(10);
  border-left: rem(1) solid $border-light;
}

:deep(.child-nodes) {
  height: auto;
}

.empty-message {
  padding: rem(20);
  font-size: rem(13);
  color: $text-disabled;
  font-style: italic;
  text-align: center;
}
</style>
