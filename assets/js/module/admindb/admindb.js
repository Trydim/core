"use strict";

import {main as f} from '../../control/function.js';
//import {test} from "../../Test/testIntterface.js";
import {Handsontable} from './libs/handsontable.full.min.js';

const handsonOption = {
  rowHeaders: true,
  colHeaders: true,
  //filters   : true,
  dropdownMenu: true,
  contextMenu: true,
  manualColumnResize: true,
  manualRowResize: true,
  stretchH: 'all',
  width: '100%',
  height: 900,
  licenseKey: 'non-commercial-and-evaluation'
};

/*const createRow = (innerHTML) => {
  let tr = document.createElement('tr');
  tr.innerHTML = innerHTML;
  tr.appendChild(createBtnDeleteRow());
  return tr;
}*/

/**
 * Erase template from ${}
 * @param tmpString
 * @return {string}
 */
const eraseTemplate = (tmpString) => tmpString.replace(/\$\{.+?\}/g, '');

const checkAddedFile = function (e) {
  let input = e.target;
  if (!input.value.includes('csv')) {
    //return;
  }
}

export const admindb = {
  action     : '',
  queryResult: {},

  tableName: '',

  init() {
    this.onBtnEvent();

    this.tableName = new URLSearchParams(location.search).get('tableName') || '';

    if(this.tableName === '') {
      f.Get({data: 'mode=load&dbAction=tables'}).then(
        data => this.showTablesName(data),
        error => console.log(error),
      );
    } else {
      this.dbAction('showTable');
    }
  },
  dbAction(e) {
    let input = f.qS('input[name="tablesList"]:checked');
    input && (this.tableName = input.value);
    if (!this.tableName) return;

    this.action = typeof e === "string" ? e.toString() : e.target.getAttribute('data-dbaction');

    this.query(new FormData()).then(data => {
      if (data['status'] && data.status === true) {
        this.queryResult = data;
        this.setTableName();
        if(data['dbValues']) {
          this.handsontable && (this.handsontable.destroyEditor());
          this.showDbTable();
          tableValues.setData();
          tableValues.tableType = 'db';
          tableValues.init();
        } else if(data['csvValues']) {
          this.showCsvTable();
          tableValues.tableType = 'csv';
          tableValues.init();
        }
      }
    });
  },
  query(data = new FormData()) {
    if (!this.action || !this.tableName) return false;

    data.set('mode', 'DB');
    data.set('dbAction', this.action);
    data.set('tableName', this.tableName);

    return f.Post({data});
  },

  setTableName() {
    let node = f.gI('tableNameField');
    node && (node.innerHTML = this.tableName);
  },
  showTablesName: (data) => {
    if (!data.hasOwnProperty('tables') && !data.hasOwnProperty('csvFiles')) {
      throw Error('Error load DB');
    }

    let string = f.gI('#tablesListTmp').innerHTML;
    if(data.hasOwnProperty('tables')) {
      f.gI('DBTablesWrap').innerHTML = f.replaceTemplate(string, data.tables);
    }
    if(data.hasOwnProperty('csvFiles')) {
      f.gI('DBTablesWrap').innerHTML += f.replaceTemplate(string, data.csvFiles);
    }
  },
  showDbTable() {
    let tmp             = f.gI('columnsList').cloneNode(true),
        columnNameNode  = tmp.content.querySelector('#columnName'),
        columnNameTmp   = columnNameNode.innerHTML.trim(),
        columnValueNode = tmp.content.querySelector('#columnValue tr'),
        columnValueTmp  = columnValueNode.innerHTML.trim();

    columnNameNode.innerHTML  = '';
    columnValueNode.innerHTML = '';

    this.queryResult.columns.map(col => {
      let colValTmp = columnValueTmp;

      if (col.extra.includes('auto')) return; // Private key and auto_increment
      if (col.type.includes('bit')) colValTmp = colValTmp.replace('type="text"', 'type="checkbox"');

      columnNameNode.innerHTML += f.replaceTemplate(columnNameTmp, [col]);
      columnValueNode.innerHTML += f.replaceTemplate(colValTmp, [col]);
    })
    columnNameNode.innerHTML += '<td></td>';

    this.tableRowTemplate = columnValueNode;

    let node = f.gI('insertToDB');
    f.eraseNode(node);
    node.appendChild(tmp.content);
  },
  showCsvTable() {
    let node = f.gI('insertToDB');
    f.eraseNode(node);
    this.handsontable = new Handsontable(node, Object.assign(handsonOption, {data: this.queryResult.csvValues}));

    this.handsontable.updateSettings({
      contextMenu: {
        items: {
          "row_above": { name: 'Добавить строку выше' },
          "row_below": { name: 'Добавить строку ниже' },
          "hsep1": "---------",
          "col_left": { name: 'Добавить колонку слева' },
          "col_right": { name: 'Добавить колонку справа' },
          "hsep2": "---------",
          "remove_row": { name: 'Удалить строку' },
          "remove_col": { name: 'Удалить колонку' },
          "hsep3": "---------",
          "undo": { name: 'Отменить' },
          "redo": { name: 'Вернуть' }
        }
      }
    })
  },

  // TODO DataBase event function
  //--------------------------------------------------------------------------------------------------------------------

  tableNameClick(e) {
    //e.preventDefault();
    let node = e.target, name = node.value || node.innerText;
    if(name.includes('.csv')) f.gI('btnLoadCSV').classList.remove('fade');
    else f.gI('btnLoadCSV').classList.add('fade');
  },

  // TODO DataBase event bind
  //--------------------------------------------------------------------------------------------------------------------

  onBtnEvent() {
    let node;
    // Остальные кнопки
    f.qA('input[data-dbaction]').forEach(n => n.addEventListener('click', (e) => admindb.dbAction(e)));

    // Загрузить файл
    //node = f.gI('DBTables');
    //node && node.addEventListener('click', (e) => admindb.tableNameClick(e), {passive: true});

    // Добавить строку
    //node = f.gI('btnAddMore');
    //node && node.addEventListener('click', () => tableValues.addValues());

    // Добавлен файл
    node = f.gI('btnAddFileCsv');
    node && node.addEventListener('change', checkAddedFile);
  },
}

