'use strict';

// Orders list for search
const allOrdersList = {
  FD        : new FormData(),
  data      : [],
  searchData: Object.create(null),

  getFormData() {
    this.FD.set('mode', 'DB');
    this.FD.set('dbAction', 'loadOrders');
    this.FD.set('countPerPage', '1000');
  },

  init() {
    this.count = 1;
    this.searchComponent.init({
      popup: false,
      node: this.node,
      searchData: this.searchData,
      showResult: this.showResult.bind(this),
    });
  },

  setData(node) {
    !this.node && (this.node = node);

    this.getFormData();
    this.searchComponent = f.searchInit();

    f.Post({data: this.FD}).then(data => {
      data['orders'] && this.prepareSearchData(data['orders']);
      this.init();
    });
  },

  prepareSearchData(data) {
    this.data = data.reduce((r, i) => {
      this.searchData[i['O.ID']] = i['O.ID'] + i['C.name'] + i['name'];
      r[i['O.ID']] = i;
      return r;
    }, Object.create(null));
  },

  showResult(node, resultIds) {
    let array = [];
    resultIds.forEach(i => array.push(this.data[i]));
    orders.fillTable(array, true);
    /* Todo что бы учитывать настройки пагинации нужен запрос
    if (resultIds.length) {
      f.setLoading(this.node);
      this.FD.set('search', '1');
      this.FD.set('orderIds', JSON.stringify(resultIds));

      f.Post({data: this.FD}).then(data => {
        f.removeLoading(this.node);
        if (data['orders']) orders.fillTable(data['orders'], true);
      });
    } else orders.fillTable([], true);*/
  },
}

