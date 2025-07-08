<template>
  <div v-if="!filePath" class="empty-message">{{ $t('Выберите файл, чтобы посмотреть историю.') }}</div>
  <div v-else class="history-list">
    <h3>{{ $t('История изменений')}}</h3>
    <ul v-if="history.length">
      <li
        v-for="entry in history"
        :key="entry.backupId"
        class="history-item"
        :class="{ 'active': selectedEntry?.backupId === entry.backupId }"
        @click="selectEntry(entry)"
      >
        <div class="date">{{ entry.createdAt }}</div>
        <div class="user"><strong>{{ entry.userLogin || $t('Система') }}</strong></div>
        <div v-if="entry.note" class="note">{{ $t(entry.note) }}</div>
      </li>
    </ul>
    <div v-else class="empty-message">{{ $t('История пуста') }}</div>
  </div>
</template>

<script>
import {csvDiff} from '../utils/csvDiff.js';

export default {
  name: 'List',
  props: {
    filePath: String
  },
  emits: ['entrySelected'],
  data() {
    return {
      history: [],
      diff: null,
      selectedEntry: null
    };
  },
  watch: {
    filePath: {
      immediate: true,
      handler(newPath) {
        if (newPath) {
          this.diff = null;
          this.selectedEntry = null;
          this.fetchHistory(newPath);
        }
      }
    }
  },
  methods: {
    async fetchHistory(path) {
      const data = new FormData();
      data.set('mode', 'DB');
      data.set('dbAction', 'getCsvHistory');
      data.set('relativePath', path);


      const response = await f.Post({data});
      if (response.status) {
        this.history = response.history;
      } else {
        this.history = [];
      }

    },

    async selectEntry(entry) {
      this.selectedEntry = entry;
      await this.fetchDiff(entry);
      this.$emit('entrySelected', this.diff);
    },

    async fetchDiff(entry) {
      const data = new FormData();
      data.set('mode', 'DB');
      data.set('dbAction', 'getCsvBackupForDiff');
      data.set('backupId', entry.backupId);
      data.set('relativePath', this.filePath);

      const response = await f.Post({data});

      if (response?.diff?.previousContent && response?.diff?.currentContent) {
        this.diff = csvDiff(response.diff.previousContent, response.diff.currentContent);
      } else {
        this.diff = null;
      }
    }
  }
};
</script>

<style scoped>
.history-list {
  width: 100%;
  max-width: 550px;
  padding: 10px;
}

h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.history-item {
  padding: 8px;
  margin-bottom: 6px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #42b983;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background-color: #eefaf3;
}

.history-item.active {
  background-color: #e0f7e9;
  border-left: 4px solid #2c8a5e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date {
  font-size: 14px;
  color: #555;
}

.user {
  font-size: 16px;
  color: #222;
}

.note {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}

.empty-message {
  padding: 20px;
  color: #888;
  font-style: italic;
}
</style>
