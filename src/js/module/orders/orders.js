'use strict';

// Orders list for search
class AllOrdersList {
  constructor(param) {
    const {node = false} = param;
    if (!node) return;

    const data = this.getFormData(param);

    this.node            = node;
    this.type            = param.tableType;
    this.data            = [];
    this.searchData      = Object.create(null);
    this.searchComponent = f.searchInit();
    this.loader          = new f.LoaderIcon(this.node);

    f.Post({data}).then(data => {
      data['orders'] && this.prepareSearchData(data['orders']);
      this.init(param);
      this.loader.stop();
    });
  }

  getFormData(param) {
    const fd = new FormData();
    fd.set('mode', 'DB');
    fd.set('dbAction', param.dbAction);
    fd.set('countPerPage', '1000');
    return fd;
  }

  init() {
    //this.count = 1;
    this.searchComponent.init({
      popup: false,
      node: this.node,
      searchData: this.searchData,
      showResult: this.showResult.bind(this),
    });
  }

  prepareSearchData(data) {
    if (this.type === 'order') {
      this.data = data.reduce((r, i) => {
        this.searchData[i['ID']] = i['ID'] + i['customerName'];
        r[i['ID']] = i;
        return r;
      }, Object.create(null));
    } else {
      this.data = data.reduce((r, i) => {
        this.searchData[i['cpNumber']] = i['cpNumber'] + ' ' + i['createDate'] + ' ' + i['total'];
        r[i['cpNumber']] = i;
        return r;
      }, Object.create(null));
    }
  }

  showResult(node, resultIds) {
    let array = [];
    resultIds.forEach(i => array.push(this.data[i]));
    orders.fillTable(array, true);
    /* Todo что бы учитывать настройки пагинации нужен запрос
    if (resultIds.length) {
      f.setLoading(this.node);
      this.FD.set('search', '1');
      this.FD.set('orderId', JSON.stringify(resultIds));

      f.Post({data: this.FD}).then(data => {
        f.removeLoading(this.node);
        if (data['orders']) orders.fillTable(data['orders'], true);
      });
    } else orders.fillTable([], true);*/
  }
}

