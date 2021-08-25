"use strict";

import '../../../css/module/admindb/handsontable.full.min.css';
import {Handsontable} from './handsontable.full.min.js';
import {handson} from "./handsontable.option";

import {XMLTable} from './XMLTable.js';
import {FormViews} from './FormViews.js';

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

/* Проверка файла перед добавлением (не знаю что хотел проверить)
const checkAddedFile = function (e) {
  let input = e.target;
  if (!input.value.includes('csv')) {
    //return;
  }
}*/

export const admindb = {
  action     : '',
  queryResult: {},
  mainNode: f.qS('#insertToDB'),

  init() {
    this.btnField   = f.qS('#btnField');
    this.btnSave    = f.qS('#btnSave');
    this.btnAddMore = f.qS('#btnAddMore');
    this.btnRefresh = f.qS('#btnRefresh');
    this.viewsField = f.qS('#viewField');

    this.tableName = new URLSearchParams(location.search).get('tableName') || '';
    this.loaderTable = new f.LoaderIcon(this.mainNode, false, true, {small: false});

    this.setPageStyle();
    this.onBtnEvent();
  },
  dbAction(e) {
    let input = f.qS('input[name="tablesList"]:checked');
    input && (this.tableName = input.value);

    this.action = typeof e === "string" ? e.toString() : e.target.dataset.dbaction;

    f.hide(this.btnAddMore);
    this.loaderTable.start();

    this.query().then(data => {
      if (data['status'] && data.status === true) {

        this.queryResult = data;
        this.setTableName();
        f.eraseNode(this.mainNode);
        this.handsontable && (this.handsontable.destroyEditor());
        if (data['csvValues'] && data['XMLValues']) {
          FormViews.init();
        } else if (data['dbValues']) {
          this.showDbTable();
          TableValues.setData();
          TableValues.init('db');
        } else if (data['csvValues']) {
          this.showCsvTable();
          TableValues.init('csv');
        } else if (data['XMLValues']) {
          XMLTable.init();
        }
      }
      this.loaderTable.stop();
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
    let node = f.qS('#tableNameField'),
        name = this.tableName.substring(this.tableName.lastIndexOf("/") + 1).replace('.csv', '');
    node && (node.innerHTML = _(name));
  },
  showTablesName: (data) => {
    if (!data.hasOwnProperty('tables') && !data.hasOwnProperty('csvFiles')) {
      throw Error('Error load DB');
    }

    let string = f.qS('#tablesListTmp').innerHTML;
    if(data.hasOwnProperty('tables')) {
      f.qS('#DBTablesWrap').innerHTML = f.replaceTemplate(string, data.tables);
    }
    if(data.hasOwnProperty('csvFiles')) {
      f.qS('#DBTablesWrap').innerHTML += f.replaceTemplate(string, data.csvFiles);
    }
  },
  showDbTable() {
    let tmp             = f.qS('#columnsList').cloneNode(true),
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
    this.mainNode.appendChild(tmp.content);
  },
  showCsvTable() {
    const div = document.createElement('div');
    this.mainNode.append(div);

    this.handsontable = new Handsontable(div, Object.assign(handson.option, {
      data: handson.removeSlashesData(this.queryResult['csvValues']),
    }));

    this.handsontable.updateSettings(handson.context);
    this.handsontable.admindb = this;
  },

  checkBtnSave() {
    this.deleted.size ? this.enableBtnSave() : this.disableBtnSave();
  },
  disableBtnSave() {
    if (this.btnSaveEnable) {
      this.btnSave.setAttribute('disabled', 'disabled');
      this.btnSaveEnable = false;
      this.handsontable && (this.handsontable.tableChanged = false);
      this.disWindowReload();
    }
  },
  enableBtnSave() {
    if (!this.btnSaveEnable) {
      this.btnSave.removeAttribute('disabled');
      this.btnSaveEnable = true;
      this.onWindowReload();
    }
  },

  checkSavedTableChange(e) {
    if (this.btnSaveEnable && !confirm('Изменения будут потеряны, продолжить?')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
    return true;
  },

  setPageStyle() {
    document.body.style.overflow = 'hidden';
  },

  // Event function
  //--------------------------------------------------------------------------------------------------------------------

  tableNameClick(e) {
    //e.preventDefault();
    let node = e.target, name = node.value || node.innerText;
    if(name.includes('.csv')) f.qS('#btnLoadCSV').classList.remove('fade');
    else f.qS('#btnLoadCSV').classList.add('fade');
  },

  commonClick(e) {
    let target = e.target,
        action = target.dataset.action;

    let select = {
      'adminType': () => this.checkSavedTableChange(e) && this.changeAdminType(target),
    }

    select[action] && select[action]();
  },

  changeAdminType(target) {
    switch (target.value) {
      case 'form':
        f.hide(this.btnRefresh);
        this.dbAction('loadFormConfig');
        break;
      case 'table':
        f.hide(this.btnRefresh);
        if(this.tableName === '') {
          f.Get({data: 'mode=load&dbAction=tables'}).then(
            data => this.showTablesName(data),
            error => console.log(error),
          );
        } else {
          this.dbAction('showTable');
        }
        break;
      case 'config':
        f.show(this.btnRefresh);
        this.dbAction('loadXmlConfig');
        break;
    }
  },

  clickDocument(e) {
    let target = e.target,
        checkedTarget = target.closest('#sideLeft, nav.navbar');
    checkedTarget && this.checkSavedTableChange(e);
  },

  clickShowLegend() {
    let m = f.initModal({showDefaultButton: false}),
        legend = f.qS('#dataTableLegend');

    legend && m.show('Описание таблицы', legend.content.children[0].cloneNode(true));
  },

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onBtnEvent() {
    // Остальные кнопки
    f.qA('input[data-dbaction]').forEach(n => n.addEventListener('click', (e) => admindb.dbAction(e)));

    f.qA('input[data-action]').forEach(n =>
      n.addEventListener('click', (e) => this.commonClick(e)));
    setTimeout(() => f.qS('input[data-action]:checked').click(), 0);

    // Загрузить файл
    //node = f.qS('#DBTables');
    //node && node.addEventListener('click', (e) => admindb.tableNameClick(e), {passive: true});

    // Добавить строку перенести в TableValues
    this.btnAddMore.addEventListener('click', () => TableValues.addValues());

    // Добавлен файл
    //let node = f.qS('#btnAddFileCsv');
    //node && node.addEventListener('change', checkAddedFile);

    // Проверка перехода
    document.onclick = (e) => this.clickDocument(e);
    f.qA('nav.navbar [data-action]').forEach(n => n.onclick = (e) => this.clickDocument(e));

    // Легенда
    f.qS('#legend').addEventListener('click', this.clickShowLegend);
  },

  onWindowReload() {
    window.onbeforeunload = (e) => {
      if (this.btnSaveEnable) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      return true;
    };
  },

  disWindowReload() {
    window.onbeforeunload = () => {};
  },
}

const createBtnRow = () => {
  let td  = document.createElement('td'),
      btn = f.qS('#btnRow').cloneNode(true).content.children[0];

  btn.addEventListener('click', (e) => TableValues.delValues(e));
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

const TableValues = {
  columns: Object.create(null),
  data   : Object.create(null),

  btnSaveEnable: false,

  getEmptyTable() {
    return f.qS('#emptyTable').content.cloneNode(true);
  },
  getRowTemplate() {
    return this.tableRowTemplate.cloneNode(true);
  },

  init(tableType) {
    if(!this.btnCancelTmp) this.btnCancelTmp = f.qS('#btnDelCancel').content.children[0];

    if(tableType === 'db') {
      this.added   = Object.create(null);
      this.changed = Object.create(null);
      this.deleted = new Set();

      f.show(this.btnAddMore);
      f.hide(this.viewsField);
      this.onSave(this.save);
    } else {
      f.show(this.viewsField);
      this.onSave(this.saveCsv);
    }
    this.disableBtnSave();
  },
  setStyle() {
    document.body.style.overflow = 'hidden';
  },
  setData() {
    if (this.queryResult.columns) {
      Object.values(this.queryResult.columns).map(item => {
        this.columns[item.columnName] = Object.create(null);
        Object.assign(this.columns[item.columnName], item);
      });
    }
    this.data = this.queryResult['dbValues'] || this.queryResult['csvValues'] || {};
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

    if (this.columns[columnName]['null'] === 'NO' && !value) return true;
    return key;
  },

  delValues(e) {
    let tr = e.target.closest('tr');

    if (tr.dataset.id) this.deleted.add(tr.dataset.id);
    else return;

    tr.classList.add('opacity5');
    tr.querySelectorAll('input').forEach(n => n.setAttribute('disabled', 'disabled'));

    this.lastBtn = createBtnCancel.apply(this, [tr, this.lastBtn || false]);
    this.btnField.appendChild(this.lastBtn);
    this.checkBtnSave();
  },

  showList() {
    let bodyNode = f.qS('#columnValue'),
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
    this.enableBtnSave();
  },

  /**
   *
   * @param e
   */
  focusInput(e) {
    this.hideError(e.target);

    // Показать подсказку по типу и ограничению
  },

  save(e) {
    f.setLoading(e.target);
    if(this.lastBtn) this.lastBtn.dispatchEvent(new Event('clickSave'));

    this.action = 'saveTable';

    let data = new FormData(),
        del  = [];

    for (let item of this.deleted.values()) {
      if(this.added[item]) delete this.added[item];
      if(this.changed[item]) delete this.changed[item];
      del.push(item);
    }

    if(Object.values(this.added).length) data.set('added', JSON.stringify(this.added));
    if(Object.values(this.changed).length) data.set('changed', JSON.stringify(this.changed));
    del.length && data.set('deleted', JSON.stringify(del));

    this.query(data).then(data => {
      this.init('db');
      f.removeLoading(e.target);

      if (data.status) {
        f.showMsg('Сохранено');

      } else if (data.hasOwnProperty('notAllowed') && data['notAllowed'].length) {
        let html = '';
        data['notAllowed'].map(item => {
          Object.entries(item).forEach((k, v) => html += k + ' ' + v);
          html += '<br>';
        });

        f.gI('errors').innerHTML = html;
      }
    });
  },
  saveCsv(e) {
    f.setLoading(e.target);
    admindb.action = 'saveTable';

    let data = new FormData();
    data.set('csvData', JSON.stringify(handson.addSlashesData(admindb.handsontable.getData())));

    admindb.query(data).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      f.removeLoading(e.target);
      TableValues.init('csv');
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
    this.btnSave.onclick = e => func.call(this, e);
  }
}

TableValues.__proto__ = admindb;
XMLTable.__proto__ = admindb;
FormViews.__proto__ = admindb;
