"use strict";

const addSlashes = (value) => value.replaceAll('\n', '\\n').replaceAll('\r', '\\r');
const removeSlashes = (value) => value.replaceAll('\\n', '\n').replaceAll('\\r', '\r');

const changeRowCol = (that) => !that.tableChanged && (that.tableChanged = true) && that.admindb.enableBtnSave();

export const handson = {
  option: {
    rowHeaders        : true,
    colHeaders        : true, //filters   : true,
    dropdownMenu      : true,
    contextMenu       : true,
    manualColumnResize: true,
    manualRowResize   : true,
    stretchH          : 'all',
    width             : '100%',
    height            : 900,
    licenseKey        : 'non-commercial-and-evaluation',

    afterChange(changes) {
      if (!this.tableChanged && changes) {
        for (const [row, prop, oldValue, newValue] of changes) {
          if (oldValue !== newValue) {
            this.admindb.enableBtnSave();
            this.tableChanged = true;
            break;
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
    data.length && (data = data.map(row => row.map(cell => cell && addSlashes(cell))));
    return data;
  },
};
