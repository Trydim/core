"use strict";

import {handson} from "./handsontable.option";
import {Main} from "./Main";

export class TableValues extends Main {
  constructor(tableType) {
    super();
    this.columns = Object.create(null);
    this.data = Object.create(null);
    this.showTable();
  }

  async showTable() {
    this.tableType = await this.dbAction('showTable');

    if (this.tableType === 'db') {
      f.hide(this.viewsField);
      this.showDbTable();
      this.onSave(this.saveDb);
    } else {
      f.show(this.viewsField);
      this.showCsvTable();
      this.onSave(this.saveCsv);
    }
    this.setTableName();
    this.loaderTable.stop();
  }


  checkInputValue(columnName, value) {
    let key = false, match = /(\D+)\((\d+)/g.exec(this.columns[columnName].type);
    if (match) {
      switch (match[1]) {
        case 'bit': break;
        case 'tinyint':
          key = (!isFinite(value) || (+value < 0 && +value > 255)); break;
        case 'smallint':
          key = (!isFinite(value) || (+value < -(2 ** 15) && +value > (2 ** 15 - 1))); break;
        case 'int':
          key = (!isFinite(value) || (+value < -(2 ** 31) && +value > (2 ** 31 - 1))); break;
        case 'bigint':
          key = (!isFinite(value) || (+value < -(2 ** 63) && +value > (2 ** 63 - 1))); break;
        case 'numeric':
        case 'decimal':
          break;
        case 'float':
          key = (!isFinite(value) || (+value < -1.79e+308 && +value > 1.79e+308)); break;
        case 'real':
          key = (!isFinite(value) || (+value < -3.4e+38 && +value > 3.4e+38)); break;
        case 'varchar':
          key = (value.length > +match[2]);// Слишком много
      }
    }

    if (/UNI|PRI/.test(this.columns[columnName].key)) {
      let allValues = Object.values(Object.assign({}, this.data));
      for (let item of allValues) {
        if(item[columnName] === value) return true;
      }
    }

    if (this.columns[columnName]['null'] === 'NO' && !value) return true;
    return key;
  }

  hideError(node) {
    node.classList.remove('btn-danger');
  }
  showError(node) {
    node.classList.add('btn-danger');
  }
  showNotAllowed(data) {
    let html = '';
    data['notAllowed'].map(item => {
      Object.entries(item).forEach((k, v) => html += k + ' ' + v);
      html += '<br>';
    });
    f.gI('errors').innerHTML = html;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param e
   */
  focusCell(e) {
    this.hideError(e.target);
    // Показать подсказку по типу и ограничению
  }

  saveDb(e) {
    f.setLoading(e.target);
    this.action = 'saveTable';

    let data = new FormData(),
        columns = this.queryResult.columns,
        dbData = handson.addSlashesData(this.handsontable.getData());
    dbData = dbData.map(row => {
      if (row.join('') === '') return false;
      let obj = {};
      columns.forEach((col, index) => {
        obj[col['columnName']] = row[index];
      });
      return obj;
    });
    dbData = dbData.filter(i => i);
    data.set('dbData', JSON.stringify(dbData));

    this.query(data).then(async data => {
      f.removeLoading(e.target);

      if (data.status) {
        f.showMsg('Сохранено');
        this.disableBtnSave();
        // Reload DB Table
        await this.dbAction('showTable');
        this.showDbTable();
        this.loaderTable.stop();
      } else if (data['notAllowed'] && data['notAllowed'].length) {
        this.showNotAllowed(data['notAllowed']);
      }
    });
  }
  saveCsv(e) {
    f.setLoading(e.target);
    this.action = 'saveTable';

    let data = new FormData();
    data.set('csvData', JSON.stringify(handson.addSlashesData(this.handsontable.getData())));

    this.query(data).then(data => {
      f.removeLoading(e.target);

      if (data.status) {
        f.showMsg('Сохранено');
        this.disableBtnSave();
      }
    });
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------
  // Проверка ввода
  onSave(func) {
    // Сохранить изменения.
    this.btnSave.onclick = e => func.call(this, e);
  }
}
