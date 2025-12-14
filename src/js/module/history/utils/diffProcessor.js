/**
 Фильтрует строки diff, оставляя только изменения + контекст
 @param {Array} rawRows - Все строки
 @param {Boolean} showOnlyChanges - Флаг фильтрации
 @param {Number} contextLines - Количество строк контекста
 @returns {Array} Отфильтрованный массив строк с разделителями
 */
export function getProcessedRows(rawRows, showOnlyChanges, contextLines = 3) {
  if (!showOnlyChanges) return rawRows;
  const result = [];
  const total = rawRows.length;
  const visibleIndices = new Set();
  // Определяем индексы строк, которые нужно показать (измененные + соседи)
  for (let i = 0; i < total; i++) {
    if (rawRows[i].type !== 'normal') {
      for (let j = Math.max(0, i - contextLines); j <= Math.min(total - 1, i + contextLines); j++) {
        visibleIndices.add(j);
      }
    }
  }
  // Собираем итоговый массив, вставляя сепараторы
  let hiddenCount = 0;
  for (let i = 0; i < total; i++) {
    if (visibleIndices.has(i)) {
      if (hiddenCount > 0) {
        result.push({isSeparator: true, count: hiddenCount});
        hiddenCount = 0;
      }
      result.push(rawRows[i]);
    } else {
      hiddenCount++;
    }
  }
  // Обработка хвоста
  if (hiddenCount > 0) result.push({isSeparator: true, count: hiddenCount});
  // Если вообще все скрыто, но строки были
  if (result.length === 0 && rawRows.length > 0) {
    result.push({isSeparator: true, count: rawRows.length});
  }
  return result;
}
