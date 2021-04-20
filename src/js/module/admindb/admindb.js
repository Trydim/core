"use strict";

import '../../../css/module/admindb/handsontable.full.min.css';
import {Handsontable} from './handsontable.full.min.js';

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
  mainNode: f.qS('#insertToDB'),

  init() {
    this.btnField = f.qS('#btnField');
    this.btnSave = f.qS('#btnSave');
    this.btnAddMore = f.qS('#btnAddMore');

    this.tableName = new URLSearchParams(location.search).get('tableName') || '';
    this.loaderTable = new f.LoaderIcon(this.mainNode, false, true, {small: false});

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
        if (data['csvValues'] && data['XMLValues']) {
          FormViews.init();
        } else if (data['dbValues']) {
          this.handsontable && (this.handsontable.destroyEditor());
          this.showDbTable();
          TableValues.setData();
          TableValues.tableType = 'db';
          TableValues.init();
        } else if (data['csvValues']) {
          this.showCsvTable();
          TableValues.tableType = 'csv';
          TableValues.init();
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
    let node = f.qS('#tableNameField');
    node && (node.innerHTML = _(this.tableName));
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
    this.handsontable = new Handsontable(div, Object.assign(handsonOption, {data: this.queryResult['csvValues']}));

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

  checkBtnSave() {
    this.deleted.size ? this.enableBtnSave() : this.disableBtnSave();
  },
  disableBtnSave() {
    if (this.btnSaveEnable) {
      this.btnSave.setAttribute('disabled', 'disabled');
      this.btnSaveEnable = false;
    }
  },
  enableBtnSave() {
    if (!this.btnSaveEnable) {
      this.btnSave.removeAttribute('disabled');
      this.btnSaveEnable = true;
    }
  },

  // DB event function
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
      'adminType': () => this.changeAdminType(target),
    }

    select[action] && select[action]();
  },

  changeAdminType(target) {
    switch (target.value) {
      case 'form': this.dbAction('loadFormConfig'); break;
      case 'table':
        if(this.tableName === '') {
          f.Get({data: 'mode=load&dbAction=tables'}).then(
            data => this.showTablesName(data),
            error => console.log(error),
          );
        } else {
          this.dbAction('showTable');
        }
        break;
      case 'config': this.dbAction('loadXmlConfig'); break;
    }
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
    let node = f.qS('#btnAddFileCsv');
    node && node.addEventListener('change', checkAddedFile);
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

  init() {
    if(!this.btnCancelTmp) this.btnCancelTmp = f.qS('#btnDelCancel').content.children[0];

    if(this.tableType === 'db') {
      this.added   = Object.create(null);
      this.changed = Object.create(null);
      this.deleted = new Set();

      f.show(this.btnAddMore);
      this.onSave(this.save);
    } else {
      this.enableBtnSave();
      this.onSave(this.saveCsv);
    }
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
      this.disableBtnSave();
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
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      f.removeLoading(e.target);
      TableValues.init();
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
    this.btnSave.onclick = (e) => func.call(this, e);
  }
}

class Rows {
  constructor(row, rowNode, paramNode) {
    this.row = row;
    this.rowNode = rowNode;
    this.paramNode = paramNode;

    this.setParam();
    this.setTemplate();
    this.onEvent();

    return this;
  }

  setParam() {
    this.attr = this.row['@attributes'];
    this.rowParam = this.row.params.param.length ? this.row.params.param : [this.row.params.param];
  }

  setTemplate() {
    this.rowNode.querySelector('[data-field="desc"]').innerHTML = this.row.description;
    this.rowNode.querySelector('[data-field="id"]').innerHTML = `(${this.row['@attributes'].id})`;

    this.params = [];
    this.rowParam.forEach(([index, param]) => {
      const paramItem = this.paramNode.cloneNode(true);
      paramItem.querySelector('[data-field="key"]').innerHTML = param.key;
      paramItem.querySelector('[data-field="type"]').innerHTML = _(param['@attributes'].type);
      paramItem.dataset.index = index.toString();
      this.params.push(paramItem);
      //Object.entries(param['@attributes']).forEach(([k, v]) => { param.dataset[k] = v });
    })

    f.eraseNode(this.rowNode.querySelector('[data-field="params"]')).append(...this.params);
  }

