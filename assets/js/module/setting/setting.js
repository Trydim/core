'use strict';

const getFieldNode = (p, field) => p.querySelector(`[data-field=${field}]`);

export const setting = {
  mailForm: f.qS('#mailForm'),
  userForm: f.qS('#userForm'),
  customForm: f.qS('#customForm'),
  managerForm: f.qS('#managerForm'),

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

    if (this.managerForm) {
      this.field.customField = getFieldNode(this.managerForm, 'customField');
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
    const node = f.qS('#userSetting'),
          value = node ? JSON.parse(node.value) : '';

    if (value) node.remove();
    else return;

    if (value['setting'] && value['setting']['managerSetting']) {
      Object.entries(value['setting']['managerSetting']).forEach(([k, v]) => {
        this.addManagerField(k, v);
      });
    }
    //value.setting && (value.setting = JSON.parse(value.setting));
    //value.user.customization && (value.user.customization = JSON.parse(value.user.customization));
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
          customForm = new FormData(this.customForm),
          setData = (f) => {for (const [k, v] of (new FormData(f)).entries()) form.set(k, v)};
    let customization = Object.create(null);

    for (const [k, v] of customForm.entries()) {
      customization[k] = v;
    }
    form.set('customization', JSON.stringify(customization));

    setData(this.mailForm);
    setData(this.userForm);
    setData(this.managerForm);

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
        node = this.userForm.querySelector('[name="password"]');

    value[0] = node.value;
    if (!value[0]) return;

    node = this.userForm.querySelector('[name="passwordRepeat"]');
    value[1] = node.value;

    if (!value[1]) return;

    if (value[0] !== value[1]) this.errorNode = f.showMsg('Пароли не совпадают', 'error');
    else if (this.errorNode) { this.errorNode.remove(); delete this.errorNode; }
  }
}
