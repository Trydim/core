<template>
  <div v-if="!filePath" class="empty-message">{{ $t('Select a file to view history') }}</div>
  <div v-else class="history-list">
    <h3>{{ $t('Change history')}}</h3>
    <ul v-if="history.length">
      <li
        v-for="entry in history"
        :key="entry.backupId"
        class="history-item"
        :class="{ 'active': selectedEntry?.backupId === entry.backupId }"
        @click="selectEntry(entry)"
      >
        <div class="date">{{ entry.createdAt }}</div>
        <div class="user"><strong>{{ entry.userLogin || $t('System') }}</strong></div>
        <div v-if="entry.note" class="note">{{ $t(entry.note) }}</div>
      </li>
    </ul>
    <div v-else class="empty-message">{{ $t('History is empty') }}</div>
  </div>
</template>

<script>
/**
 * @typedef {Object} BackupMeta
 * @property {string} backupId - Идентификатор бэкапа (формат: YYYYMMDD_HHMMSS_SSSSSS)
 * @property {string} file - Путь к файлу
 * @property {string} fileMd5 - MD5 хеш содержимого файла
 * @property {string} createdAt - Дата создания в формате DD.MM.YYYY HH:mm:ss
 * @property {number} timestamp - UNIX timestamp создания
 * @property {number} userId - ID пользователя
 * @property {string} userName - Полное имя пользователя
 * @property {string} userLogin - Логин пользователя
 * @property {string} prevBackupId - Идентификатор предыдущего бэкапа
 */

/**
 * @typedef {Object} DiffObject
 * @property {string} currentContent - Текущее содержимое CSV файла
 * @property {BackupMeta} currentMeta - Метаданные текущей версии
 * @property {string} previousContent - Предыдущее содержимое CSV файла
 * @property {BackupMeta} previousMeta - Метаданные предыдущей версии
 */

/**
 * @typedef {Object} DiffApiResponse
 * @property {boolean} status - Статус выполнения запроса
 * @property {DiffObject} [diff] - Объект с данными для сравнения версий
 */

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
      const response = await f.Post({data: {
        mode: 'DB',
        dbAction: 'loadHistory',
        relativePath: path,
      }});

      this.history = response.status ? response['history'] : [];
    },

    async selectEntry(entry) {
      this.selectedEntry = entry;
      await this.fetchDiff(entry);
      this.$emit('entrySelected', this.diff);
    },

    async fetchDiff(entry) {
      const response = /** @type {DiffApiResponse} */ await f.Post({data: {
        mode: 'DB',
        dbAction: 'loadHistoryBackup',
        backupId: entry.backupId,
        relativePath: this.filePath,
      }});

      if (response?.diff?.previousContent && response?.diff?.currentContent) {
        this.diff = {
          ...csvDiff(response.diff.previousContent, response.diff.currentContent),
          currentMeta: response.diff?.currentMeta ?? {},
          previousMeta: response.diff?.previousMeta ?? {}
        }
      } else {
        this.diff = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import './../../../../css/mixin/functions.scss';

.history-list {
  width: 100%;
  max-width: rem(550);
  padding: rem(10);
}

h3 {
  margin-bottom: rem(10);
  font-size: rem(18);
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
  margin-bottom: rem(20);
}

.history-item {
  padding: rem(8);
  margin-bottom: rem(6);
  background: #f9f9f9;
  border-radius: 6px;
  border-left: rem(4) solid #42b983;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background-color: #eefaf3;
}

.history-item.active {
  background-color: #e0f7e9;
  border-left: 4px solid #2c8a5e;
  box-shadow: 0 rem(2) rem(4) rgba(0, 0, 0, 0.1);
}

.date {
  font-size: rem(14);
  color: #555;
}

.user {
  font-size: rem(16);
  color: #222;
}

.note {
  font-size: rem(13);
  color: #888;
  margin-top: rem(4);
}

.empty-message {
  padding: rem(20);
  color: #888;
  font-style: italic;
}
</style>
