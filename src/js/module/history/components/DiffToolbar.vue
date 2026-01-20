<template>
  <div class="diff-toolbar">

    <div class="options">
      <label>
        <input
          type="checkbox"
          class="form-check-input"
          :checked="showOnlyChanges"
          @change="$emit('update:showOnlyChanges', $event.target.checked)"
        />
        {{ $t('Show only changed rows') }}
      </label>

      <label class="ms-4">
        <input
          type="checkbox"
          class="form-check-input"
          :checked="syncScroll"
          @change="$emit('update:syncScroll', $event.target.checked)"
        />
        {{ $t('Synchronize scrolling') }}
      </label>
    </div>

    <div class="actions">

      <button
        class="icon-btn"
        @click="$emit('update:isVertical', !isVertical)"
        :title="isVertical ? $t('Switch to horizontal split') : $t('Switch to vertical split')"
      >
        <i class="pi" :class="isVertical ? 'pi-arrows-h' : 'pi-arrows-v'"></i>
      </button>

      <button
        class="icon-btn"
        @click="$emit('toggle-sidebar', !isSidebarCollapsed)"
        :title="isSidebarCollapsed ? $t('Show sidebar') : $t('Hide sidebar')"
        :class="{ 'active': isSidebarCollapsed }"
      >
        <i class="pi" :class="isSidebarCollapsed ? 'pi-window-maximize' : 'pi-window-minimize'"></i>
      </button>

      <button
        class="icon-btn"
        @click="$emit('open-settings')"
        :title="$t('Settings')"
      >
        <i class="pi pi-cog"></i>
      </button>

    </div>
  </div>
</template>

<script>
export default {
  name: 'DiffToolbar',
  props: {
    showOnlyChanges: Boolean,
    syncScroll: Boolean,
    isVertical: Boolean,
    isSidebarCollapsed: Boolean
  },
  emits: [
    'update:showOnlyChanges',
    'update:syncScroll',
    'update:isVertical',
    'toggle-sidebar',
    'open-settings'
  ]
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.diff-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  margin-bottom: rem(10);
}

.options {
  display: flex;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    font-size: rem(13);
    color: $text-primary;
  }

  .form-check-input {
    margin-right: rem(6);
    cursor: pointer;
  }

  .ms-4 {
    margin-left: rem(20);
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: rem(8);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: rem(32);
  height: rem(32);
  cursor: pointer;

  background: $bg-main;
  border: rem(1) solid $border-main;
  border-radius: rem(4);
  color: $text-secondary;

  transition: all 0.2s;

  i {
    font-size: rem(14);
    font-weight: bold;
  }

  &:hover {
    background: $bg-hover;
    color: $text-primary;
    border-color: $border-main;
  }

  &:active {
    background: $bg-hover-light;
  }

  &.active {
    background: $bg-active;
    border-color: $color-primary;
    color: $color-primary;
  }
}
</style>
