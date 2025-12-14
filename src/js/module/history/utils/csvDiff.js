import * as Diff from 'diff';

/**
 * Нормализует текст
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // .replace(/[ \t]+$/gm, '') // игнорировать пробелы в конце строк
    ;
}

export function generateTextDiff(oldTextRaw, newTextRaw) {
  const oldText = normalizeText(oldTextRaw);
  const newText = normalizeText(newTextRaw);

  const lineChanges = Diff.diffLines(oldText, newText, {
    newlineIsToken: false, //сравниваем строки целиком
    ignoreWhitespace: true //игнорируем пробелы
  });

  const rows = [];
  let oldLineNumber = 1;
  let newLineNumber = 1;

  for (let i = 0; i < lineChanges.length; i++) {
    const change = lineChanges[i];
    let lines = change.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    // Блок изменений (Common)
    if (!change.added && !change.removed) {
      lines.forEach(line => {
        rows.push({
          type: 'normal',
          left: { num: oldLineNumber++, value: line, type: 'normal' },
          right: { num: newLineNumber++, value: line, type: 'normal' }
        });
      });
    }

    // Блок удалений (Removed)
    else if (change.removed) {
      const nextChange = lineChanges[i + 1];

      if (nextChange && nextChange.added) {
        let newLines = nextChange.value.split('\n');
        if (newLines[newLines.length - 1] === '') newLines.pop();

        const countCommon = Math.min(lines.length, newLines.length);

        for (let j = 0; j < countCommon; j++) {
          const oldL = lines[j];
          const newL = newLines[j];

          const charDiff = Diff.diffChars(oldL, newL);
          let leftParts = [];
          let rightParts = [];

          charDiff.forEach(part => {
            const type = part.added ? 'add-chunk' : (part.removed ? 'del-chunk' : 'normal');
            if (part.removed) leftParts.push({ value: part.value, type });
            else if (part.added) rightParts.push({ value: part.value, type });
            else {
              leftParts.push({ value: part.value, type });
              rightParts.push({ value: part.value, type });
            }
          });

          rows.push({
            type: 'changed',
            left: { num: oldLineNumber++, parts: leftParts, type: 'changed' },
            right: { num: newLineNumber++, parts: rightParts, type: 'changed' }
          });
        }

        // Если старых строк было больше (остаток удаляем)
        if (lines.length > countCommon) {
          for (let j = countCommon; j < lines.length; j++) {
            rows.push({
              type: 'deleted',
              left: { num: oldLineNumber++, value: lines[j], type: 'deleted' },
              right: { num: null, value: '', type: 'empty' } // Пустота справа
            });
          }
        }

        // Если новых строк больше (остаток вставляем)
        if (newLines.length > countCommon) {
          for (let j = countCommon; j < newLines.length; j++) {
            rows.push({
              type: 'inserted',
              left: { num: null, value: '', type: 'empty' }, // Пустота слева
              right: { num: newLineNumber++, value: newLines[j], type: 'inserted' }
            });
          }
        }

        i++;
      } else {
        // Просто удаление
        lines.forEach(line => {
          rows.push({
            type: 'deleted',
            left: { num: oldLineNumber++, value: line, type: 'deleted' },
            right: { num: null, value: '', type: 'empty' }
          });
        });
      }
    }

    // Блок добавлений
    else if (change.added) {
      // Просто вставка, слева рисуем пустоту
      lines.forEach(line => {
        rows.push({
          type: 'inserted',
          left: { num: null, value: '', type: 'empty' },
          right: { num: newLineNumber++, value: line, type: 'inserted' }
        });
      });
    }
  }

  return rows;
}

