<template>
  <div v-if="!filePath" class="empty-message">{{ $t('Select a file to view history') }}</div>
  <div v-else class="history-list-wrapper">
    <div class="list-header">
      <h3>{{ $t('Change history') }}</h3>
    </div>
    <div class="list-content">
      <ul v-if="history.length">
        <li
          v-for="entry in history"
          :key="entry.backupId"
          class="history-item"
          :class="{ 'active': selectedEntry?.backupId === entry.backupId }"
          @click="selectEntry(entry)"
        >
          <div class="item-main">
            <span class="date">{{ entry.createdAt }}</span>
            <span class="user">{{ entry.userLogin || $t('System') }}</span>
          </div>
          <div v-if="entry.note" class="note">{{ $t(entry.note) }}</div>
        </li>
      </ul>
      <div v-else class="empty-message">{{ $t('History is empty') }}</div>
    </div>
  </div>
</template>

<script>
import { loadHistory, loadHistoryBackup } from '../api/historyApi.js';

export default {
  name: 'List',
  props: {
    filePath: String
  },
  emits: ['entrySelected'],
  data() {
    return {
      history: [],
      selectedEntry: null
    };
  },
  watch: {
    filePath: {
      immediate: true,
      handler(newPath) {
        if (newPath) {
          this.selectedEntry = null;
          this.fetchHistory(newPath);
        }
      }
    }
  },
  methods: {
    async fetchHistory(path) {
      this.history = [];
      try {
        const response = await loadHistory(path);
        if (response.status && Array.isArray(response.history)) {
          this.history = response.history;
        }
      } catch (e) {
        console.error("Failed to load history list:", e);
      }
    },

    async selectEntry(entry) {
      if (this.selectedEntry?.backupId === entry.backupId) return;

      this.selectedEntry = entry;
      await this.fetchDiff(entry);
    },

    async fetchDiff(entry) {
      try {
        const response = await loadHistoryBackup(entry.backupId, this.filePath);

        if (response.status && response.diff) {
          const { previousContent, currentContent, currentMeta, previousMeta } = response.diff;

          this.$emit('entrySelected', {
            previousContent: previousContent ?? '',
            currentContent: currentContent ?? '',
            currentMeta: currentMeta ?? {},
            previousMeta: previousMeta ?? {}
          });
        }
      } catch (e) {
        console.error("Failed to load diff:", e);
      }
    }
  }
};

</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.history-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: rem(8) rem(12);

  background: $bg-panel;
  border-bottom: rem(1) solid $border-main;

  h3 {
    margin: 0;
    font-size: rem(13);
    font-weight: 600;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: rem(0.5);
  }
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: rem(8) rem(12);
  cursor: pointer;
  background-color: transparent;
  border-bottom: rem(1) solid $border-light;
  border-left: rem(3) solid transparent;
  transition: background-color 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: $bg-hover;
  }

  &.active {
    background-color: $bg-active;
    border-left-color: $color-primary;

    .date {
      color: #000;
      font-weight: 500;
    }
  }
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(2);
}

.date {
  font-size: rem(13);
  color: $text-primary;
}

.user {
  font-size: rem(12);
  font-weight: 600;
  color: $text-secondary;
  background: $bg-hover;
  padding: rem(1) rem(6);
  border-radius: rem(3);
}

.note {
  font-size: rem(12);
  color: $text-muted;
  margin-top: rem(2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-message {
  padding: rem(20);
  color: $text-disabled;
  font-size: rem(13);
  font-style: italic;
  text-align: center;
}
</style>
