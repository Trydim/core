import { parseCsvLine } from "./csvParser.js";

/**
 * Формирует данные для попапа с деталями строки
 * @param {Object} cellData - Объект ячейки (left/right из diff)
 * @param {String} fullContent - Полный текст файла (CSV)
 * @returns {Array|null} Массив объектов {label, value} или null
 */
export function getRowDetailsData(cellData, fullContent) {

  if (!cellData || !cellData.num || !fullContent) return null;
  const allLines = fullContent.split(/\r?\n/);
  if (allLines.length === 0) return null;

  // Первая строка - заголовки
  const headers = parseCsvLine(allLines[0]);

  // Искомая строка (num - 1, т.к. нумерация с 1)
  const rawLine = allLines[cellData.num - 1];

  if (!rawLine) return null;

  const values = parseCsvLine(rawLine);

  return headers.map((header, index) => ({
    label: header || `Column ${index + 1}`,
    value: values[index] !== undefined ? values[index] : ''
  }));
}
