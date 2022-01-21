'use strict';

import {methods as permission} from './permission.js';
import {methods as managerField} from './managerField.js';
import {methods as properties} from './properties.js';

const setData = selector => {
  const node = f.qS(selector),
        res = node && node.value ? JSON.parse(node.value) : false;
  node.remove();
  return res;
}
const conArrToObject = (arr, key) => arr.reduce((r, i) => {r[i[key]] = i; return r;}, Object.create(null));

const common = {
  loadData() {
    this.setUser();
    this.isAdmin && this.setSetting();
    this.isAdmin && this.setPermissions();
  },
  setUser() {
    const data = setData('#dataUser');
    this.user.name  = data.name;
    this.user.login = data.login;
    this.permission.id = data['permissionId'];
    this.queryParam.isAdmin = this.isAdmin = data.isAdmin || false;
  },
  setSetting() {
    const data = setData('#dataSettings');

    this.mail.managerTarget     = data.managerTarget || '';
    this.mail.managerTargetCopy = data.managerTargetCopy || '';
    this.mail.subject           = data.subject || '';
    this.mail.fromName          = data.fromName || '';

    this.managerFields = data.managerFields || {};
  },
  setPermissions() {
    const data = setData('#dataPermissions');
    this.permissionsData = data.permissions;
    this.permissionsMenu = data.menu;
  },
  setFieldMask() {
    /*let node = this.$refs['mailTarget'];
    node && f.initMask(node.$el);

    node = this.$refs['mailTargetCopy'];
    node && f.initMask(node.$el);*/
  },

  query() {
    const data = new FormData();

    Object.entries(this.queryParam).map(param => data.set(param[0], param[1]));

    return f.Post({data}).then(d => d);
  },

  // Event function
  // -------------------------------------------------------------------------------------------------------------------

  editRate() {
    f.showMsg('asdf');
  },

  saveSetting() {
    this.queryParam.cmsAction = 'saveSetting';
    this.queryParam.user = JSON.stringify(this.user);
    if (this.isAdmin) {
      this.queryParam.mail = JSON.stringify(this.mail);
      this.queryParam.permissions = this.permissionsChanged ? JSON.stringify(this.permissionsData): '[]';
      this.queryParam.managerFields = JSON.stringify(this.managerFields);

      //this.permissionsChanged = false;
    }

    this.query().then(s => s.status && f.showMsg('Сохранено'));
  },
}

export default Object.assign(common, permission, managerField, properties);
