"use strict";

class Rows {
  constructor(row, rowNode, paramNode) {
    this.row = row;

    this.setTemplate();
    this.onEvent();

    return this;
  }
  // Event function

  clickEditField(target) {
    const index = target.closest('[data-index]').dataset.index,
          form = XMLTable.editParamNode,
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
      case 'simpleList':
        form.querySelector('[name="listItems"]').value = JSON.parse(attr.values).join('\r\n');
        break;
      case 'relationTable':
        form.querySelector('[name="dbTable"]').value = attr.dbTable;
        form.querySelector('[name="tableCol"]').value = attr.tableCol;
        form.querySelector('[name="multiple"]').checked = !!attr.multiple;
        break;
      case 'checkbox':
        form.querySelector('[name="relTarget"]').value = attr['relTarget'] || '';
        form.querySelector('[name="relativeWay"]').value = attr['relativeWay'] || '';
        break;
      case 'textarea': break;
    }

    XMLTable.M.btnField.querySelector('.confirmYes').onclick = () => this.confirmChangeParam();
    XMLTable.M.show(_('EditParam') + ' ' + param.key, form);
  }

  confirmChangeParam() {
    const index = this.editParamIndex,
          form = new FormData(XMLTable.editParamNode),
          attr = Object.create(null);

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
      case 'simpleList':
        attr.values = JSON.stringify(form.get('listItems').replaceAll('\r', '').split('\n'));
        break;
      case 'relationTable':
        attr.dbTable = form.get('dbTable');
        attr.tableCol = form.get('tableCol');
        form.get('multiple') && (attr.multiple = true);
        break;
      case 'checkbox':
        attr['relTarget'] = form.get('relTarget');
        attr['relativeWay'] = form.get('relativeWay');
        break;
      case 'textarea': break;
    }

    this.rowParam[index]['@attributes'] = attr;
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

export class XMLTable {
  constructor() {

    this.M = f.initModal();

    !this.rowTmp && (this.rowTmp = f.gTNode('#rowTemplate'));
    !this.paramTmp && (this.paramTmp = f.gTNode('#rowParamTemplate'));
    if (!this.editParamNode) {
      this.editParamNode = f.gTNode('#editParamModal');
      f.relatedOption(this.editParamNode);
    }

    this.rows = this.queryResult['XMLValues'].row;
    this.XMLInit();

    this.onEvent();
  }

  XMLInit() {
    const div = document.createElement('div');
    div.classList.add('d-flex', 'flex-column', 'justify-content-start');

    this.rows = Object.values(this.rows).map(row => new Rows(row, this.rowTmp.cloneNode(true), this.paramTmp.cloneNode(true)));
    this.rows.forEach(row => div.append(row.getRowNode()))

    f.eraseNode(this.mainNode).append(div);
  }

  setLoadedTable(data) {
    let html = '',
        col = data[0].length;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < col; j++) {
        data[i][j] && (html += `<option value="${data[i][j]}">${data[i][j]}</option>`);
      }
    }

    this.editParamNode.querySelector('[data-field="tableCol"]').innerHTML = html;
  }


  // Event function
  //--------------------------------------------------------------------------------------------------------------------

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
  }
  refresh() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'refreshXMLConfig');
    data.set('tableName', this.tableName);

    f.Post({data}).then(data => {
      if (data['XMLValues']) {
        this.queryResult = data;
        this.init();
      }
      this.disableBtnSave();
    });
  }

  changeSelectTables(target) {
    const data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'showTable');
    data.set('tableName', target.value);

    f.Post({data}).then(data => {
      data['csvValues'] && this.setLoadedTable(data['csvValues']);
    });
  }

  // Event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.onclick = (e) => this.save(e);
    this.btnRefresh.onclick = (e) => this.refresh(e);
  }
}
