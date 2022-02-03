'use strict';

const setData = selector => {
  const node = f.qS(selector),
        res = node && node.value ? JSON.parse(node.value) : false;
  node.remove();
  return res;
}
const conArrToObject = (arr, key) => arr.reduce((r, i) => {r[i[key]] = i; return r;}, Object.create(null));

export default {
  loadData(d) {
    const setUser = () => {
      const data = setData('#dataUser'),
            contacts = JSON.parse(data.contacts),
            customization = JSON.parse(data['customization']);

      d.user.name = data.name;
      d.user.login = data.login;
      d.permission.id = +data['permissionId'];

      Object.entries(contacts).forEach(([k, v]) => d.user.fields[k] = v);
      Object.entries(customization).forEach(([k, v]) => d.user[k] = v);

      d.queryParam.isAdmin = d.isAdmin = data.isAdmin || false;
    };
    const setSetting = () => {
      const data = setData('#dataSettings');

      d.mail.managerTarget     = data.managerTarget || '';
      d.mail.managerTargetCopy = data.managerTargetCopy || '';
      d.mail.subject           = data.subject || '';
      d.mail.fromName          = data.fromName || '';

      debugger
      d.managerFields = data.managerFields || {};
    };
    const setPermissions = () => {
      const data = setData('#dataPermissions');

      d.permissionsData = data.permissions;
      d.permissionsMenu = data.menu;
    };

    setUser();
    setSetting();
    d.isAdmin && setPermissions();

    return d;
  },
};

f.HOOKS.beforeCreateApp = f.HOOKS.beforeCreateApp || (() => {});
f.HOOKS.beforeMoundedApp = f.HOOKS.beforeMoundedApp || (() => {});
f.HOOKS.afterMoundedApp = f.HOOKS.afterMoundedApp || (() => {});