export const orders = {
  M: f.initModal(),
  form: new FormData(),

  needReload: false,
  table: f.gI('orderTable'),
  tbody: '',
  impValue: '',
  confirm: f.gI('confirmField'),
  confirmMsg: false,

  queryParam: {
    mode        : 'DB',
    dbAction    : 'loadOrders',
    tableName   : 'orders',
    sortColumn  : 'create_date',
    sortDirect  : false, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  },

  statusList: Object.create(null), // Возможные статусы

  btnOneOrderOnly: f.qA('#actionBtnWrap input.oneOrderOnly'),
  btnMoreZero: f.qA('#actionBtnWrap input:not(.oneOrderOnly)'),

  init() {
    this.p = new f.Pagination( '#paginator',{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    new f.SortColumns(this.table.querySelector('thead'), this.query.bind(this), this.queryParam);
    this.l = new f.LoaderIcon(this.table);
    this.query();

    this.onEvent();
  },

  fillTable(data, search = false) {
    this.impValue || (this.impValue = f.gT('#tableImportantValue'));
    this.searchMsg || (this.searchMsg = f.gT('#noFoundSearchMsg'));
    data = data.map(item => {
      if(item.important_value) {
        let value = '';

        if(false /* TODO настройки вывода даты*/) {
          for (let i in item) {
            if(i.includes('date')) {
              //let date = new Date(item[i]);
              item[i] = item[i].replace(/ |(\d\d:\d\d:\d\d)/g, '');
            }
          }
        }

        try {
          value = JSON.parse(item.important_value);
          if(Object.values(value).length) {
            value = f.replaceTemplate(this.impValue, value);
          } else value = '';
        }
        catch (e) { console.log(`Заказ ID:${item['O.ID']} имеет не правильное значение`); }
        item.important_value = value;
      }
      return item;
    })

    let html  = '';
    this.tbody || (this.tbody = this.table.querySelector('tbody tr').outerHTML);
    data.length && (html += f.replaceTemplate(this.tbody, data));
    !data.length && search && (html = this.searchMsg);
    this.table.querySelector('tbody').innerHTML = html;

    data.length && this.onTableEvent();
    data.length && this.checkedRows();
  },

  // Заполнить статусы
  fillSelectStatus(data) {
    let tmp = f.gT('#changeStatus'), html  = '';

    html += f.replaceTemplate(tmp, data);

    f.gI('selectStatus').innerHTML = html;
  },

  // Открыть заказ TODO кнопка скрыта
  showOrder(data) {
    if(!data['order']) console.log('error');

    let tmp = f.gT('#orderOpenForm'),
        html = document.createElement('div');

    data['order']['important_value'] = JSON.parse(data['order']['important_value'])[0];

    html.innerHTML = f.replaceTemplate(tmp, data['order']);

    this.M.show('Заказ ' + data['order']['ID'], html);
  },

  query() {
    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1]);
    })

    this.l.start();
    f.Post({data: this.form}).then(data => {
      if(this.needReload) {
        this.needReload = false;
        this.selectedId = new Set();
        this.queryParam.dbAction = 'loadOrders';
        this.queryParam.orderIds = '[]';
        this.query();
        return;
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status) && (this.confirmMsg = false);
      }

      if(data['orders']) this.fillTable(data['orders']);
      if(data['countRows']) this.p.setCountPageBtn(data['countRows']);
      if(data.hasOwnProperty('statusOrders')) this.fillSelectStatus(data['statusOrders']);

      this.l.stop();
    });
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  // кнопки открыть закрыть и т.д.
  actionBtn(e) {
    let hideActionWrap = true,
        target = e.target,
        action = target.getAttribute('data-action');

    if (!this.selectedId.size) { f.showMsg('Выберите заказ!'); return; }
    this.queryParam.orderIds = JSON.stringify(this.getSelectedList());

    let select = {
      'changeStatusOrder': () => {
        this.needReload = true;
        this.queryParam.dbAction = action;

        let node = f.gI('selectStatus');
        this.onEventNode(node, this.changeSelectInput, {}, 'change');
        node.dispatchEvent(new Event('change'));

        this.confirmMsg = 'Статусы Сохранены';
        f.show(this.confirm, node);
      },
      'delOrders': () => {
        this.needReload = true;
        this.queryParam.dbAction = action;
        this.queryParam.orderIds = JSON.stringify(this.getSelectedList());

        this.confirmMsg = 'Удаление выполнено';
        f.show(this.confirm);
      },
      'loadOrder': () => {
        hideActionWrap = false;
        if(this.selectedId.size !== 1) { f.showMsg('Выберите 1 заказ!'); return; }

        this.form.set('dbAction', action);
        this.form.set( 'orderIds', this.queryParam.orderIds);
        f.Post({data: this.form})
          .then((data) => this.showOrder(data));
      },
      'openOrder': () => {
        if (this.selectedId.size !== 1) {
          hideActionWrap = false; f.showMsg('Выберите 1 заказ!');
          return;
        }

        let link = f.gI(f.ID.PUBLIC_PAGE);
        link.href += '?orderId=' + this.getSelectedList()[0];
        link.click();
      },
      'printOrder': () => {
        if(this.selectedId.size !== 1) {
          hideActionWrap = false;
          f.showMsg('Выберите 1 заказ!');
          return;
        }
        f.show(f.gI('printTypeField'));
      },
      'printReport': () => {
        if(this.selectedId.size !== 1) { f.showMsg('Выберите 1 заказ!'); return; }
        let P = f.initPrint(),
            type = target.dataset.type || false,
            fd = new FormData();

        fd.set('mode', 'DB');
        fd.set('dbAction', 'loadOrder');
        fd.set( 'orderIds', this.queryParam.orderIds);
        f.Post({data: fd})
          .then((data) => {
            try {
              data && P.orderPrint(f.printReport, data, type);
            } catch (e) {
              console.log(e.message);
            }
          });

        f.hide(f.gI('printTypeField'));
        f.show(f.gI('actionBtnWrap'));
        hideActionWrap = false;
      },
      'savePdf': () => {
        hideActionWrap = false;
        if(this.selectedId.size !== 1) { f.showMsg('Выберите 1 заказ!'); return; }
        let fd = new FormData(),
            loading = new f.LoaderIcon(target);

        fd.set('mode', 'docs');
        fd.set('docType', 'pdf');
        fd.set( 'orderIds', this.queryParam.orderIds);
        f.Post({data: fd})
          .then(data => {
            loading.stop();
            target.blur();
            if(data['pdfBody']) f.saveFile({
              name: data['name'],
              type: 'base64',
              blob: 'data:application/pdf;base64,' + data['pdfBody']
            });
          });
      },
      'sendOrder': () => {
        hideActionWrap = false;
        if(this.selectedId.size !== 1) { f.showMsg('Выберите 1 заказ!'); return; }
        let form = f.gTNode('#sendMailTmp');

        let fd = new FormData();
        fd.set('mode', 'DB');
        fd.set('dbAction', 'loadCustomerByOrder');
        fd.set( 'orderIds', this.queryParam.orderIds);
        f.Post({data: fd})
          .then(data => {
            if(data['customer'] && data['customer']['contacts']) {
              let contacts = JSON.parse(data['customer']['contacts']),
                  user = data['users'],
                  node = form.querySelector('[name="email"]');

              this.queryParam.name = user.name;
              this.queryParam.phone = user.contacts.phone;
              this.onEventNode(node, this.changeSelectInput, {}, 'change');
              contacts['email'] && (node.value = contacts['email']);
              node.dispatchEvent(new Event('change'));

              // TODO Добавить проверку почты
              this.queryParam.mode = 'docs';
              this.queryParam.docType = 'mail';
              this.M.btnConfig('confirmYes', {value: 'Отправить'});
              this.M.show('Отправить на почту', form);

              this.confirmMsg = 'Отправлено';
              //f.initValid(() => {}, );
            }
          });
      },
      'cancelPrint': () => {
        hideActionWrap = false;
        f.show(f.gI('actionBtnWrap'));
        f.hide(f.gI('printTypeField'));
      },
    }

    if(action.includes('confirm')) { // Закрыть подтверждение
      f.hide(this.confirm, f.gI('selectStatus'), f.gI('printTypeField'));
      f.show(f.gI('actionBtnWrap'));

      if(action === 'confirmYes') {
        this.queryParam.commonValues = JSON.stringify(this.getSelectedList());
        this.query();
      }

    } else { // Открыть подтверждение
      this.queryParam.dbAction = action;
      select[action]();
      hideActionWrap && f.hide(f.gI('actionBtnWrap'));
    }
  },

  // Добавить проверку почты
  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeSelectInput(e) {
    this.queryParam[e.target.name] = e.target.value;
  },

  focusSearch(e) {
    allOrdersList.setData(e.target);
  },

  // TODO bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, (e) => func.call(this, e), options);
  },

  onEvent() {
    // Right buttons
    f.qA('input[data-action]', 'click', (e) => this.actionBtn.call(this, e));

    // Click on row for selected
    this.onEventNode(this.table.querySelector('tbody'), (e) => this.clickRows(e));

    // Focus Search Init
    this.onEventNode(f.gI('search'), this.focusSearch, {once: true}, 'focus');
  },

  /*onCheckEdit(node) {
    node.querySelectorAll('input').forEach(n => {
      n.addEventListener('blur', (e) => this.blurInput(e));
      n.addEventListener('focus', (e) => this.focusInput(e));
    });
  },*/

  selectedId: new Set(), // TODO сохранять в сессии потом, что бы можно было перезагрузить страницу

  getSelectedList() {
    let ids = [];
    for( let id of this.selectedId.values()) ids.push(id);
    return ids;
  },

  clickRows(e) {
    let target = e.target,
        i = 0;

    if(target.tagName === 'INPUT') return false;

    while (target.tagName !== 'TR' || i > 4) {
      target = target.parentNode; i++;
    }

    let node = target.querySelector('input');
    node && node.click();
  },

  // выбор заказа
  selectRows(e) {
    let input = e.target,
        id = input.getAttribute('data-id');

    if (input.checked) this.selectedId.add(id);
    else this.selectedId.delete(id);

    //this.checkBtnRows();
  },

  /* Кнопки показать скрыть
  checkBtnRows() {
    if (this.selectedId.size === 1) f.show(this.btnOneOrderOnly);
    else f.hide(this.btnOneOrderOnly);
    if (this.selectedId.size > 0) f.show(this.btnMoreZero);
    else f.hide(this.btnMoreZero);
  },*/

  // Выделить выбранные Заказы
  checkedRows() {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      if (input) input.checked = true;
    });
  },

  onTableEvent() {
    // Checked rows
    this.table.querySelectorAll('tbody input').forEach(n => {
      n.addEventListener('change', (e) => this.selectRows(e));
    });
  },
}
