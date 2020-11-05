'use strict';

import {f} from '../../main.js';

export const users = {
  form: new FormData(),

  needReload: false,
  table: f.gI('usersTable'),
  tbody: '',
  impValue: '',
  confirm: f.gI('confirmField'),
  confirmMsg: false,

  queryParam: {
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
    this.form.set('mode', 'DB');
    this.form.set('tableName', 'users');
    this.M = f.initModal();
    this.query();

    this.onEvent();
  },

  setUsers(data) {
    this.usersList = new Map();
    data.forEach(i => this.usersList.set(i['U.ID'], i));
  },
  fillTable(data) {
    if(data.length === 0) {
      this.queryParam.currPage--; // TODO Отключить кнопку далее
      return;
    }

    this.contValue || (this.contValue = f.gT('tableContactsValue'));
    data = data.map(item => {
      if(item['contacts']) {
        let value = '';

        try {
          value = JSON.parse(item['contacts']);
          item['contactsParse'] = value;
          if(Object.values(value).length) {
            let arr = Object.entries(value).map(n => {
              return { key: n[0], value: n[1] };
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

  // Заполнить кнопки страниц
  fillPagination(count) {
    let countBtn = Math.ceil(+count / this.queryParam.countPerPage );

    if(this.queryParam.pageCount !== +countBtn) this.queryParam.pageCount = +countBtn;
    else return;

    if (countBtn === 1) { f.eraseNode(f.gI('onePageBtn')); return; }

    let html = '', tpl,
        input = f.gT('onePageInput');

    for(let i = 0; i < countBtn; i++) {
      tpl = input.replace('${page}', i.toString());
      tpl = tpl.replace('${pageValue}', (i + 1).toString());

      html += tpl;
    }

    f.gI('onePageBtn').innerHTML = html;
    this.onPagePaginationClick();
  },

  // Заполнить статусы
  fillPermission(data) {
    let tmp = f.gT('permission'), html  = '';

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
        this.pageBtn();
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status) && (this.confirmMsg = false);
      }

      if(data['users']) { this.setUsers(data['users']); this.fillTable(data['users']); }
      if(data['countRows']) this.fillPagination(data['countRows']);
      if(data['permissionUsers']) this.fillPermission(data['permissionUsers']);
    });
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  // сортировка заказов
  sortRows(e) { /*'↑'*/

    let input = e.target,
        colSort = input.getAttribute('data-ordercolumn');

    if(this.queryParam.sortColumn === colSort) {
      this.queryParam.sortDirect = !this.queryParam.sortDirect;
    } else {
      this.queryParam.sortColumn = colSort;
      this.queryParam.sortDirect = false;
    }

    this.table.querySelectorAll('thead input').forEach(n => n.classList.remove(f.CLASS_NAME.SORT_BTN_CLASS));
    input.classList.add(f.CLASS_NAME.SORT_BTN_CLASS);

    this.query();
  },

  // кнопки листания
  pageBtn(e) {
    let btn = e && e.target,
        key = btn && btn.getAttribute('data-action') || 'def';

    let select = {
      'new'  : () => { this.queryParam.currPage--; },
      'old'  : () => { this.queryParam.currPage++; },
      'page' : () => { this.queryParam.currPage = btn.getAttribute('data-page'); },
      'count': () => { this.queryParam.countPerPage = e.target.value; },
      'def'  : () => { this.queryParam.dbAction     = 'loadUsers'; },
    }
    select[key]();

    if (this.queryParam.currPage < 0) { this.queryParam.currPage = 0; return; }

    this.query();
  },

  // кнопки открыть закрыть и т.д.
  actionBtn(e) {
    let target = e.target,
        action = target.getAttribute('data-action');

    let select = {
      'addUser': () => {
        let form = f.gTNode('userForm');

        this.onEventNode(form.querySelector('[name="userName"]'), this.changeTextInput, {}, 'blur');

        // доступ по умолчанию, заменить на select // Временно
        let node = form.querySelector('[name="userPermission"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        node.dispatchEvent(new Event('blur'));

        ['userLogin', 'userPassword', 'userPhone', 'userMail', 'userMoreContact'].map(i => {
          let node = form.querySelector(`[name="${i}"]`);
          i === 'userPhone' && f.maskInit(node);
          node && this.onEventNode(node, this.changeTextInput, {}, 'blur');
        });

        form.querySelector('#changeField').remove();

        this.confirmMsg = 'Новый пользователь добавлен';
        this.M.show('Добавление пользователя', form);
      },
      'changeUser': () => {
        if (!this.selectedId.size) return;

        let oneElements = this.selectedId.size === 1,
            form = f.gTNode('userForm'), node,
            id = this.getSelectedList(),
            users = this.usersList.get(id[0]);

        this.queryParam.usersId = JSON.stringify(this.getSelectedList());
        node = form.querySelector('[name="userName"]');
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = users['U.name']; }
        else node.parentNode.remove();

        node = form.querySelector('[name="userPermission"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        if(oneElements) node.value = users['permission_id'];
        else node.value = 1;

        node = form.querySelector('[name="userLogin"]');
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = users['login']; }
        else node.parentNode.remove();

        form.querySelector('[name="userPassword"]').parentNode.remove();

        // Contacts
        let emObj = {value: ''},
            {phone = emObj, mail = emObj, more = emObj} = users['contactsParse'];

        node = form.querySelector(`[name="userPhone"]`);
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = phone.value;
          f.maskInit(node); }
        else node.parentNode.remove();

        node = form.querySelector(`[name="userMail"]`);
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = mail.value; }
        else node.parentNode.remove();

        node = form.querySelector(`[name="userMoreContact"]`);
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = more.value; }
        else node.parentNode.remove();

        node = form.querySelector('[name="userActivity"]');
        node.checked = oneElements ? !!(+users['activity']) : true;
        this.onEventNode(node, this.changeCheckInput, {}, 'change');

        form.querySelectorAll('input').forEach(n => {
          n.dispatchEvent(new Event('blur'));
        });

        this.confirmMsg = 'Изменения сохранены';
        this.M.show('Изменение пользователей', form);
      },
      'changeUserPassword': () => { // TODO доработать изменение пароля
        if (this.selectedId.size !== 1) return;

        let id = this.getSelectedList(),
            user = this.usersList.get(id[0]),
            form = f.gTNode('userChangePassForm');

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
        this.delayFunc = () => {
          this.selectedId.clear();
        };

        this.confirmMsg = 'Удаление успешно';
        this.M.show('Удалить', 'Удалить выбранных пользователя?');
      },
    }

    if(action === 'confirmYes') { // Закрыть подтверждение

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
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeSelectInput(e) {
    this.queryParam[e.target.name] = e.target.value;
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
    // Sort Btn
    this.table.querySelectorAll('thead input').forEach(n => {
      n.addEventListener('click', (e) => this.sortRows.call(this, e));
    });

    // Pagination btn
    f.qA('#footerBlock input[data-action]', 'click', (() => (e) => this.pageBtn.call(this, e))());
    f.qA('#footerBlock select[data-action]', 'change', (() => (e) => this.pageBtn.call(this, e))());

    // Action buttons
    f.qA('input[data-action]', 'click', (() => (e) => this.actionBtn.call(this, e))());

    // Click on row for selected
    this.onEventNode(this.table.querySelector('tbody'), (e) => this.clickRows(e));
  },

  onPagePaginationClick(e) {
    f.qA('#onePageBtn input[data-action]', 'click', (() => (e) => this.pageBtn.call(this, e))());
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
