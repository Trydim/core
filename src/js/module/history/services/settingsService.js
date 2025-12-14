const STORAGE_KEY = 'history-settings';
export const DEFAULT_SETTINGS = {
  insertedBg: '#e6ffec',
  deletedBg: '#ffebe9',
  changedBg: '#edfeff',
  normalColor: '#999999',
  chunkAddBg: '#abf2bc',
  chunkDelBg: '#ffc0c0',
};
export function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse history settings', e);
    }
  }
  return { ...DEFAULT_SETTINGS };
}
export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}
