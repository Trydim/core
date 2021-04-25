'use strict';

// Customers list for search
const CustomersList = {
  FD        : new FormData(),
  data      : [],
  searchData: Object.create(null),

  getFormData() {
    this.FD.set('mode', 'DB');
    this.FD.set('dbAction', 'loadCustomers');
    this.FD.set('countPerPage', '1000');
  },

  init() {
    this.searchComponent.init({
      popup: false,
      node: this.node,
      searchData: this.searchData,
      showResult: this.showResult.bind(this),
    });
  },

  setData(node) {
    !this.node && (this.node = node);

    this.node.addEventListener('input', this.inputSearch);
    this.getFormData();
    this.searchComponent = f.searchInit();

    f.Post({data: this.FD}).then(data => {
      data['customers'] && this.prepareSearchData(data['customers']);
      this.init();
    });
  },

  prepareSearchData(data) {
    this.data = data.reduce((r, i) => {
      let phone;
      try { phone = JSON.parse(i['contacts'])['phone'].replace(/ |-|_|\(|\)|@/g, ''); }
      catch { phone = ''; }

      this.searchData[i['C.ID']] = i['name'] + i['ITN'] + phone;
      r[i['C.ID']] = i;
      return r;
    }, Object.create(null));
  },

  showResult(node, resultIds) {
    if (resultIds.length) {
      f.setLoading(this.node);
      //this.FD.set('search', '1');
      this.FD.set('customerIds', JSON.stringify(resultIds));

      f.Post({data: this.FD}).then(data => {
        f.removeLoading(this.node);
        if (data['customers']) customers.fillTable(data['customers'], true);
      });
    } else customers.fillTable([], true);
  },

  inputSearch(e) {
    clearTimeout(this.delay);
    this.delay = setTimeout(() => {
      let value = e.target.value;

      if (value.length < 2) {
        customers.queryParam.dbAction = 'loadCustomers';
        customers.query();
      }
    }, 300);
  },

}

const orders = {
  data: Object.create(null),

  /**
   * @param id int
   * @param data string
   */
  setData(id, data) {
    if (!id) return;
    this.data[id] = data.split(',');
    return this;
  },

  getOrders(id) {
    //this.data[id] ? this.data[id] : [];
    let obj = this.data[id].reduce((r, i) => {
      r.push({value: i});
      return r;
    }, []);

    return f.replaceTemplate(this.ordersTmp, obj);
  },

  initTemplate() {
    this.ordersTmp = f.gT('#tableOrdersNumbers');
  },
}

