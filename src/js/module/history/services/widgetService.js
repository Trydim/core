/**
 Проверяет URL на наличие параметров для открытия виджета
 @returns {string|null} Возвращает путь к файлу или null
 */
export function checkWidgetUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tableName');
}
