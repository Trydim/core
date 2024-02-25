'use strict';

const node = {
  table  : undefined,
  tRow   : undefined,
  confirm: undefined,
};
const tmp = {
  form    : undefined,
  contacts: undefined,
}

const data = {
  usersList: new Map(),
  managerField: {},
  usersLogin: [], // Не безопастно
  currentLogin: '',
}

const users = {
  form: new FormData(),

  needReload: false,
  impValue: '',

  confirmMsg: false,

  queryParam: {
    mode        : 'DB',
    tableName   : 'users',
    dbAction    : 'loadUsers',
    sortColumn  : 'registerDate',
    sortDirect  : false, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  },

  delayFunc: () => {},

  init() {
    const table = node.table = f.qS('#usersTable');

    tmp.form = f.gTNode('#userForm');

    data.managerField = f.getData('#dataManagerField');

    this.p = new f.Pagination( '#paginator',{
      dbAction : 'loadUsers',
      sortParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.id = new f.SelectedRow({table});
    new f.SortColumns({
      thead: table.querySelector('thead'),
      query: this.query.bind(this),
      dbAction : 'loadUsers',
      sortParam: this.queryParam,
    });
    this.M = new f.initModal();
    this.query();

    this.onEvent();
  },

  setUsers(users) { users.forEach(i => data.usersList.set(i['ID'], i)); },
  fillTable(users) {
    const contactsTmp = tmp.contacts || (tmp.contacts = f.gT('#tableContactsValue'));

    users = users.map(item => {
      if (item.activity) {
        item.activityValue = !!+item.activity;
        item.activity = item.activityValue ? 'check' : 'times';
        item.activity = `<i class="pi pi-${item.activity}"></i>`;
      }

      if (item['contacts']) {
        let arr = Object.entries(item['contacts']).map(([key, value]) => {
          return {
            key  : _(key),
            value: data.managerField[key] ? data.managerField[key][value] : value
          };
        });

        item['contactsParse'] = item['contacts'];
        item['contacts'] = f.replaceTemplate(contactsTmp, arr);
      }

      //if (true /* TODO настройки вывода даты */) {
      for (let i in item) {
        if (i.includes('date')) item[i] = item[i].replace(/ |(\d\d:\d\d:\d\d)/g, '');
      }
      //}

      return item;
    })

    const tRow = node.tRow || (node.tRow = node.table.querySelector('tbody tr').outerHTML);
    node.table.querySelector('tbody').innerHTML = f.replaceTemplate(tRow, users);
  },

  setPermission(data) {
    this.permissionList = new Map();
    data.forEach(i => this.permissionList.set(i['ID'], i));
  },

  fillPermission(data) {
    f.gI('selectPermission').innerHTML = f.replaceTemplate(f.gT('#permission'), data);
  },
  // Check unique login
  loadAllLogins() {
    f.Get({data: {mode: 'DB', cmsAction: 'loadUsersLogin'}})
     .then(d => data.usersLogin = d.status ? d['users'] : []);
  },
  validLogin(form, validator) {
    const loginNode = form.querySelector('[name="login"]');

    if (!data.usersLogin.length) this.loadAllLogins();

    validator.countNodes += 1;
    if (data.currentLogin) validator.setValidated(loginNode);

    loginNode.addEventListener('input', () => this.inputLogin(loginNode, validator));
  },

  query() {
    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1].toString());
    })

    f.Post({data: this.form}).then(data => {
      if (this.needReload) {
        this.needReload = false;
        this.queryParam.dbAction = 'loadUsers';
        this.queryParam.usersId = '[]';
        this.query();
        return;
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status ? 'success' : 'error') && (this.confirmMsg = false);
      }

      if (data['permissionUsers']) { this.setPermission(data['permissionUsers']); this.fillPermission(data['permissionUsers']); }
      if (data['users']) { this.setUsers(data['users']); this.fillTable(data['users']); }
      if (data['countRows']) this.p.setCountPageBtn(data['countRows']);
    });
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  inputLogin: (loginNode, validator) => {
    let login = loginNode.value,
        haveLogin = data.usersLogin.includes(login),
        sameLogin = data.currentLogin && login === data.currentLogin,
        toShort   = login.length < 3;

    if ((haveLogin && !sameLogin) || toShort) {
      validator.setErrorValidate(loginNode);
      loginNode.title = haveLogin ? 'Пользователь с таким логином существует' : 'Логин слишком короткий';
    } else {
      validator.setValidated(loginNode);
      loginNode.title = '';
    }

    validator.checkConfirmBtn();
  },

  // кнопки открыть закрыть и т.д.
  actionBtn(e) {
    e.stopImmediatePropagation();

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

    if (action === 'confirmYes') { // Закрыть подтверждением
      this.delayFunc();
      this.delayFunc = () => {};
      this.needReload = {dbAction: 'loadUsers'};
      this.query();
    } else if (action === 'confirmNo') {
      this.reloadAction = false;
    } else {
      this.queryParam.dbAction = action;
      form = this[action] && this[action]();
    }
  },

  addUser() {
    const form = tmp.form.cloneNode(true);
    form.querySelector('#changeField').remove();

    data.currentLogin = '';
    this.validLogin(form, new f.Valid({form}));

    this.confirmMsg = _('New user added');
    this.M.show(_('Add new user'), form);
    return form;
  },
  changeUser() {
    if (!this.id.getSelectedSize()) { f.showMsg(_('Please select at least 1 user'), 'error'); return; }

    let oneElements = this.id.getSelectedSize() === 1, node,
        id    = this.id.getSelected(),
        users = data.usersList.get(id[0]),
        form  = tmp.form.cloneNode(true);

    this.queryParam.usersId = JSON.stringify(id);

    node = form.querySelector('[name="name"]');
    if (oneElements) node.value = users['name'];
    else node.parentNode.remove();

    node = form.querySelector('[name="permissionId"]');
    if (oneElements) node.value = users['permissionId'];
    else node.value = 1;

    node = form.querySelector('[name="login"]');
    if (oneElements) data.currentLogin = node.value = users['login'];
    else node.parentNode.remove();

    form.querySelector('[name="password"]').parentNode.remove();

    // Contacts
    users['contactsParse'] && Object.entries(users['contactsParse']).forEach(([k, v]) => {
      node = form.querySelector(`[name="${k}"]`);
      if (node) {
        if (oneElements) {
          node.value = v;
          node.type === 'tel' && f.initMask(node);
        } else node.parentNode.remove();
      }
    });

    node = form.querySelectorAll('.managerField');
    if (oneElements) {
      node.forEach(n => {
        let input = n.querySelector('input[name], textarea[name], select[name]'),
            name = input.name;

        users[name] && (input.value = users[name]);
      });
    } else node.forEach(n => n.remove());

    node = form.querySelector('[name="activity"]');
    node.checked = oneElements ? users.activityValue : true;

    if (oneElements) this.validLogin(form, new f.Valid({form}));

    this.confirmMsg = _('Changes saved');
    this.M.show(_('Changing Users'), form);
    return form;
  },
  changeUserPassword() { // TODO доработать изменение пароля
    if (this.id.getSelectedSize() !== 1) { f.showMsg(_('Select only one user'), 'error'); return; }

    let id   = this.id.getSelected(),
        user = data.usersList.get(id[0]),
        form = f.gTNode('#userChangePassForm');

    this.queryParam.usersId = JSON.stringify(id);

    let newPass = form.querySelector('[name="newPass"]'),
        repeatPass = form.querySelector('[name="repeatPass"]');

    this.onEventNode(newPass, e => this.changeTextInput(e, repeatPass), {}, 'change');
    this.onEventNode(repeatPass, e => this.changePassword(e, newPass), {}, 'change');

    new f.Valid({form});

    this.confirmMsg = _('New password saved');
    this.M.show(_('Change user password') + ' ' + user['name'], form);
    return form;
  },
  delUser() {
    if (!this.id.getSelectedSize()) return;

    this.queryParam.usersId = JSON.stringify(this.id.getSelected());
    this.delayFunc = () => this.id.clear();

    this.confirmMsg = _('Deleted');
    this.M.show(_('Delete'), _('Delete selected users?'));
    this.M.btnConfirm.classList.remove('cl-confirm-disabled');
    this.M.btnConfirm.removeAttribute('disabled');
  },

  changeTextInput(e, repeatPass) {
    if (e.target.value.length <= 2) e.target.value = '';
    repeatPass.value = '';
  },
  changePassword(e, newPass) {
    if (e.target.value !== newPass.value) {
      e.target.value = newPass.value = '';
      f.showMsg(_('Password mismatch'), 'error');
      return;
    }
    this.queryParam.validPass = e.target.value;
  },

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   * @param options
   * @param eventType
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, e => func.call(this, e), options);
  },

  onEvent() {
    // Action buttons
    f.qA('input[data-action]', 'click', e => this.actionBtn.call(this, e));
  },
}

document.addEventListener("DOMContentLoaded", () => {
  window.UsersInstance = users;
  // Delay for hooks
  setTimeout(() => users.init(), 0);
});