class Orders {
  constructor() {
    this.setParam();
    this.setQueryParam();
    setTimeout(() => this.init(), 500);
  }
  init() {
    this.p = new f.Pagination( '#paginator', {
      dbAction : this.mainAction,
      sortParam: this.queryParam,
      query: this.query.bind(this),
    });

    new f.SortColumns({
      thead: this.table.querySelector('thead'),
      query: this.query.bind(this),
      dbAction : this.mainAction,
      sortParam: this.queryParam,
    });
    this.loaderTable = new f.LoaderIcon(this.table);
    this.selected = new f.SelectedRow({table: this.table});

    this.ordersHeadRender();
    this.onEvent();
    this.query();
  }
  setParam() {
    this.M = new f.initModal();

    this.needReload = false;
    this.confirmMsg = '';
    this.dealerId = 0;

    this.filter = {};

    this.table = f.qS('#orderTable');
    this.confirm = f.qS('#confirmField');
    this.btnMainOnly = f.qA('#actionBtnWrap input.mainOnly');

    this.config = {
      ordersColumns: f.getData('#dataOrdersColumn'),
    }

    this.template = {
      tableHeader: f.gT('#tableHeaderCell'),
      impValue : null, // f.gT('#tableImportantValue'),
      searchMsg: f.gT('#noFoundSearchMsg'),
      columns  : f.gT('#orderColumnsTableTmp'),
    }
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

  // Orders tables
  ordersHeadRender() {
    const html = this.config.ordersColumns.reduce((r, column) => {
      return r += f.replaceTemplate(this.template.tableHeader, column);
    }, '');

    this.table.querySelector('thead tr').innerHTML = html;
  }
  ordersGetTableCellTemplate() {
    let tmp = '<tr><td><input type="checkbox" class="checkbox" data-id="${ID}"></td>';
    tmp += this.config.ordersColumns.reduce((r, column) => {
      if (column['dbName'] === 'ID') return r;
      return r += '<td>${' + column['dbName'] + '}</td>';
    }, '');

    return this.template.tableCell = tmp + '</tr>';
  }
  ordersPrepare(data) {
    return data.reduce((r, item) => {
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
      r[item['ID']] = item
      return r;
    }, {});
  }
  ordersFilter(search = false) {
    return Object.values(this.orders).filter(row => {
      if (search) return search === row;
      return true;
    });
  }
  ordersRender(search) {
    let html  = '',
        tbody = this.template.tableCell || this.ordersGetTableCellTemplate(),
        data  = this.ordersFilter(search);

    if (data.length) {
      html += f.replaceTemplate(tbody, data);
      setTimeout(() => this.selected.checkedRows());
    } else if (search) {
      html = this.template.searchMsg;
    }
    this.table.querySelector('tbody').innerHTML = html;
  }
  setOrders(data) {
    this.orders = this.ordersPrepare(data);
    this.ordersRender();
  }

  // Заполнить статусы
  fillSelectStatus(data) {
    let tmp = f.gT('#changeStatus'), html = '';

    html += f.replaceTemplate(tmp, data);

    f.gI('selectStatus').innerHTML = html;
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

    Object.entries(param).map(param => {
      data.set(param[0], param[1].toString());
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

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------
  /**
   * @param node
   * @param func
   * @param options
   * @param eventType {string}
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, e => func.call(this, e), options);
  }

  onEvent() {
    // Top buttons
    f.qA('input[data-action], button[data-action]', 'click', e => this.actionBtn.call(this, e));

    // Select
    f.qA('select[data-action]', 'change', e => this.actionSelect.call(this, e));

    // Focus Search Init
    let node = f.qS('#search');
    node.removeEventListener('focus', this.focusSearch);
    node.addEventListener('focus', this.focusSearch, {once: true});
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  focusSearch(e) {
    const dbAction = orders.table.dataset.type === 'order' ? this.mainAction : 'loadVisitorOrders';

    new AllOrdersList({dbAction, node: e.target, tableType: orders.table.dataset.type});
  }

  actionBtn(e) {
    let hideActionWrap = false,
        target         = e.target,
        action         = target.dataset.action,
        selectedSize   = this.selected.getSelectedSize();

    if (!selectedSize && !(['setupColumns', 'orderType']).includes(action)) { f.showMsg('Выберите заказ!', 'warning'); return; }
    this.queryParam.orderIds = this.selected.getSelected();
    if (!['confirmYes', 'confirmNo'].includes(action)) this.queryParam.dbAction = action;

    if (action.includes('confirm')) { // Закрыть подтверждение
      f.hide(this.confirm, f.qS('#selectStatus'), f.qS('#printTypeField'));
      f.show(f.qS('#actionBtnWrap'));

      if (action === 'confirmYes') {
        this.queryParam.commonValues = this.queryParam.orderIds;
        this.query();
      }
    } else { // Открыть подтверждение
      this[action] && (hideActionWrap = this[action](selectedSize, target));
      hideActionWrap && f.hide(f.qS('#actionBtnWrap'));
    }
  }
  changeStatusOrder() {
    this.needReload = true;

    let node = f.qS('#selectStatus');
    this.onEventNode(node, this.changeSelectInput, {}, 'change');
    node.dispatchEvent(new Event('change'));

    this.confirmMsg = 'Статусы Сохранены';
    f.show(this.confirm, node);
    return true;
  }
  delOrders() {
    this.needReload = true;
    this.confirmMsg = 'Удаление выполнено';
    f.show(this.confirm);
    return true;
  }
  loadOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    this.form.set('dbAction', 'loadOrderById');
    this.form.set( 'orderId', this.queryParam.orderIds);

    f.Post({data: this.form})
     .then(data => this.showOrder(data));
  }
  openOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let link = f.gI(f.ID.PUBLIC_PAGE),
        query = this.table.dataset.type === 'order' ? 'orderId=' : 'orderVisitorId=';
    link.href += '?' + query + this.selected.getSelected()[0];
    link.click();
  }
  printOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }
    let P    = f.initPrint(),
        data = new FormData();

    data.set('mode', 'docs');
    data.set('cmsAction', 'print');
    data.set('orderId', this.queryParam.orderIds);
    data.set('addManager', 'true');
    data.set('addCustomer', 'true');

    f.Post({data}).then(data => {
      try { data && P.print(data['printBody']); }
      catch (e) { console.log(e.message); }
    });
  }
  savePdf(selectedSize, target) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let data = new FormData(),
        url = this.dealerId ? 'dealer/' + this.dealerId + '/' : '';

    data.set('mode', 'docs');
    data.set('cmsAction', 'pdf');
    data.set('addCustomer', 'true');
    data.set('orderId', this.queryParam.orderIds);
    data.set('pdfOrientation', 'P');

    f.setLoading(target);
    target.setAttribute('disabled', 'disabled');

    f.Post({url: f.SITE_PATH + url, data}).then(data => {
      f.removeLoading(target);
      target.removeAttribute('disabled');
      if (data['pdfBody']) {
        f.saveFile({
          name: data['name'],
          type: 'base64',
          blob: 'data:application/pdf;base64,' + data['pdfBody']
        });
        target.blur();
      }
    });
  }
  sendOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let form = f.gTNode('#sendMailTmp');

    let fd = new FormData();
    fd.set('mode', 'DB');
    fd.set('dbAction', 'loadCustomerByOrder');
    fd.set('orderId', this.queryParam.orderIds);
    f.Post({data: fd})
      .then(data => {
        if (data['customer'] && data['customer']['contacts']) {
          let contacts = JSON.parse(data['customer']['contacts']),
              user = data['users'],
              node = form.querySelector('[name="email"]');

          this.queryParam.mode = 'docs';
          this.queryParam.cmsAction = 'mail';
          this.queryParam.docType = 'pdf';
          this.queryParam.orderId = this.queryParam.orderIds;
          this.queryParam.name = user.name || user['login'];
          this.queryParam.phone = contacts.phone || '';
          this.queryParam.email = contacts['email'];

          this.onEventNode(node, this.changeSelectInput, {}, 'change');
          contacts['email'] && (node.value = contacts['email']);

          this.M.btnConfig('confirmYes', {value: 'Отправить'});
          this.M.show('Отправить на почту', form);

          this.confirmMsg = 'Отправлено';
          // TODO Добавить проверку почты
          //f.initValid(() => {}, );
        }
      });
  }
  orderTypeChange(selectedSize, target) {
    if (this.orderType === target.value) return;
    this.orderType = target.value;

    this.queryParam.sortColumn = 'createDate';
    this.queryParam.sortDirect = false;
    this.queryParam.currPage   = 0;
    this.queryParam.pageCount  = 0;
    delete this.queryParam.orderIds;

    if (this.orderType.toString() === 'visit') {
      this.queryParam.dbAction  = 'loadVisitorOrders';
      this.queryParam.tableName = 'client_orders';
      this.table.dataset.type   = 'visit';

      f.hide(f.qS('#orderBtn'));
    } else {
      this.queryParam.dbAction  = this.mainAction;
      this.queryParam.tableName = 'orders';
      this.table.dataset.type   = 'order';

      f.show(f.qS('#orderBtn'));
    }

    this.setTableTemplate(this.table.dataset.type);
    this.query();
  }

  setupColumns() {
    this.M.show('Настройка колонок', this.template.columns);
  }

  actionSelect(e) {
    let target = e.target,
        action = target.dataset.action;

    let select = {
      'filterChange': () => this.filterChange(target),
    };

    select[action] && select[action]();
  }
  filterChange(target) {
    const id = target.value,
          dealerPath = f.SITE_PATH + 'dealer/' + id + '/';

    this.selected.clear();
    this.queryParam.mode = 'DB';
    this.queryParam.dbAction = this.mainAction;
    this.queryParam.orderIds = '[]';
    this.queryParam.currPage = 0;
    this.toggleDisableBtn(+id);

    this.query(+id ? dealerPath : undefined);
  }

  // Добавить проверку почты
  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  }
  changeSelectInput(e) {
    this.queryParam[e.target.name] = e.target.value;
  }
}

window.OrdersInstance = new Orders();
