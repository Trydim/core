<template>
  <div class="history-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }" :style="cssVars">

    <div class="sidebar-column">

      <div class="sidebar-content" v-show="!isSidebarCollapsed">
        <slot name="sidebar" :collapse="collapseSidebar"></slot>
      </div>

      <div
        v-if="isSidebarCollapsed"
        class="collapsed-placeholder"
        @click="isSidebarCollapsed = false"
        :title="$t('Expand panel')"
      >
        <div class="vertical-text">{{ $t('Show history panel') }} &raquo;</div>
      </div>
    </div>

    <div class="diff-column">
      <TableDiff
        v-if="currentDiff"
        :diff="currentDiff"
        :isSidebarCollapsed="isSidebarCollapsed"
        @toggle-sidebar="isSidebarCollapsed = $event"
        @open-settings="showSettings = true"
      />

      <div class="diff-container empty" v-else>
        <div class="empty-text">{{ $t('Select a version to compare') }}</div>
      </div>
    </div>

    <SettingsModal
      :visible="showSettings"
      :current-settings="settings"
      @close="showSettings = false"
      @save="applyNewSettings"
      @reset="resetSettings"
    />

  </div>
</template>

<script>
import TableDiff from './TableDiff.vue';
import SettingsModal from './SettingsModal.vue';

const DEFAULT_SETTINGS = {
  insertedBg: '#e6ffec',
  deletedBg: '#ffebe9',
  changedBg: '#edfeff',
  normalColor: '#999999',
  chunkAddBg: '#abf2bc',
  chunkDelBg: '#ffc0c0',
};

export default {
  name: 'HistoryLayout',
  components: {TableDiff, SettingsModal},
  props: {
    currentDiff: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isSidebarCollapsed: false,
      showSettings: false,
      settings: {...DEFAULT_SETTINGS}
    };
  },
  computed: {
    cssVars() {
      return {
        '--diff-inserted-bg': this.settings.insertedBg,
        '--diff-deleted-bg': this.settings.deletedBg,
        '--diff-changed-bg': this.settings.changedBg,
        '--diff-normal-color': this.settings.normalColor,
        '--diff-chunk-add-bg': this.settings.chunkAddBg,
        '--diff-chunk-del-bg': this.settings.chunkDelBg,
      };
    }
  },
  methods: {
    collapseSidebar() {
      this.isSidebarCollapsed = true;
    },

    loadSettings() {
      const stored = localStorage.getItem('history-settings');
      if (stored) {
        try {
          this.settings = {...DEFAULT_SETTINGS, ...JSON.parse(stored)};
        } catch (e) {
          console.error(e);
        }
      }
    },
    applyNewSettings(newSettings) {
      this.settings = {...newSettings};
      localStorage.setItem('history-settings', JSON.stringify(this.settings));
      this.showSettings = false;
    },
    resetSettings() {
      this.settings = {...DEFAULT_SETTINGS};
      localStorage.removeItem('history-settings');
      this.showSettings = false;
    }
  },
  mounted() {
    this.loadSettings();
  }
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.history-layout {
  display: grid;
  grid-template-columns: rem(360) 1fr;
  gap: rem(15);
  height: 100%;
  transition: grid-template-columns 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

  &.sidebar-collapsed {
    grid-template-columns: rem(40) 1fr;
  }
}

.sidebar-column {
  grid-column: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  height: 100%;
  overflow: hidden;
}

.diff-column {
  grid-column: 2;
  overflow: hidden;
  height: 100%;

  .diff-container.empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    color: $text-disabled;
    background: $bg-main;
    border: 1px dashed $border-dash;
    border-radius: rem(4);
  }
}

.collapsed-placeholder {
  height: 100%;
  background: $bg-panel;
  border: 1px solid $border-main;
  border-radius: rem(4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: $bg-hover-light;

    .vertical-text {
      color: $text-primary;
    }
  }

  .vertical-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap;
    font-size: rem(12);
    font-weight: 600;
    color: $text-muted;
    letter-spacing: 2px;
  }
}
</style>
