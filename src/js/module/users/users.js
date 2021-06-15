'use strict';

export const users = {
  form: new FormData(),

  needReload: false,
  table: f.gI('usersTable'),
  tbody: '',
  impValue: '',
  confirm: f.gI('confirmField'),
  confirmMsg: false,

  template: {
    form: f.gTNode('#userForm'),
  },

  queryParam: {
    mode        : 'DB',
    tableName   : 'users',
    dbAction    : 'loadUsers',
    sortColumn  : 'register_date',
    sortDirect  : false, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  },

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
    data.forEach(i => this.usersList.set(i['U.ID'], i));
  },
  fillTable(data) {
    this.contValue || (this.contValue = f.gT('#tableContactsValue'));
    data = data.map(item => {
      item['P.name'] && (item['P.name'] = _(item['P.name']));
      if (item['activity']) {
        item.activityValue = item['activity'] === "1";
        item['activity'] = item.activityValue ? '+' : '-';
      }

      if (item['contacts']) {
        let value = '';

        try {
          value = JSON.parse(item['contacts']);
          item['contactsParse'] = value;
          if(Object.values(value).length) {
            let arr = Object.entries(value).map(([key, value]) => {
              return {key: _(key), value};
            });
            value = f.replaceTemplate(this.contValue, arr);
          } else value = '';
        }
        catch (e) { console.log(`Заказ ID:${item['U.ID']} имеет не правильное значение`); }
        item['contacts'] = value;
      }

      if(true /* TODO настройки вывода даты*/) {
        for (let i in item) {
          if(i.includes('date')) {
            item[i] = item[i].replace(/ |(\d\d:\d\d:\d\d)/g, '');
          }
        }
      }

      return item;
    })

    let html  = '';
    this.tbody || (this.tbody = this.table.querySelector('tbody tr').outerHTML);
    html += f.replaceTemplate(this.tbody, data);
    this.table.querySelector('tbody').innerHTML = html;

    this.onTableEvent();
    this.checkedRows();
  },

  setPermission(data) {
    this.permissionList = new Map();
    data.forEach(i => this.permissionList.set(i['ID'], i));
  },
  // Заполнить статусы
  fillPermission(data) {
    let tmp = f.gT('#permission'), html  = '';

    html += f.replaceTemplate(tmp, data);

    f.gI('selectPermission').innerHTML = html;
  },

  query() {
    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1]);
    })

    f.Post({data: this.form}).then(data => {

      if(this.needReload) {
        this.needReload = false;
        this.selectedId = new Set();
        this.queryParam.dbAction = 'loadUsers';
        this.queryParam.usersId = '[]';
        this.query();
        return;
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status) && (this.confirmMsg = false);
      }

      if(data['permissionUsers']) { this.setPermission(data['permissionUsers']); this.fillPermission(data['permissionUsers']); }
      if(data['users']) { this.setUsers(data['users']); this.fillTable(data['users']); }
      if(data['countRows']) this.p.setCountPageBtn(data['countRows']);
    });
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  // кнопки открыть закрыть и т.д.
  actionBtn(e) {
    let target = e.target,
        action = target.getAttribute('data-action'),
        form;

    if (['addUser', 'changeUser'].includes(action)) {
      this.delayFunc = () => {
        const f = new FormData(form), res = {};
        for (const [k, v] of f.entries()) {
          res[k] = v;
        }
        this.queryParam.authForm = JSON.stringify(res);
      };
    }

    let select = {
      'addUser': () => {
        form = this.template.form.cloneNode(true);
        form.querySelector('#changeField').remove();
        this.confirmMsg = 'Новый пользователь добавлен';
        this.M.show('Добавление пользователя', form);
      },
      'changeUser': () => {
        if (!this.selectedId.size) { f.showMsg('Выберите минимум 1 пользователя', 'error'); return; }

        let oneElements = this.selectedId.size === 1, node,
            id = this.getSelectedList(),
            users = this.usersList.get(id[0]);
        form = this.template.form.cloneNode(true);

        this.queryParam.usersId = JSON.stringify(this.getSelectedList());

        node = form.querySelector('[name="name"]');
        if (oneElements) node.value = users['U.name'];
        else node.parentNode.remove();

        node = form.querySelector('[name="permission_id"]');
        if (oneElements) node.value = users['permission_id'];
        else node.value = 1;

        node = form.querySelector('[name="login"]');
        if (oneElements) node.value = users['login'];
        else node.parentNode.remove();

        form.querySelector('[name="password"]').parentNode.remove();

        // Contacts
        Object.entries(users['contactsParse']).forEach(([k, v]) => {
          node = form.querySelector(`[name="${k}"]`);
          if (node) {
            if (oneElements) {
              node.value = v;
              node.type === 'tel' && f.maskInit(node);
            } else node.parentNode.remove();
          }
        });

        node = form.querySelectorAll('.managerField');
        if (oneElements) {
          node.forEach(n => {
            let input = n.querySelector('input[name]'),
                name = input.name;

            users[name] && (input.value = users[name]);
          });
        } else node.forEach(n => n.remove());

        node = form.querySelector('[name="activity"]');
        node.checked = oneElements ? users.activityValue : true;

        this.confirmMsg = 'Изменения сохранены';
        this.M.show('Изменение пользователей', form);
      },
      'changeUserPassword': () => { // TODO доработать изменение пароля
        if (this.selectedId.size !== 1) return;

        let id = this.getSelectedList(),
            user = this.usersList.get(id[0]),
            form = f.gTNode('#userChangePassForm');

        this.queryParam.usersId = JSON.stringify(this.getSelectedList());

        let newPass = form.querySelector('[name="newPass"]'),
            repeatPass = form.querySelector('[name="repeatPass"]');

        this.onEventNode(newPass, this.changeTextInput, {}, 'change');
        this.onEventNode(repeatPass, (e) => this.changePassword.apply(this, [e, newPass]), {}, 'change');

        this.confirmMsg = 'Новый пароль сохранен';
        this.M.show('Изменить пароль пользователя ' + user['U.name'], form);
      },
      'delUser': () => {
        if (!this.selectedId.size) return;

        this.queryParam.usersId = JSON.stringify(this.getSelectedList());
        this.delayFunc = () => this.selectedId.clear();

        this.confirmMsg = 'Удаление успешно';
        this.M.show('Удалить', 'Удалить выбранных пользователя?');
      },
    }

    if (action === 'confirmYes') { // Закрыть подтверждением
      this.delayFunc();
      this.delayFunc = () => {};
      this.needReload = {dbAction: 'loadUsers'};
      this.query();
    } else { // Открыть подтверждение
      this.queryParam.dbAction = action;
      select[action] && select[action]();
    }
  },

  changeTextInput(e) {
    if (e.target.value.length <= 2) e.target.value = '';
    //this.queryParam[e.target.name] = e.target.value;
  },
  changeCheckInput(e) {
    this.queryParam[e.target.name] = e.target.checked;
  },
  changePassword(e, newPass) {
    if(e.target.value !== newPass.value) { e.target.value = 'Ошибка'; return; }
    this.queryParam['validPass'] = e.target.value;
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
    // Action buttons
    f.qA('input[data-action]', 'click', (() => (e) => this.actionBtn.call(this, e))());

    // Click on row for selected
    this.onEventNode(this.table.querySelector('tbody'), (e) => this.clickRows(e));
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

    while (target.tagName !== 'TR' || i > 4) {
      target = target.parentNode; i++;
    }
    target.querySelector('input').click();
  },

  // выбор пользоваетля
  selectRows(e) {
    let input = e.target,
        id = input.getAttribute('data-id');

    if (input.checked) this.selectedId.add(id);
    else this.selectedId.delete(id);

  },

  // Выделить выбранных Пользователей
  checkedRows() {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      if (input) input.checked = true;
    });
  },

  onTableEvent() {
    // Checked rows
    this.table.querySelectorAll('tbody input').forEach(n => {
      n.addEventListener('change', (e) => this.selectRows.call(this, e));
    });
  },
}
