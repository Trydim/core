"use strict";

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
    this.rowParam.forEach((param, index) => {
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

export const XMLTable = {
  init() {
    this.setStyle();
    this.M = f.initModal();

    !this.rowTmp && (this.rowTmp = f.gTNode('#rowTemplate'));
    !this.paramTmp && (this.paramTmp = f.gTNode('#rowParamTemplate'));
    if (!this.editParamNode) {
      this.editParamNode = f.gTNode('#editParamModal');
      f.relatedOption(this.editParamNode);
      this.onEventEdit();
    }

    this.rows = this.queryResult['XMLValues'].row;
    this.XMLInit();

    this.onceFunc = new f.OneTimeFunction('loadTables', this.loaderTables.bind(this));
    this.onEvent();
  },
  setStyle() {
    document.body.style.overflow = 'auto';
  },

  XMLInit() {
    const div = document.createElement('div');
    div.classList.add('d-flex', 'flex-column', 'justify-content-start');

    this.rows = Object.values(this.rows).map(row => new Rows(row, this.rowTmp.cloneNode(true), this.paramTmp.cloneNode(true)));
    this.rows.forEach(row => div.append(row.getRowNode()))

    f.eraseNode(this.mainNode).append(div);
  },

  loaderTables() {
    let data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'tables');

    f.Post({data}).then(data => {
      data['csvFiles'] && this.setLoadedTablesList(data['csvFiles'])
    });
  },
  setLoadedTablesList(data) {
    const flat = (d, link = '') => {
      link && (link = '/' + link);
      return Object.entries(d).reduce((r, [i, item]) => {
        r += isFinite(+i) ? `<option value="${link + '/' + item.fileName}">${item.name}</option>`
                          : flat(item, i + link);
        return r;
      }, '');
    }

    let html = flat(data),
        node = this.editParamNode.querySelector('[data-field="dbTables"]');
    node.innerHTML = html;
    node.click();
  },
  setLoadedTable(data) {
    let html = '',
        col = data[0].length;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < col; j++) {
        data[i][j] && (html += `<option value="${data[i][j]}">${data[i][j]}</option>`);
      }
    }

    this.editParamNode.querySelector('[data-field="tableCol"]').innerHTML = html;
  },


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
  },
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
  },

  commonEditClick(e) {
    let target = e.target,
        action = target.dataset.action;

    const select = {
      'selectChange': () => this.changeSelectType(target),
      'selectDbTables': () => this.changeSelectTables(target),
    }

    select[action] && select[action]();
  },
  changeSelectType(target) {
    if (target.value !== 'relationTable') return;
    this.onceFunc.exec('loadTables');
  },
  changeSelectTables(target) {
    const data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'showTable');
    data.set('tableName', target.value);

    f.Post({data}).then(data => {
      data['csvValues'] && this.setLoadedTable(data['csvValues']);
    });
  },

  // Event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.onclick = (e) => this.save(e);
    this.btnRefresh.onclick = (e) => this.refresh(e);
  },

  onEventEdit() {
    this.editParamNode.onclick = (e) => this.commonEditClick(e);
  },
}
