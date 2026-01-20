
/**
 * @typedef {Object} TreeNode
 * @property {string} name - Имя файла или папки
 * @property {string} path - Относительный путь
 * @property {boolean} isFile - Флаг, является ли узел файлом
 * @property {TreeNode[]} [children] - Дочерние элементы (если папка)
 */

/**
 * @typedef {Object} HistoryTreeResponse
 * @property {boolean} status - Успешность запроса
 * @property {TreeNode[]} [historyTree] - Дерево файлов и папок
 * @property {string} [error] - Сообщение об ошибке (если есть)
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {string} backupId - Уникальный ID бэкапа (timestamp)
 * @property {string} createdAt - Дата создания
 * @property {string} userLogin - Логин пользователя
 * @property {string} [note] - Примечание к версии
 * @property {number} [userId] - ID пользователя
 */

/**
 * @typedef {Object} HistoryListResponse
 * @property {boolean} status - Успешность запроса
 * @property {HistoryEntry[]} [history] - Список версий файла
 */

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
 * @typedef {Object} DiffData
 * @property {string} previousContent - CSV контент предыдущей версии
 * @property {string} currentContent - CSV контент текущей (запрашиваемой) версии
 * @property {BackupMeta} previousMeta - Метаданные предыдущей версии
 * @property {BackupMeta} currentMeta - Метаданные текущей версии
 */

/**
 * @typedef {Object} HistoryBackupResponse
 * @property {boolean} status - Успешность запроса
 * @property {DiffData} [diff] - Данные для сравнения версий
 */

/**
 * Загружает дерево истории изменений (список файлов и папок).
 * @returns {Promise<HistoryTreeResponse>} Promise с деревом файлов.
 */
export async function loadHistoryTree() {
  return await f.Post({
    data: { mode: 'DB', dbAction: 'loadHistoryTree' }
  });
}

/**
 * Загружает список версий (историю) для конкретного файла.
 * @param {string} relativePath - Относительный путь к файлу.
 * @returns {Promise<HistoryListResponse>} Promise со списком записей истории.
 */
export async function loadHistory(relativePath) {
  return await f.Post({
    data: {
      mode: 'DB',
      dbAction: 'loadHistory',
      relativePath
    }
  });
}

/**
 * Загружает контент конкретного бэкапа для сравнения с предыдущей версией.
 * @param {string} backupId - Идентификатор бэкапа.
 * @param {string} relativePath - Относительный путь к файлу.
 * @returns {Promise<HistoryBackupResponse>} Promise с контентом и метаданными для diff.
 */
export async function loadHistoryBackup(backupId, relativePath) {
  return await f.Post({
    data: {
      mode: 'DB',
      dbAction: 'loadHistoryBackup',
      backupId,
      relativePath
    }
  });
}
