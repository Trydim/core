'use strict';

export class Catalog {
  constructor(type, props = {}) {
    this.M = props['modal'] || f.initModal();
    this.delayFunc = () => {};

    this.reloadAction = false;
    this.type         = type;
    this.sortParam    = Object.create(null);
    this.node         = Object.create(null);
    this.tmp          = Object.create(null);

    this.setQueryParam();
    this.setData(props.db);
    this.onMainEvent();
  }

  setQueryParam() {
    this.queryParam = Object.create(null);
    this.queryFiles = Object.create(null);
    //this.queryParam.countPerPage = 20;

    Object.defineProperty(this.queryParam, 'form', {
      enumerable: false,
      writable: true,
    });
  }
  setData(db) {
    let node = f.qS(`#${this.type}Column`);
    node && (this.setting = node.value.split(','));

    this.db = db;
  }
  setReloadQueryParam() {
    delete this.reloadAction.callback;
    this.queryParam = Object.assign(this.queryParam, this.reloadAction);
    this.reloadAction = false;
  }

  query(action = '') {
    let queryForm = this.queryParam.form || document.createElement('form');

    let data = new FormData(queryForm);

    data.set('mode', 'DB');

    Object.entries(Object.assign({}, this.queryParam, this.sortParam))
          .map(param => data.set(param[0], param[1]));
    action && data.set('dbAction', action);

    Object.entries(this.queryFiles).forEach(([id, file]) => {
      if (file instanceof File) data.append('files' + id, file, file.name);
      else data.set('files' + id, id);
    });
    data.delete('files');

    this.queryFiles = Object.create(null);
    this.queryParam.form = false;

    return f.Post({data}).then(async data => {
      if (this.reloadAction) {
        let cbFunc = this.reloadAction.callback || false;
        this.setReloadQueryParam();
        let cbData = await this.query();
        data.status && cbFunc && cbFunc(cbData);
      }

      if (data.status === false && data.error) f.showMsg(data.error, 'error');
      return data;
    });
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------

  commonEvent(e) {
    let target = e.target,
        action = target.dataset.action;

    if (action === 'confirmYes') {
      this.delayFunc();
      this.delayFunc = () => {};
      this.query();
    } else if (action === 'confirmNo') {
      this.reloadAction = false;
    } else {
      this.queryParam.dbAction = action;
      this[action] && this[action](target);
    }
  }

  // Двойной клик (изменить)
  dblClick(e) {
    let id = e.target.closest('tr').querySelector('[data-id]').dataset.id,
        module = this['id'],
        selectedIds = module.getSelected();

    //module.clear();
    module.addSelectedId(id);
    e.target.dataset.action = this.type === 'elements' ? 'changeElements' : 'changeOptions';
    this.commonEvent(e);

    //module.addSelectedId(selectedIds);
    delete e.target.dataset.action;
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   * @param options
   * @param eventType
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, (e) => func.call(this, e), options);
  }

  onMainEvent() {
    [this.M.btnConfirm, this.M.btnCancel].forEach(n => {
      n.addEventListener('click', e => this.commonEvent(e));
    });
  }
}

// Elements+Sections
export class Common extends Catalog {
  constructor(type, props) {
    super(type, props);
    this.setCommonParam();
  }

  getLang(name) {
    return this.db.lang[this.type][name] || name;
  }

  setCommonParam() {
    this.itemList = new Map();

    this.sortParam = {
      sortDirect: true, // true = DESC, false
      currPage: 0,
      countPerPage: 20,
      pageCount: 0,
    };

    this.oneFunc = new f.OneTimeFunction('setTablesHeaders',
      () => this.setTablesHeaders()
    );
  }
  setNodes(field, tmp) {
    this.node = {
      field,
      tableWrap : field.querySelector('[data-field="tableWrap"]'),
      fieldT    : field.querySelector('table'),
      fieldTBody: field.querySelector('tbody'),
      btnWrap   : field.querySelector('[data-field="btnWrap"]'),
    };
    this.tmp = {
      tHead   : tmp.tHead,
      checkbox: tmp.checkbox,
      imgCell : tmp.imgCell,
      img     : tmp.img,
      form    : f.gTNode(`#${this.type}Form`),
      chooseFile      : f.gT('#chooseFileTmp'),
      chooseLoadedFile: f.gT('#chooseLoadedFileTmp'),
    };
  }
  setItemsList(data) {
    this.itemList = new Map();
    data.forEach(i => this.itemList.set(i.ID || i['O.ID'], i));
  }
  setTablesHeaders() {
    let html = '<tr><th></th>',
        node = this.node.field.querySelector('thead');

    this.setting.map(column => {
      html += f.replaceTemplate(this.tmp.tHead, {name: this.getLang(column), column});
    });

    node.innerHTML = html + '</tr>';

    new f.SortColumns({
      thead: node,
      query: action => this.query(action).then(data => f.observer.fire('sortEvent', data)),
      dbAction: this.type === 'elements' ? 'openSection' : 'openElement',
      sortParam: this.sortParam,
    });
  }
  setImage(i) {
    if (!Array.isArray(i)) return [];
    return i.reduce((r, i) => {
      r.push({
        src   : i.path,
        name  : i.name,
        format: i.format,
      });
      return r;
    }, []);
  }
  showTablesItems(data) {
    this.oneFunc.exec('setTablesHeaders');

    const trNode = [],
          colSelect = {
            'activity': v => !!+v ? '<td>+</td>' : '<td>-</td>',

            'ex': v => '<td></td>',
            'images': v => {
              const td = this.tmp.imgCell.cloneNode(true);
              td.innerHTML = f.replaceTemplate(this.tmp.img, this.setImage(v));
              return td.outerHTML;
            },

            'unitId': v => `<td>${this.db.units[v]['shortName']}</td>`,
            'moneyInputId': v => `<td>${this.db.money[v].name}</td>`,
            'moneyOutputId': v => `<td>${this.db.money[v].name}</td>`,
          };

    data.map(row => {
      let tr = document.createElement('tr');
      tr.innerHTML = f.replaceTemplate(this.tmp.checkbox, {id: row['ID'] || row['O.ID']});
      this.setting.forEach(col => {
        tr.innerHTML += (colSelect[col] && colSelect[col](row[col])) || `<td>${row[col]}</td>`;
      });
      trNode.push(tr);
    });

    f.eraseNode(this.node.fieldTBody).append(...trNode);
  }
  prepareItems(data) {
    this.setItemsList(data);
    if (data.length) {
      this.showTablesItems(data);
      f.show(this.node.tableWrap, this.node.btnWrap);
    } else {
      f.showMsg('Раздел пустой');
      f.hide(this.node.tableWrap, this.node.btnWrap);
    }
  }
}