  // Event function

  onEvent() {
    this.rowNode.onclick = (e) => this.commonClick(e);
  }

  commonClick(e) {
    let target = e.target,
        action = target.dataset.field || target.dataset.action;

    const select = {
      'editField': () => this.clickEditField(target),
    }

    select[action] && select[action]();
  }

  clickEditField(target) {
    const index = target.closest('[data-index]').dataset.index,
          form = XMLTable.editParamTmp,
          param = this.rowParam[index],
          attr = param['@attributes'];

    this.editParamIndex = index;
    let node = form.querySelector('[name="type"]');
    node.value = attr.type;
    node.dispatchEvent(new Event('change'));

    switch (attr.type) {
      default:
      case 'string': break;
      case 'number':
        form.querySelector('[name="min"]').value = attr.min || 0;
        form.querySelector('[name="max"]').value = attr.max || 1000000000;
        form.querySelector('[name="step"]').value = attr.step || 1;
        break;
      case 'select':

        break;
      case 'checkbox':
        form.querySelector('[name="relTarget"]').value = attr['relTarget'] || '';
        form.querySelector('[name="relativeWay"]').value = attr['relativeWay'] || '';
        break;
    }

    XMLTable.M.btnField.querySelector('.confirmYes').onclick = () => this.confirmChangeParam();
    XMLTable.M.show(_('EditParam') + ' ' + param.key, form);
  }

  confirmChangeParam() {
    const index = this.editParamIndex,
          form = new FormData(XMLTable.editParamTmp),
          attr = this.rowParam[index]['@attributes'];

    // Может удалить все значения?
    attr.type = form.get('type');

    switch (attr.type) {
      default:
      case 'color':
      case 'string': break;
      case 'number':
        attr.min = form.get('min');
        attr.max = form.get('max');
        attr.step = form.get('step');
        break;
      case 'select': break;
      case 'checkbox':
        attr['relTarget'] = form.get('relTarget');
        attr['relativeWay'] = form.get('relativeWay');
        break;
    }

    this.render();
    XMLTable.enableBtnSave();
  }

  render() {
    this.setTemplate();
  }

  getRowNode() {
    return this.rowNode;
  }
}

const XMLTable = {
  init() {
    this.setStyle();
    this.M = f.initModal();

    !this.rowTmp && (this.rowTmp = f.gTNode('#rowTemplate'));
    !this.paramTmp && (this.paramTmp = f.gTNode('#rowParamTemplate'));
    !this.editParamTmp && (this.editParamTmp = f.gTNode('#editParamModal'));
    f.relatedOption(this.editParamTmp);

    this.rows = this.queryResult['XMLValues'].row;
    this.XMLInit();

    this.onSave(this.save);
  },
  setStyle() {
    document.body.style.overflow = 'auto';
  },

  XMLInit() {
    const div = document.createElement('div');
    div.classList.add('d-flex', 'flex-column', 'justify-content-start');

    this.rows = Object.values(this.rows).map(row => new Rows(row, this.rowTmp.cloneNode(true), this.paramTmp.cloneNode(true)));
    this.rows.forEach(row => div.append(row.getRowNode()))

    this.mainNode.append(div);
  },

  save() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveXMLConfig');
    data.set('tableName', this.tableName);

    let row = this.rows.reduce((r, row) => {r.push(row.row); return r;}, []);
    data.set('XMLConfig', JSON.stringify({row}));

    f.Post({data}).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      this.disableBtnSave();
    });
  },

  onSave(func) {
    this.btnSave.onclick = (e) => func.call(this, e);
  },
}

const checkInputValue = (input, value) => {
  let min = input.getAttribute('min'),
      max = input.getAttribute('max');

  if (min && value < +min) return +min;
  if (max && value > +max) return +max;

  return +value;
}


const inputBtnChangeClick = function (e) {
  e.preventDefault();
  let targetName = this.getAttribute('data-input'),
      target     = f.qS('input[name="' + targetName + '"'),
      change     = this.getAttribute('data-change');

  if (target) {
    let match    = /[?=\.](\d+)/.exec(change),
        fixCount = (match && match[1].length) || 0,
        value    = checkInputValue(target, (+target.value + +change).toFixed(fixCount));
    target.value = value.toFixed(fixCount);
    target.dispatchEvent(new Event('change'));
  }
};