const createBtnRow = () => {
  let td  = document.createElement('td'),
      btn = f.gI('btnRow').cloneNode(true).content.children[0];

  btn.addEventListener('click', (e) => tableValues.delValues(e));
  td.appendChild(btn);
  return td;
}

const createBtnCancel = function (tr, lastBtn = false) {
  if (lastBtn) {
    lastBtn.remove();
    this.lastBtn = false;
  }

  let btn = this.btnCancelTmp.cloneNode(true),
      backTime = (time) => { btn.value = 'Отменить ' + time},
      int   = setInterval(() => backTime(time--), 1000),
      eventCancelDelete = () => { this.lastBtn = false; btn.remove(); tr.remove(); clearInterval(int); },
      timer = setTimeout(eventCancelDelete, 5000),
      time = 4;
  btn.value = 'Отменить ' + time;

  btn.addEventListener('click', () => {

    this.deleted.delete(tr.getAttribute('data-id'));
    tr.classList.remove('opacity5');
    tr.querySelectorAll('input').forEach(n => n.removeAttribute('disabled'));

    this.lastBtn = false;
    btn.remove();
    clearTimeout(timer);
    clearInterval(int);
  });

  btn.addEventListener('clickSave', () => eventCancelDelete());

  return btn;
}

const tableValues = {
  columns: Object.create(null),
  data   : Object.create(null),

  btnField: undefined,
  btnCancelTmp: undefined,
  btnSave: undefined,
  btnSaveEnable: false,

  getEmptyTable() {
    return f.gI('emptyTable').content.cloneNode(true);
  },
  getRowTemplate() {
    return this.tableRowTemplate.cloneNode(true);
  },

  init() {
    if(!this.btnField) this.btnField = f.gI('btnField');
    if(!this.btnCancelTmp) this.btnCancelTmp = f.gI('btnDelCancel').content.children[0];
    if(!this.btnSave) this.btnSave = f.gI('btnSave');

    this.btnField.classList.remove('fade');
    if(this.tableType === 'db') {
      this.added   = Object.create(null);
      this.changed = Object.create(null);
      this.deleted = new Set();

      f.show(this.btnField.querySelector('#btnAddMore'));
      this.hideBtnSave();
      this.onSave(this.save);
    } else {
      f.hide(this.btnField.querySelector('#btnAddMore'));
      this.showBtnSave();
      this.onSave(this.saveCsv);
    }
  },

  setData() {
    if (this.queryResult.columns) {
      Object.values(this.queryResult.columns).map(item => {
        this.columns[item.columnName] = Object.create(null);
        Object.assign(this.columns[item.columnName], item);
      });
    }
    this.data = this.queryResult.dbValues || this.queryResult.csvValues || {};
    this.showList();
  },

  addValues() {
    let tmp       = this.getRowTemplate();
    tmp.innerHTML = eraseTemplate(tmp.innerHTML);
    tmp.appendChild(createBtnRow());
    this.onCheckEdit(tmp);
    f.qS('#columnValue').appendChild(tmp);
    tmp.querySelector('input').dispatchEvent(new Event('blur'));
  },

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
      let allValues = Object.values(Object.assign({}, this.data, this.added, this.changed));
      for (let item of allValues) {
        if(item[columnName] === value) return true;
      }
    }

    if (this.columns[columnName].null === 'NO') {
      if(!value) return true;
    }

    return key;
  },

  delValues(e) {
    let tr = e.target.closest('tr');

    if (tr.hasAttribute('data-id'))
      this.deleted.add(tr.getAttribute('data-id'));

    tr.classList.add('opacity5');
    tr.querySelectorAll('input').forEach(n => n.setAttribute('disabled', 'disabled'));

    this.lastBtn = createBtnCancel.apply(this, [tr, this.lastBtn || false]);
    this.btnField.appendChild(this.lastBtn);
    this.hideBtnSave();
  },

  showList() {
    let bodyNode = f.gI('columnValue'),
        keyPri = this.queryResult.columns && this.queryResult.columns.find(n => n.key === 'PRI')['columnName'],
        nodeList = [];

    if (this.queryResult.columns) {
      this.data = this.data.reduce((r, item) => {
        r[item[keyPri]] = item;
        return r;
      }, Object.create(null));
    }

    Object.values(this.data).map((item, i) => {
      let tmp = this.getRowTemplate();
      tmp.setAttribute('data-id', item[keyPri] || i);
      if (this.queryResult.columns) tmp.innerHTML = f.replaceTemplate(tmp.innerHTML, item);
      else { tmp.querySelectorAll('input')
        .forEach((n, i) => n.value = item[i]);
      }
      tmp.appendChild(createBtnRow());
      this.onCheckEdit(tmp);

      nodeList.push(tmp);
    });

    if (!nodeList.length) nodeList.push(this.getEmptyTable());

    f.eraseNode(bodyNode).append(...nodeList);
  },

  hideError(node) {
    node.classList.remove('btn-danger');
  },
  showError(node) {
    node.classList.add('btn-danger');
  },
  hideBtnSave() {
    if(this.btnSaveEnable) {
      this.btnSave.setAttribute('disabled', 'disabled');
      this.btnSaveEnable = false;
    }
  },
  showBtnSave() {
    if(!this.btnSaveEnable) {
      this.btnSave.removeAttribute('disabled');
      this.btnSaveEnable = true;
    }
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * blur inputs
   * @param e event
   */
  blurInput(e) {
    let tr         = e.target.closest('tr'),
        input      = e.target,
        id         = tr.getAttribute('data-id') || 'r' + tr.rowIndex,
        columnName = input.getAttribute('data-column') || input.parentNode.cellIndex,
        item       = this.data[id] || false;

    if (input.value === '') return;

    if (this.queryResult.columns && this.checkInputValue(columnName, input.value)) {
      input.value = '';
      this.showError(input);
      return;
    }

    if (item) { // Изменение значения
      if (item[columnName] === input.value) return;
      if (!this.changed[id]) this.changed[id] = Object.create(null);
      this.changed[id][columnName] = input.value;
    } else { // Добавление нового Элемента

      if (!id) {
        id = 'new' + Object.values(this.added).length;
        tr.setAttribute('data-id', id);
      }

      if (!this.added[id]) this.added[id] = Object.create(null);
      this.added[id][columnName] = input.value;
      // найти все обязательные поля и как-то показать
    }
    this.showBtnSave();
  },

  /**
   *
   * @param e
   */
  focusInput(e) {
    this.hideError(e.target);

    // Показать подсказку по типу и ограничению
  },

  save() {
    if(this.lastBtn) this.lastBtn.dispatchEvent(new Event('clickSave'));

    admindb.action = 'saveTable';

    let data = new FormData(),
        del = [];

    for (let item of this.deleted.values()) {
      if(this.added[item]) delete this.added[item];
      if(this.changed[item]) delete this.changed[item];
      del.push(item);
    }

    if(Object.values(this.added).length)
      data.set('added', JSON.stringify(this.added));
    if(Object.values(this.changed).length)
      data.set('changed', JSON.stringify(this.changed));
    if(del.length)
      data.set('deleted', JSON.stringify(del));

    admindb.query(data).then(data => {
      this.hideBtnSave();
      this.init();

      if (data.hasOwnProperty('notAllowed') && data['notAllowed'].length) {
        let html = '';
        data.notAllowed.map(item => {
          for (let i in item) {
            html += i + ' ' + item[i];
          }
          html += '<br>';
        });

        f.gI('errors').innerHTML = html;

        /*switch (data.status) {
          case true:
            //Выводить сообщение обнулить таблицу
            break;
          case false:
          //Выводить сообщение вывести строки которые не добавлены.
        }*/
      }
    });
  },

  saveCsv(e) {
    f.setLoading(e.target);
    admindb.action = 'saveTable';

    let data = new FormData();
    data.set('csvData', JSON.stringify(admindb.handsontable.getData()));

    admindb.query(data).then(data => {
      f.showMsg(data['status'] ? 'ok' : 'error');
      f.removeLoading(e.target);
      tableValues.init();
    });
  },

  // TODO bind events
  //--------------------------------------------------------------------------------------------------------------------
  // Проверка ввода
  onCheckEdit(node) {
    node.querySelectorAll('input:not(.btnDel)').forEach(n => {
      n.addEventListener('blur', (e) => this.blurInput(e));
      n.addEventListener('focus', (e) => this.focusInput(e));
    });
  },

  onSave(func) {
    // Сохранить изменения.
    f.gI('btnSave').onclick = (e) => func.call(this, e);
  }

}

tableValues.__proto__ = admindb;