export const customers = {
  form: new FormData(),

  needReload: false,
  table: f.gI('customersTable'),
  tbody: '',
  impValue: '',
  confirm: f.gI('confirmField'),

  queryParam: {
    mode        : 'DB',
    tableName   : 'customers',
    dbAction    : 'loadCustomers',
    sortColumn  : 'name',
    sortDirect  : false, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  },

  confirmMsg: false,

  delayFunc: () => {},
  //statusList: Object.create(null), // Типы доступов

  usersList: new Map(),

  init() {
    this.p = new f.Pagination( '#paginator',{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    new f.SortColumns(this.table.querySelector('thead'), this.query.bind(this), this.queryParam);
    this.M = f.initModal();
    this.query();

    this.onEvent();
  },

  setUsers(data) {
    this.usersList = new Map();
    data.forEach(i => this.usersList.set(i['C.ID'], i));
  },
  fillTable(data, search = false) {
    this.contValue || (this.contValue = f.gT('#tableContactsValue'));
    this.searchMsg || (this.searchMsg = f.gT('#noFoundSearchMsg'));
    this.orderBtn || (this.orderBtn = f.gT('#tableOrderBtn'));
    data = data.map(item => {
      if (item['contacts']) {
        let value = '';

        try {
          value = JSON.parse(item['contacts']);
          item['contactsParse'] = value;
          if (Object.values(value).length) {
            let arr = Object.entries(value).map(n => {
              return {key: _(n[0]), value: n[1]}
            });
            value = f.replaceTemplate(this.contValue, arr);
          } else value = '';
        } catch (e) {
          console.log(`Заказ ID:${item['U.ID']} имеет не правильное значение`);
        }
        item['contacts'] = value;
      }

      /*if(true /!* TODO настройки вывода даты*!/) {
        for (let i in item) {
          if(i.includes('date')) {
            item[i] = item[i].replace(/ |(\d\d:\d\d:\d\d)/g, '');
          }
        }
      }*/

      if (item['orders']) {
        orders.setData(item['C.ID'], item['orders'])
        item['orders'] = f.replaceTemplate(this.orderBtn, {'C.ID': item['C.ID']});
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

  query() {
    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1].toString());
    })

    f.Post({data: this.form}).then(data => {
      if (!data.status) { f.showMsg('Ошибка'); return; }

      if (this.needReload) {
        this.needReload = false;
        this.selectedId = new Set();
        this.queryParam.dbAction = 'loadCustomers';
        this.queryParam.orderIds = '[]';
        this.query();
        return;
      }

      data.status && this.confirmMsg && f.showMsg(this.confirmMsg);

      if(data['customers']) { this.setUsers(data['customers']); this.fillTable(data['customers']); }
      if(data['countRows']) this.p.setCountPageBtn(data['countRows']);
    });
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  // кнопки открыть закрыть и т.д.
  actionBtn(e) {
    let target = e.target,
        action = target.getAttribute('data-action');

    let select = {
      'addCustomer': () => {
        let form = f.gTNode('#customerForm');

        //this.onEventNode(form.querySelector('[name="name"]'), this.changeTextInput, {}, 'blur');

        ['name', 'phone', 'email', 'address', 'ITN'].map(i => {
          let node = form.querySelector(`[name="${i}"]`);
          i === 'phone' && f.maskInit(node);
          node && this.onEventNode(node, this.changeTextInput, {}, 'blur');
        });

        this.confirmMsg = 'Клиент добавлен';
        this.M.show('Добавление пользователя', form);
      },
      'changeCustomer': () => {
        if (this.selectedId.size !== 1) { f.showMsg('Выберите клиента!'); return; }

        let form = f.gTNode('#customerForm'), node,
            id = this.getSelectedList(),
            customer = this.usersList.get(id[0]);

        this.queryParam.usersId = id[0];
        node = form.querySelector('[name="name"]');
        this.onEventNode(node, this.changeTextInput, {}, 'blur');
        node.value = customer['name'];

        // Contacts
        let {phone = '', email = '', address = ''} = customer['contactsParse'];

        node = form.querySelector(`[name="phone"]`);
        this.onEventNode(node, this.changeTextInput, {}, 'blur');
        f.maskInit(node);
        node.value = phone;

        node = form.querySelector(`[name="email"]`);
        this.onEventNode(node, this.changeTextInput, {}, 'blur');
        node.value = email;

        node = form.querySelector(`[name="address"]`);
        this.onEventNode(node, this.changeTextInput, {}, 'blur');
        node.value = address;

        node = form.querySelector(`[name="ITN"]`);
        this.onEventNode(node, this.changeTextInput, {}, 'blur');
        node.value = customer['ITN'];

        form.querySelectorAll('input').forEach(n => {
          n.dispatchEvent(new Event('blur'));
        });

        this.confirmMsg = 'Изменения сохранены';
        this.M.show('Изменение клиента', form);
      },
      'delCustomer': () => {
        if (!this.selectedId.size) return;

        this.queryParam.usersId = JSON.stringify(this.getSelectedList());

        this.confirmMsg = 'Успешно удалено';
        this.M.show('Удалить', 'Удалить выбранных клиентов?');
      },
      'openOrders': () => {
        let id = target.dataset.id,
            div = document.createElement('div');

        orders.ordersTmp || orders.initTemplate();
        div.innerHTML = orders.getOrders(id);

        this.M.btnConfig('confirmYes', {value: 'Открыть'});
        this.M.show('Заказы', div);

        this.delayFunc = () => {
          let checked = div.querySelector('input:checked');
          if (!checked) return;

          let link = f.gI(f.ID.PUBLIC_PAGE);
          link.href += '?orderId=' + checked.value;
          link.click();
        };
      }
    }

    if(action === 'confirmYes') { // Закрыть подтверждение
      this.delayFunc();
      this.delayFunc = () => {};
      this.needReload = {dbAction: 'loadCustomers'};
      this.query();

    } else { // Открыть подтверждение
      this.queryParam.dbAction = action;
      select[action] && select[action]();
    }
  },

  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeCheckInput(e) {
    this.queryParam[e.target.name] = e.target.checked;
  },

  focusSearch(e) {
    CustomersList.setData(e.target);
  },

  // TODO bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   * @param options
   * @param eventType
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, (e) => func.call(this, e), options);
  },

  onEvent() {
    // Action buttons
    f.qA('input[data-action]', 'click', (e) => this.actionBtn(e));
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

  selectedId: new Set(), // TODO сохранять в сессии/локальном хранилище потом, что бы можно было перезагрузить страницу

  getSelectedList() {
    let ids = [];
    for( let id of this.selectedId.values()) ids.push(id);
    return ids;
  },

  clickRows(e) {
    let target = e.target,
        i = 0;

    if(target.tagName === 'INPUT') return false;

    while (target.tagName !== 'TR' && i < 4) {
      target = target.parentNode; i++;
    }
    if (target.tagName !== 'TR') return;
    target.querySelector('input').click();
  },

  // выбор пользователя
  selectRows(e) {
    let input = e.target,
        id = input.getAttribute('data-id');

    if (input.checked) this.selectedId.add(id);
    else this.selectedId.delete(id);
  },

  // Выделить выбранных
  checkedRows() {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      if (input) input.checked = true;
    });
  },

  onTableEvent() {
    // Checked rows
    this.table.querySelectorAll('tbody input').forEach(n => {
      if (n.type === 'checkbox') n.addEventListener('change', (e) => this.selectRows(e));
      else if (n.type === 'button') n.addEventListener('click', (e) => this.actionBtn(e));
    });
  },
}
