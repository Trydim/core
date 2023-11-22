"use strict";

export default class {
  selected = null;

  selectedArea = undefined;

  mainAction = 'loadOrders';
  needReload = false;
  queryParam = {
    mode        : 'DB',
    dbAction    : '',
    tableName   : 'orders',
    sortColumn  : 'createDate',
    sortDirect  : true, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  };
  confirm = null;
  selectStatus = null;

  confirmMsg = '';
  dealerId   = 0;

  orders = {};
  filter = {};

  constructor() {
    this.setParam();
    this.queryParam.dbAction = this.mainAction;
  }
  init() {
    this.p = new f.Pagination( '#paginator', {
      dbAction : this.mainAction,
      sortParam: this.queryParam,
      query: this.query.bind(this),
    });

    this.loaderTable = new f.LoaderIcon(this.table);
    this.selected = new f.SelectedRow({table: this.table, observerKey: 'selectedOrders'});
    this.selected.subscribe(this.selectedRender.bind(this));

    this.query();
  }
  setParam() {
    this.M = new f.initModal();

    this.orderType  = 'main';

    this.table        = f.gI('orderTable');
    this.confirm      = f.gI('confirmField');
    this.selectedArea = f.gI('selectedArea');
    this.selectStatus = f.gI('selectStatus');
    this.btnMainOnly  = f.qA('#actionBtnWrap input.mainOnly');

    this.config = {
      ordersAllColumns: f.getData('#dataOrdersAllColumn'),
      ordersColumns   : f.getData('#dataOrdersColumn'),
      ordersVisitColumns: f.getData('#dataOrdersVisitColumn'),
    };

    this.template = {
      tableHeader: f.gT('#tableHeaderCell'),
      impValue : null, // f.gT('#tableImportantValue'),
      searchMsg: f.gT('#noFoundSearchMsg'),
    };

    f.oneTimeFunction.add('ordersHeadRender', this.ordersHeadRender.bind(this));
    f.oneTimeFunction.add('fillSelectStatus', this.fillSelectStatus.bind(this));
  }

  getTypeConfig() {
    return this.orderType === 'visit' ? 'ordersVisitColumns' : 'ordersColumns';
  }

  // Orders tables
  ordersHeadRender() {
    const thead = this.table.querySelector('thead'),
          html = this.config[this.getTypeConfig()].reduce((r, column) => {
            return r += f.replaceTemplate(this.template.tableHeader, column);
          }, '');

    thead.querySelector('tr').innerHTML = '<th></th>' + html;

    new f.SortColumns({
      thead,
      query: this.query.bind(this),
      dbAction : this.mainAction,
      sortParam: this.queryParam,
    });
  }
  ordersGetTableCellTemplate() {
    let tmp = '<tr><td><input type="checkbox" class="checkbox" data-id="${ID}"></td>';

    tmp += this.config[this.getTypeConfig()].reduce((r, column) => {
      r += '<td>${' + column['dbName'] + '}</td>';
      return r;
    }, '');

    return this.template.tableCell = tmp + '</tr>';
  }
  ordersPrepare(data) {
    this.contValue || (this.contValue = f.gT('#tableContactsValue'));

    return data.map(item => {
      /* TODO настройки вывода даты */
      ['createDate', 'lastEditDate'].forEach(k => {
        const d = new Date(item[k])
        item[k] = d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU').slice(0, 5);
      });

      if (item.customerContacts) {
        let value = Object.entries(item.customerContacts).map(n => ({key: window._(n[0]), value: n[1]}));
        item.customerContacts = f.replaceTemplate(this.contValue, value);
      }

      if (item.importantValue) {
        // Производитель добавляет свои поля, сохраняя текущие в baseVal
        let value = Object.entries(item.importantValue).map(n => ({key: window._(n[0]), value: n[1]}));
        item.importantValue = f.replaceTemplate(this.contValue, value);
      }

      this.orders[item['ID']] = item;
      return item;
    });
  }

  ordersFilter(data, search = false) {
    return Object.values(data).filter(row => {
      if (search) return search === row;
      return true;
    });
  }

  bodyRender(data, search) {
    let html  = '',
        tbody = this.ordersGetTableCellTemplate();

    data = this.ordersFilter(data, search);

    if (data.length) {
      html += f.replaceTemplate(tbody, data);
      setTimeout(() => this.selected.checkedRows());
    } else if (search) {
      html = this.template.searchMsg;
    }
    this.table.querySelector('tbody').innerHTML = html;
  }
  ordersRender(data, search) {
    f.oneTimeFunction.exec('ordersHeadRender');
    this.bodyRender(data, search);
  }
  // Show selected orders
  selectedRender() {
    const selected = this.selected.getSelected();

    if (selected.length) {
      f.show(this.selectedArea);
      this.selectedArea.firstElementChild.innerHTML = '<span>' + selected.join('</span><span>, ') + '</span>';
    } else {
      f.hide(this.selectedArea);
    }
  }

  setOrders(data) {
    data = this.ordersPrepare(data);
    this.ordersRender(data);
  }

  // Заполнить статусы
  fillSelectStatus(data) {
    let tmp = f.gT('#changeStatus'), html = '';

    html += f.replaceTemplate(tmp, data);

    this.statusList = data;
    this.selectStatus.innerHTML = html;
  }
  // Открыть заказ TODO кнопка скрыта
  showOrder(data) {
    if (!data['order']) console.log('error');

    let tmp = f.gT('#orderOpenForm'),
        html = document.createElement('div');

    data['order']['importantValue'] = JSON.parse(data['order']['importantValue'])[0];

    html.innerHTML = f.replaceTemplate(tmp, data['order']);

    this.M.show('Заказ ' + data['order']['ID'], html);
  }

  toggleDisableBtn(id) {
    this.dealerId = id;

    if (id) f.disable(this.btnMainOnly);
    else f.enable(this.btnMainOnly);
  }

  query(action) {
    const data  = new FormData(),
          param = this.queryParam;

    if (action) param.dbAction = action;

    Object.entries(param).map(([k, v]) => {
      v !== undefined && data.set(k, v.toString());
    });

    if (param.dbAction === this.mainAction) data.delete('orderIds');

    this.loaderTable.start();
    f.Post({data}).then(data => {
      if (this.needReload) {
        this.needReload = false;
        this.selected.clear();
        this.queryParam.dbAction = this.mainAction;
        this.queryParam.orderIds = '[]';
        return this.query();
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status) && (this.confirmMsg = false);
      }

      if (data['orders']) this.setOrders(data['orders']);
      if (data['countRows']) this.p.setCountPageBtn(data['countRows']);
      if (data['statusOrders']) f.oneTimeFunction.exec('fillSelectStatus');

      this.loaderTable.stop();
    });
  }
}
