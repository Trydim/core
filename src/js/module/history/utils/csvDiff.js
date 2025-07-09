/**
 * Сравнивает две CSV строки и возвращает разницу между ними в структурированном виде
 * @typedef {Object} CellDiff
 * @property {string} value - Значение ячейки
 * @property {'line-number'|'changed-old'|'changed-new'|'normal'|'empty'|'inserted'|'deleted'} status - Статус ячейки
*/

/** @typedef {Object} RowDiff
 * @property {CellDiff[]} left - Ячейки левой (старой) версии
 * @property {CellDiff[]} right - Ячейки правой (новой) версии
 *
*/

/**
 * @typedef {Object} CsvDiffResult
 * @property {string[]} columns - Заголовки столбцов (первый элемент - "№ строки")
 * @property {RowDiff[]} rows - Массив строк с различиями
*/

/**
 * @param {string} oldCsv - Исходная CSV строка
 * @param {string} newCsv - Новая CSV строка для сравнения
 * @param {string} [separator=';'] - Разделитель столбцов в CSV
 * @returns {CsvDiffResult} Объект с результатами сравнения CSV
 */

export function csvDiff(oldCsv, newCsv, separator = ';') {
  const parse = (text) => {
    const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd());
    if (lines.length === 0 || lines[0].trim() === '') return { headers: [], rows: [] };

    const headers = lines[0].split(separator).map(h => h.trim());
    const rows = lines.slice(1).map((line, i) => {
      const cells = line.split(separator).map(cell => cell.trim());
      while (cells.length < headers.length) cells.push('');
      return { cells, lineNumber: i + 1 };
    });

    return { headers, rows };
  };

  const old = parse(oldCsv);
  const current = parse(newCsv);

  // Найти индекс колонки id (без учёта регистра), если нет — использовать 0
  const keyIndex = current.headers.findIndex(h => h.toLowerCase() === 'id');
  const finalKeyIndex = keyIndex >= 0 ? keyIndex : 0;

  const resultRowsWithLine = [];
  const matchedOldRows = new Set();

  const makeRowKey = (row) => {
    const id = row.cells[finalKeyIndex]?.trim();
    if (id) return `id:${id}`;
    return 'row:' + row.cells.map(cell => cell.trim().toLowerCase()).join('|');
  };

  const oldRowMap = new Map();
  old.rows.forEach((row, index) => {
    const key = makeRowKey(row);
    if (!oldRowMap.has(key)) oldRowMap.set(key, []);
    oldRowMap.get(key).push(index);
  });

  // Сопоставление и вставки
  for (let i = 0; i < current.rows.length; i++) {
    const newRow = current.rows[i];
    const key = makeRowKey(newRow);
    const oldIndices = oldRowMap.get(key);

    if (oldIndices && oldIndices.length > 0) {
      const oldIdx = oldIndices.shift();
      const oldRow = old.rows[oldIdx];
      matchedOldRows.add(oldIdx);

      const left = [{ value: oldRow.lineNumber, status: 'line-number' }];
      const right = [{ value: newRow.lineNumber, status: 'line-number' }];

      for (let c = 0; c < current.headers.length; c++) {
        const oldCell = oldRow.cells[c] ?? '';
        const newCell = newRow.cells[c] ?? '';

        if (oldCell !== newCell) {
          left.push({ value: oldCell, status: 'changed-old' });
          right.push({ value: newCell, status: 'changed-new' });
        } else {
          left.push({ value: oldCell, status: 'normal' });
          right.push({ value: newCell, status: 'normal' });
        }
      }

      resultRowsWithLine.push({ lineNumber: newRow.lineNumber, row: { left, right } });
    } else {
      // Вставленная строка
      const left = [{ value: '', status: 'line-number' }];
      const right = [{ value: newRow.lineNumber, status: 'line-number' }];

      for (let c = 0; c < current.headers.length; c++) {
        left.push({ value: '', status: 'empty' });
        right.push({ value: newRow.cells[c], status: 'inserted' });
      }

      resultRowsWithLine.push({ lineNumber: newRow.lineNumber, row: { left, right } });
    }
  }

  // Удалённые строки
  for (let i = 0; i < old.rows.length; i++) {
    if (!matchedOldRows.has(i)) {
      const oldRow = old.rows[i];

      const left = [{ value: oldRow.lineNumber, status: 'line-number' }];
      const right = [{ value: '', status: 'line-number' }];

      for (let c = 0; c < current.headers.length; c++) {
        left.push({ value: oldRow.cells[c], status: 'deleted' });
        right.push({ value: '', status: 'empty' });
      }

      resultRowsWithLine.push({ lineNumber: oldRow.lineNumber, row: { left, right } });
    }
  }

  // Сортировка по lineNumber
  resultRowsWithLine.sort((a, b) => a.lineNumber - b.lineNumber);

  return {
    columns: ['№ строки', ...current.headers],
    rows: resultRowsWithLine.map(item => item.row)
  };
}


