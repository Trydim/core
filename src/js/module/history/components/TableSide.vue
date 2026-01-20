<template>
  <div class="side-wrapper">
    <div class="side-header">
      <div class="header-info">
        <div class="title">{{ title }}</div>
        <div class="meta" v-if="meta">
          {{ meta.createdAt }} • {{ meta.userLogin || 'System' }}
        </div>
      </div>

      <button
        v-if="content"
        class="download-btn"
        @click="downloadFile"
        :title="$t('Download original CSV')"
      >
        <i class="pi pi-download"></i>
      </button>
    </div>

    <div
      class="side-scroll-area"
      ref="scrollContainer"
      @scroll="onScroll"
    >
      <div class="text-body">
        <template v-for="(row, idx) in rows" :key="idx">

          <div v-if="row.isSeparator" class="row-separator">
            ... {{ $t('hidden') }}: {{ row.count }} ...
          </div>

          <div v-else class="text-row" :class="getRowClass(row)">
            <div
              class="line-num clickable"
              @click="handleRowClick(row, $event)"
              :title="$t('Click to view details')"
            >
              {{ getCellData(row).num || '' }}
            </div>

            <div class="line-text">
              <template v-if="getCellData(row).parts">
                 <span
                   v-for="(part, pIdx) in getCellData(row).parts"
                   :key="pIdx"
                   :class="part.type"
                 >{{ part.value }}</span>
              </template>
              <template v-else>{{ getCellData(row).value }}</template>
            </div>
          </div>

        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {getRowDetailsData} from "../utils/rowDetails.js";

export default {
  name: 'TableSide',
  props: {
    rows: {type: Array, required: true},
    content: {type: String, default: null},
    side: {type: String, required: true},
    title: {type: String, default: ''},
    meta: {type: Object, default: null}
  },
  emits: ['scroll', 'request-details'],
  methods: {
    getCellData(row) {
      return this.side === 'left' ? row.left : row.right;
    },
    getRowClass(row) {
      return this.getCellData(row).type;
    },
    onScroll(event) {
      this.$emit('scroll', {
        top: event.target.scrollTop,
        left: event.target.scrollLeft
      });
    },
    setScrollPosition(top, left) {
      const el = this.$refs.scrollContainer;
      if (el) {
        el.scrollTop = top;
        el.scrollLeft = left;
      }
    },
    downloadFile() {
      if (!this.content) return;
      let filename = 'backup.csv';
      if (this.meta && this.meta.backupId) {
        const originalName = this.meta.file ? this.meta.file.split(/[\\/]/).pop() : 'file';
        filename = `${originalName}_${this.meta.backupId}.csv`;
      }
      const blob = new Blob([this.content], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    handleRowClick(row, event) {
      const cellData = this.getCellData(row);
      const details = getRowDetailsData(cellData, this.content);

      if (details) {
        this.$emit('request-details', {
          lineNum: cellData.num,
          data: details,
          x: event.clientX,
          y: event.clientY,
          // заголовок стороны
          sourceTitle: this.title
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.side-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background: $bg-main;
  border-right: rem(1) solid $border-main;

  &:last-child {
    border-right: none;
  }
}

.side-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
  padding: rem(8) rem(12);

  background: $bg-panel;
  border-bottom: rem(1) solid $border-main;

  .header-info {
    flex-grow: 1;
    overflow: hidden;
  }

  .title {
    margin-bottom: rem(2);
    font-weight: 600;
    font-size: rem(13);
    color: $text-title;
  }

  .meta {
    font-size: rem(11);
    color: $text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: rem(10);
  cursor: pointer;
  background: none;
  border: rem(1) solid transparent;
  border-radius: rem(4);
  color: $text-muted;
  padding: rem(4);
  transition: all 0.2s;

  i {
    font-size: rem(14);
  }

  &:hover {
    background-color: $bg-hover;
    border-color: $border-main;
    color: $text-primary;
  }
}

.side-scroll-area {
  flex: 1;
  overflow: auto;
  position: relative;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.text-body {
  display: flex;
  flex-direction: column;
  min-width: min-content;
}

.text-row {
  position: relative;

  display: flex;
  height: rem(20);
  line-height: rem(20);
  font-size: rem(12);
  white-space: pre;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }

  &.normal {
    .line-text {
      color: var(--diff-normal-color, $diff-normal-color);
    }

    .line-num {
      color: $text-disabled;
      background: $bg-main;
    }
  }

  &.inserted {
    background-color: var(--diff-inserted-bg, $diff-inserted-bg);

    .line-text {
      color: var(--diff-inserted-color, #111);
    }
  }

  &.deleted {
    background-color: var(--diff-deleted-bg, $diff-deleted-bg);

    .line-text {
      color: var(--diff-deleted-color, #111);
    }
  }

  &.changed {
    background-color: var(--diff-changed-bg, $diff-changed-bg);

    .line-text {
      color: var(--diff-changed-color, #111);
    }
  }

  &.empty {
    background-color: $bg-empty;
  }

  .line-num {
    flex-shrink: 0;
    width: rem(40);
    padding-right: rem(8);
    text-align: right;
    user-select: none;

    background: $bg-panel;
    border-right: rem(1) solid $border-light;
    color: $text-disabled;

    position: sticky;
    left: 0;
    z-index: 2;

    &.clickable {
      cursor: pointer;

      &:hover {
        background-color: $bg-hover;
        color: $color-primary-text;
      }
    }
  }

  .line-text {
    padding-left: rem(8);
    flex-grow: 1;
    color: $text-primary;
  }
}

.add-chunk {
  background-color: var(--diff-chunk-add-bg, $diff-chunk-add-bg);
  color: #000;
}

.del-chunk {
  background-color: var(--diff-chunk-del-bg, $diff-chunk-del-bg);
  color: $text-secondary;
  text-decoration: line-through;
}

.row-separator {
  height: rem(20);
  display: flex;
  align-items: center;
  justify-content: center;

  background: $bg-separator;
  border-top: rem(1) dashed $border-dash;
  border-bottom: rem(1) dashed $border-dash;

  font-size: rem(11);
  color: $text-disabled;
  font-style: italic;
  user-select: none;
}
</style>
