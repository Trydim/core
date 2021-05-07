'use strict';

const getFieldNode = (p, field) => p.querySelector(`[data-field=${field}]`);

export const setting = {
  form: {
    mail: f.qS('#mailForm'),
    user: f.qS('#userForm'),
    custom: f.qS('#customForm'),
    manager: f.qS('#managerForm'),
    permission: f.qS('#permission'),
  },

  field   : Object.create(null),
  template: Object.create(null),

  queryParam: {
    mode: 'setting',
  },

  init() {
    this.setParam();
    this.loadSetting();

    this.onEvent();
    return this;
  },

  setParam() {
    if (this.form.manager) {
      this.field.customField = getFieldNode(this.form.manager, 'customField');
      this.template.customField = f.gTNode('#customField');
    }
  },

  query(form) {

    Object.entries(this.queryParam).map(param => {
      form.set(param[0], param[1]);
    })

    f.Post({data: form}).then(data => {
      f.showMsg('Сохранено');
    });
  },

  loadSetting() {
    let node = f.qS('#userSetting'),
        value = node ? JSON.parse(node.value) : '';

    if (value) {
      node.remove();

      if (value['managerSetting']) {
        Object.values(value['managerSetting']).forEach((v) => {
          this.addManagerField(v['name'], v['type']);
        });
      }
      //value.setting && (value.setting = JSON.parse(value.setting));
      //value.user.customization && (value.user.customization = JSON.parse(value.user.customization));
    }

    node = f.qS('#permissionSetting');
    value = node ? JSON.parse(node.value) : '';
    if (value) {
      // todo убрать reduce не надо
      this.permission = value.reduce((r, item) => {
        let id = item.ID;
        delete item.ID;

        if (item['accessVal']['menuAccess']) {
          let menus = item['accessVal']['menuAccess'].split(','),
              node = this.form.permission.querySelector(`[name="permMenuAccess_${id}"]`);
          menus.forEach(menu => {
            node.querySelector(`[value="${menu}"]`).selected = true;
          });
        }
        r[id] = item;
        return r;
      }, {});
    }
  },

  // bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    f.qS('#settingForm').addEventListener('click', (e) => this.commonClick(e));
    f.qA('[type="password"]').forEach(n => n.addEventListener('change', (e) => this.changePassword(e)))
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------

  commonClick(e) {
    let target = e.target,
        action = target.dataset.action;

    if (!action) return;
    this.queryParam.setAction = action;

    const select = {
      'save': () => this.saveSetting(),

      // Доп. поля для пользователей
      'addCustomManagerField': () => this.addManagerField(),
      'removeCustomManagerField': () => this.removeManagerField(),
    }

    select[action] && select[action]();
  },

  saveSetting() {
    const form = new FormData(),
          customization = Object.create(null),
          setData = (f) => {for (const [k, v] of (new FormData(f)).entries()) form.set(k, v)};

    this.form.mail && setData(this.form.mail);
    this.form.custom && setData(this.form.custom);
    this.form.user && setData(this.form.user);
    this.form.manager && setData(this.form.manager);
    this.form.permission && setData(this.form.permission);

    // Special field
    form.get('onlyOne') && (customization['onlyOne'] = true);
    form.set('customization', JSON.stringify(customization));

    this.query(form);
  },

  addManagerField(keyValue = false, typeValue = false) {
    let node = this.template.customField.cloneNode(true),
        key = getFieldNode(node, 'key'),
        type = getFieldNode(node, 'type'),
        randName = new Date().getTime();
    key.name = 'mCustomFieldKey' + randName;
    key.value = keyValue || 'Поле' + randName.toString().slice(-2);
    type.name = 'mCustomFieldType' + randName;
    type.value = typeValue || 'string';
    this.field.customField.append(node);
  },

  removeManagerField() {
    let last = this.field.customField.querySelector('[data-field="customFieldItem"]:last-child');
    last && last.remove();
  },

  changePassword(e, nodes) {
    let value = [],
        node = this.form.user.querySelector('[name="password"]');

    value[0] = node.value;
    if (!value[0]) return;

    node = this.form.user.querySelector('[name="passwordRepeat"]');
    value[1] = node.value;

    if (!value[1]) return;

    if (value[0] !== value[1]) this.errorNode = f.showMsg('Пароли не совпадают', 'error');
    else if (this.errorNode) { this.errorNode.remove(); delete this.errorNode; }
  },
}
