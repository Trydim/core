"use strict";

export class Main {
  constructor() {
    this.action = '';
    this.btnSaveEnable = true;
    this.queryResult = {};
    this.mainNode   = f.qS('#insertToDB');
    this.btnSave    = f.qS('#btnSave');
    this.btnRefresh = f.qS('#btnRefresh');
    this.viewsField = f.qS('#viewField');

    this.tableName = new URLSearchParams(location.search).get('tableName') || '';
    this.loaderTable = new f.LoaderIcon(this.mainNode, false, true, {small: false});

    this.setTableName();
    this.onBtnEvent();
    this.disableBtnSave();
  }

  dbAction(e) {
    this.action = typeof e === "string" ? e : e.target.dataset.dbaction;

    this.loaderTable.start();
    f.eraseNode(this.mainNode);

    return this.query().then(data => {
      if (data.status) {
        this.queryResult = data;

        if (data['csvValues'] && data['XMLValues']) return 'form';
        else if (data['dbValues']) return 'db';
        else if (data['csvValues']) return 'csv';
        else if (data['XMLValues']) return 'XMLValues';
        else if (data['content'])   return 'content';

      } else this.queryResult = undefined;
      this.loaderTable.stop();
    });
  }
  setTableName() {
    let node = f.qS('#tableNameField'),
        name = this.tableName.substring(this.tableName.lastIndexOf("/") + 1).replace('.csv', '');

    name = _(name);
    node && (node.innerHTML = name);
    document.title = name;
  }
  showTablesName(data) {
    if (!data['tables'] && !data['csvFiles']) throw Error('Error load DB');

    let string = f.qS('#tablesListTmp').innerHTML;
    f.qS('#DBTablesWrap').innerHTML = f.replaceTemplate(string, data['tables'] || data['csvFiles']);
  }

  disableBtnSave() {
    if (this.btnSaveEnable) {
      this.btnSave.setAttribute('disabled', 'disabled');
      this.btnSaveEnable = false;
      this.handsontable && (this.handsontable.tableChanged = false);
      this.disWindowReload();
    }
  }
  enableBtnSave() {
    if (!this.btnSaveEnable) {
      this.btnSave.removeAttribute('disabled');
      this.btnSaveEnable = true;
      this.onWindowReload();
    }
  }

  checkSavedTableChange(e) {
    if (this.btnSaveEnable && !confirm('Изменения будут потеряны, продолжить?')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
    return true;
  }

  query(data = new FormData()) {
    if (!this.action || !this.tableName) throw new Error('Error query');

    data.set('mode', 'DB');
    data.set('dbAction', this.action);
    data.set('tableName', this.tableName);

    return f.Post({data});
  }

  // Event function
  //--------------------------------------------------------------------------------------------------------------------
  tableNameClick(e) {
    let node = e.target, name = node.value || node.innerText;
    if(name.includes('.csv')) f.qS('#btnLoadCSV').classList.remove('fade');
    else f.qS('#btnLoadCSV').classList.add('fade');
  }

  clickDocument(e) {
    let target = e.target,
        checkedTarget = target.closest('#sideLeft, nav.navbar');
    checkedTarget && this.checkSavedTableChange(e);
  }
  clickShowLegend() {
    let m = f.initModal({showDefaultButton: false}),
        legend = f.qS('#dataTableLegend');

    legend && m.show('Описание таблицы', legend.content.children[0].cloneNode(true));
  }

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------
  onBtnEvent() {
    // Загрузить файл
    //node = f.qS('#DBTables');
    //node && node.addEventListener('click', e => admindb.tableNameClick(e), {passive: true});

    // Добавлен файл
    //let node = f.qS('#btnAddFileCsv');
    //node && node.addEventListener('change', checkAddedFile);

    // Проверка перехода
    document.onclick = e => this.clickDocument(e);
    f.qA('nav.navbar [data-action]').forEach(n => n.onclick = e => this.clickDocument(e));

    // Легенда
    f.qS('#legend').addEventListener('click', this.clickShowLegend);
  }
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
  }
  disWindowReload() {
    window.onbeforeunload = () => {};
  }
}
