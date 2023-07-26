"use strict";

export default class {
  constructor() {
    this.setParam();
    this.setQueryParam();
  }
  init() {
    this.p = new f.Pagination( '#paginator', {
      dbAction : this.mainAction,
      sortParam: this.queryParam,
      query: this.query.bind(this),
    });

    this.loaderTable = new f.LoaderIcon(this.table);
    this.selected = new f.SelectedRow({table: this.table});

    this.onEvent();
    this.query();
  }
  setParam() {
    this.M = new f.initModal();

    this.needReload = false;
    this.confirmMsg = '';
    this.dealerId   = 0;
    this.orderType  = 'main';

    this.orders = {};
    this.filter = {};

    this.table        = f.qS('#orderTable');
    this.confirm      = f.qS('#confirmField');
    this.selectStatus = f.qS('#selectStatus');
    this.btnMainOnly  = f.qA('#actionBtnWrap input.mainOnly');

    this.config = {
      ordersColumns: f.getData('#dataOrdersColumn'),
      ordersVisitColumns: f.getData('#dataOrdersVisitColumn'),
    };

    this.template = {
      tableHeader: f.gT('#tableHeaderCell'),
      impValue : null, // f.gT('#tableImportantValue'),
      searchMsg: f.gT('#noFoundSearchMsg'),
      columns  : f.gT('#orderColumnsTableTmp'),
    };
  }
  setQueryParam() {
    this.mainAction = 'loadOrders';

    this.queryParam = {
      mode        : 'DB',
      dbAction    : this.mainAction,
      tableName   : 'orders',
      sortColumn  : 'createDate',
      sortDirect  : false, // true = DESC, false
      currPage    : 0,
      countPerPage: 20,
      pageCount   : 0,
    };
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
      return r += '<td>${' + column['dbName'] + '}</td>';
    }, '');

    return this.template.tableCell = tmp + '</tr>';
  }
  ordersPrepare(data) {
    return data.map(item => {
      if (item.importantValue) {
        let value = '';

        /*if (false /!* TODO настройки вывода даты*!/) {
         for (let i in item) {
         if (i.includes('date')) {
         //let date = new Date(item[i]);
         item[i] = item[i].replace(/ |(\d\d:\d\d:\d\d)/g, '');
         }
         }
         }*/

        try {
          value = JSON.parse(item.importantValue);
          !Array.isArray(value) && (value = Object.values(value).length && [value]);
          if (value.length) {
            value = value.map(i => { i.key = window._(i.key); return i; });
            value = f.replaceTemplate(this.template.impValue, value);
          } else value = '-';
        }
        catch (e) { console.log(`Заказ ID:${item['ID']} имеет не правильное значение`); }
        item.importantValue = value;
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
    this.ordersHeadRender();
    this.bodyRender(data, search)
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
    if(!data['order']) console.log('error');

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
    const data = new FormData(),
          param = this.queryParam;

    if (action) param.dbAction = action;

    Object.entries(param).map(([k, v]) => {
      v !== undefined && data.set(k, v.toString());
    });

    if (param.dbAction === this.mainAction) data.delete('orderIds');

    this.loaderTable.start();
    f.Post({data}).then(data => {
      if(this.needReload) {
        this.needReload = false;
        this.selected.clear();
        this.queryParam.dbAction = this.mainAction;
        this.queryParam.orderIds = '[]';
        this.query();
        return;
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status) && (this.confirmMsg = false);
      }

      if (data['orders']) this.setOrders(data['orders']);
      if (data['countRows']) this.p.setCountPageBtn(data['countRows']);
      if (data['statusOrders']) this.fillSelectStatus(data['statusOrders']);

      this.loaderTable.stop();
    });
  }
}
