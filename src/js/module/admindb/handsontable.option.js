"use strict";

const addSlashes = value => value.replaceAll('\n', '\\n').replaceAll('\r', '\\r');
const removeSlashes = value => value.replaceAll('\\n', '\n').replaceAll('\\r', '\r');

const changeRowCol = that => !that.tableChanged && (that.tableChanged = true) && that.admindb.enableBtnSave();
/*
const options = {
  col: [],
  option: [],
}*/

export const handson = {
  option: {
    rowHeaders        : true,
    colHeaders        : true, //filters   : true,
    columnSorting     : false,
    dropdownMenu      : true,
    contextMenu       : true,
    manualColumnResize: true,
    manualRowResize   : true,
    stretchH          : 'all',
    width             : '100%',
    height            : window.innerHeight * 0.8,
    licenseKey        : 'non-commercial-and-evaluation',
    hiddenRows        : {rows: [0, 1]}, // Не показывать заголовок

    // Перебор всех ячеек
    cells(row, col) {
      //console.log(this.instance.getSelected() && this.instance.getSelected()[0]);
      if (row === 0 || this.hasOwnProperty('readOnly')) return; // Первую строку пропускаем
      const cell = this.instance.getDataAtCell(row, col), res = {};

      /*if (options.col.includes(col)) {
        res.editor = 'select';
        res.selectOptions = options.option[0];
      }*/
      if (!cell) return res;

      /*if (cell.includes('c_selectOption_')) {
        options.col.push(this.instance.getData()[0].indexOf(cell.replace('c_selectOption_', '')));
        options.option.push(this.instance.getDataAtCell(row, 1).split(','));
        return; // как-то скрыть строку
      }*/

      res.readOnly = /^(c_|d_)/i.test(cell);
      if (cell === '+' || cell === '-') {
        res.type = 'checkbox';
        res.checkedTemplate = '+';
        res.uncheckedTemplate = '-';
      }
      else res.type = isFinite(cell.replace(',', '.')) ? 'numeric' : 'text';

      return res;
    },



    afterChange(changes) {
      if (changes) {
        for (const [row, column, oldValue, newValue] of changes) {
          if (oldValue !== newValue) {
            if (this.getColHeader(column).includes('template')) this.admindb.checkTemplate(newValue);
            this.admindb.enableBtnSave();
            !this.tableChanged && (this.tableChanged = true);
          }
        }
      }
    },

    afterCreateCol() { changeRowCol(this) },
    afterCreateRow() { changeRowCol(this) },
    afterRemoveCol() { changeRowCol(this) },
    afterRemoveRow() { changeRowCol(this) },
  },

  context: {
    contextMenu: {
      items: {
        "row_above" : {name: 'Добавить строку выше'},
        "row_below" : {name: 'Добавить строку ниже'},
        "hsep1"     : "---------",
        "col_left"  : {name: 'Добавить колонку слева'},
        "col_right" : {name: 'Добавить колонку справа'},
        "hsep2"     : "---------",
        "remove_row": {name: 'Удалить строку'},
        "remove_col": {name: 'Удалить колонку'},
        "hsep3"     : "---------",
        "undo"      : {name: 'Отменить'},
        "redo"      : {name: 'Вернуть'}
      },
    },
  },

  removeSlashesData(data) {
    data.length && (data = data.map(row => row.map(cell => cell && removeSlashes(cell))));
    return data;
  },

  addSlashesData(data) {
    data.length && (data = data.map(row => row.map(cell => typeof cell === 'string' ? addSlashes(cell) : cell)));
    return data;
  },
};
