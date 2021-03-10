'use strict';

export const setting = {
  mailForm: f.qS('#mailForm'),
  userForm: f.qS('#userForm'),
  customForm: f.qS('#customForm'),

  queryParam: {
    mode: 'setting',
  },

  init() {
    this.loadSetting();

    this.onEvent();
    return this;
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

    this.query(form);
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
