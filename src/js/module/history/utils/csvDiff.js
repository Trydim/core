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
  // Функция очистки значения ячейки (без изменений)
  const cleanCell = (val) => {
    if (val === undefined || val === null) return '';
    return String(val)
      .replace(/\\r\\n|\\n|\\r|\r\n|\n|\r/g, '')
      .replace(/\\+/g, '')
      .replace(/""/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/^"+|"+$/g, '')
      .trim();
  };

  // Функция нормализации строки для сравнения (без изменений)
  const normalizeForCompare = (str) => {
    return cleanCell(str).toLowerCase().replace(/\s+/g, '');
  };

  // Парсинг CSV (без изменений)
  const parse = (text) => {
    const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd());
    if (lines.length === 0 || lines[0].trim() === '') return {headers: [], rows: []};

    const headers = lines[0].split(separator).map(h => h.trim());
    const rows = lines.slice(1).map((line, i) => {
      const cells = line.split(separator).map(cell => cleanCell(cell));
      while (cells.length < headers.length) cells.push('');
      return {cells, lineNumber: i + 1};
    });

    return {headers, rows};
  };

  // Проверка похожести строк (без изменений)
  const isRowsSimilar = (oldRow, newRow) => {
    const colsToCompare = Math.min(3, oldRow.cells.length, newRow.cells.length);
    for (let i = 0; i < colsToCompare; i++) {
      const oldVal = normalizeForCompare(oldRow.cells[i]);
      const newVal = normalizeForCompare(newRow.cells[i]);
      if (oldVal !== newVal) return false;
    }
    return true;
  };

  // Парсим оба CSV
  const old = parse(oldCsv);
  const current = parse(newCsv);

  // Создаем карты заголовков
  const oldHeaderIndexMap = Object.fromEntries(old.headers.map((name, idx) => [name, idx]));
  const currentHeaderIndexMap = Object.fromEntries(current.headers.map((name, idx) => [name, idx]));

  // Находим индекс колонки ID (если есть)
  const finalKeyIndex = current.headers.findIndex(h => h.toLowerCase() === 'id');
  const resultRowsWithLine = [];
  const matchedOldRows = new Set();

  // Функция создания ключа для строки (без изменений)
  const makeRowKey = (row) => {
    if (finalKeyIndex >= 0) {
      const id = row.cells[finalKeyIndex]?.trim();
      if (id) return `id:${id}`;
    }

    const keyParts = [];
    for (let i = 0; i < Math.min(3, row.cells.length); i++) {
      keyParts.push(normalizeForCompare(row.cells[i]));
    }
    return `name:${keyParts.join('|')}`;
  };

  // Создаем карту старых строк для быстрого поиска (без изменений)
  const oldRowMap = new Map();
  old.rows.forEach((row, index) => {
    const key = makeRowKey(row);
    if (!oldRowMap.has(key)) oldRowMap.set(key, []);
    oldRowMap.get(key).push(index);
  });

  // Обработка строк из новой версии
  for (let i = 0; i < current.rows.length; i++) {
    const newRow = current.rows[i];
    const key = makeRowKey(newRow);
    const oldIndices = oldRowMap.get(key);

    if (oldIndices && oldIndices.length > 0) {
      const oldIdx = oldIndices.shift();
      const oldRow = old.rows[oldIdx];
      matchedOldRows.add(oldIdx);

      const left = [{value: oldRow.lineNumber, status: 'line-number'}];
      const right = [{value: newRow.lineNumber, status: 'line-number'}];

      // Сравниваем все колонки из старой и новой версий
      const allHeaders = new Set([...old.headers, ...current.headers]);

      for (const colName of allHeaders) {
        const oldColExists = oldHeaderIndexMap.hasOwnProperty(colName);
        const newColExists = currentHeaderIndexMap.hasOwnProperty(colName);

        const oldCell = oldColExists ? oldRow.cells[oldHeaderIndexMap[colName]] : '';
        const newCell = newColExists ? newRow.cells[currentHeaderIndexMap[colName]] : '';

        if (!oldColExists && newColExists) {
          // Новая колонка
          left.push({value: '', status: 'empty'});
          right.push({value: newCell, status: 'inserted'});
        } else if (oldColExists && !newColExists) {
          // Удаленная колонка
          left.push({value: oldCell, status: 'deleted'});
          right.push({value: '', status: 'empty'});
        } else if (normalizeForCompare(oldCell) !== normalizeForCompare(newCell)) {
          // Измененная ячейка
          left.push({value: oldCell, status: 'changed-old'});
          right.push({value: newCell, status: 'changed-new'});
        } else {
          // Без изменений
          left.push({value: oldCell, status: 'normal'});
          right.push({value: newCell, status: 'normal'});
        }
      }

      resultRowsWithLine.push({lineNumber: newRow.lineNumber, row: {left, right}});
    } else {
      // Обработка новых строк (без изменений)
      let similarOldRow = null;
      if (finalKeyIndex < 0 || !newRow.cells[finalKeyIndex]?.trim()) {
        similarOldRow = old.rows.find((oldRow, idx) => (
          !matchedOldRows.has(idx) &&
          isRowsSimilar(oldRow, newRow)
        ));
      }

      if (similarOldRow) {
        const oldIdx = old.rows.indexOf(similarOldRow);
        matchedOldRows.add(oldIdx);

        const left = [{value: similarOldRow.lineNumber, status: 'line-number'}];
        const right = [{value: newRow.lineNumber, status: 'line-number'}];

        for (const colName of current.headers) {
          const oldColIdx = oldHeaderIndexMap[colName];
          const newColIdx = currentHeaderIndexMap[colName];

          const oldCell = oldColIdx !== undefined ? similarOldRow.cells[oldColIdx] : '';
          const newCell = newColIdx !== undefined ? newRow.cells[newColIdx] : '';

          if (normalizeForCompare(oldCell) !== normalizeForCompare(newCell)) {
            left.push({value: oldCell, status: 'changed-old'});
            right.push({value: newCell, status: 'changed-new'});
          } else {
            left.push({value: oldCell, status: 'normal'});
            right.push({value: newCell, status: 'normal'});
          }
        }

        resultRowsWithLine.push({lineNumber: newRow.lineNumber, row: {left, right}});
      } else {
        const left = [{value: '', status: 'line-number'}];
        const right = [{value: newRow.lineNumber, status: 'line-number'}];

        for (const colName of current.headers) {
          right.push({
            value: newRow.cells[currentHeaderIndexMap[colName]] || '',
            status: 'inserted'
          });
          left.push({value: '', status: 'empty'});
        }

        resultRowsWithLine.push({lineNumber: newRow.lineNumber, row: {left, right}});
      }
    }
  }

  // Удалённые строки (без изменений)
  for (let i = 0; i < old.rows.length; i++) {
    if (!matchedOldRows.has(i)) {
      const oldRow = old.rows[i];

      const left = [{value: oldRow.lineNumber, status: 'line-number'}];
      const right = [{value: '', status: 'line-number'}];

      for (const colName of current.headers) {
        const oldIdx = oldHeaderIndexMap[colName];
        left.push({
          value: oldIdx !== undefined ? oldRow.cells[oldIdx] : '',
          status: 'deleted'
        });
        right.push({value: '', status: 'empty'});
      }

      resultRowsWithLine.push({lineNumber: oldRow.lineNumber, row: {left, right}});
    }
  }

  // Сортируем по номеру строки
  resultRowsWithLine.sort((a, b) => a.lineNumber - b.lineNumber);

  // Формируем список всех колонок (старых и новых)
  const allColumns = ['№ строки', ...new Set([...old.headers, ...current.headers])];

  return {
    columns: allColumns,
    rows: resultRowsWithLine.map(r => r.row)
  };
}
