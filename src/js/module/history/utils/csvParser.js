/**
 * Разбивает CSV строку на массив значений
 */
export function parseCsvLine(line, separator = ';') {
  if (!line) return [];
  return line.split(separator).map(val => val.trim().replace(/^"|"$/g, ''));
}