const inputBlur = function () {
  this.value = checkInputValue(this, +this.value);
};

const FormViews = {
  init() {
    this.relTarget = Object.create(null);

    this.formN  = f.gTNode('#FormViesTmp');
    this.rowN   = f.gTNode('#FormRowTmp');
    this.paramN = f.gTNode('#FormParamTmp');

    this.csv = this.queryResult['csvValues'];
    this.xml = this.prepareDataXml();

    this.setParam();
    if (this.cell.id === undefined) f.showMsg('Ключи таблицы не обнаружены', 'error');
    this.render();
    this.onEvent();
  },

  checkRelation(params) {
     params.forEach(param => {
       const attr = param['@attributes'],
             type = attr.type;
       if (['select', 'checkbox'].includes(type) && attr.relTarget) {
         this.relTarget[attr.relTarget] = attr.relativeWay;
       }
     })
  },
  checkValue(value) {
    return !(value === '0' || !value);
  },

  prepareDataXml() {
    return Object.values(this.queryResult['XMLValues'].row).reduce((r, row) => {
      const id = row['@attributes'].id;
      row.params = Object.values(row.params.param);
      this.checkRelation(row.params);
      r[id] = row;
      return r;
    }, {});
  },
  // Определение индексов столбцов по их назначению this.cell
  setParam() {
    const params = Object.values(this.xml)[0].params;
    this.cell = Object.create(null);

    for (let i = 0; i < 3; i++) {
      this.csv[i].forEach((cell, i) => {
        if (cell.match(/(id|key)/i)) this.cell.id = i;
        else {
          let find = params.find(p => p.key === cell);
          find && (this.cell[find.key] = i);
        }
      });

      if (Object.values(this.cell).length) break;
    }
  },

  // Добавление параметров записи
  setRowParam(rowNode, row, config) {
    const params = config.params,
          paramField = rowNode.querySelector('[data-field="params"]'),
          paramItems = this.paramN;

    if (!params) return;

    params.forEach(param => {
      let index = this.cell[param.key],
          paramAttr = param['@attributes'],
          paramItem = paramItems.querySelector(`[data-type="${paramAttr.type}"]`).cloneNode(true),
          input = paramItem.querySelector('input, select');

      switch (paramAttr.type) {
        default:
        case 'string': break;
        case 'number':
          //input.name = param.key; переписать зависимости.
          input.min = paramAttr.min || 0;
          input.max = paramAttr.max || 1000000000;
          input.step = paramAttr.step || 1;
          break;
        case 'select': break;
        case 'checkbox':
          paramAttr.relTarget && (input.dataset.target = paramAttr.relTarget);
          input.checked = this.checkValue(row[index]) || false;
          break;
      }

      input.dataset.cell = index;
      input.value = row[index] || '';

      paramField.append(paramItem);
    });
  },

  // Сборка и вывод формы
  render() {
    let form = this.formN,
        cell = this.cell;

    this.csv.forEach(row => {
      const rowNode = this.rowN.cloneNode(true),
            id = row[cell.id],
            config = this.xml[id] || false;

      rowNode.id = id;

      this.relTarget[id] && rowNode.classList.add(id);

      if (config) {
        config.description && (rowNode.querySelector('[data-field="description"]').innerHTML = config.description);
        this.setRowParam(rowNode, row, config);
      }

      form.append(rowNode);
    });

    f.relatedOption(form);

    form.querySelectorAll('button.inputChange').forEach(n => n.addEventListener('click', inputBtnChangeClick));
    form.querySelectorAll('input[type="number"]').forEach(n => n.addEventListener('blur', inputBlur));
    this.mainNode.append(form);
  },

  // DB event function
  //--------------------------------------------------------------------------------------------------------------------

  save() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveTable');
    data.set('tableName', this.tableName);
    data.set('csvData', JSON.stringify(this.csv));

    f.Post({data}).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      this.disableBtnSave();
    });
  },

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.addEventListener('click', () => this.save());
  }
}

TableValues.__proto__ = admindb;
XMLTable.__proto__ = admindb;
FormViews.__proto__ = admindb;
