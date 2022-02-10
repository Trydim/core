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
    const setSetting = () => {
      const data = setData('#dataSettings');

      d.mail.target     = data['mailTarget'] || '';
      d.mail.targetCopy = data['mailTargetCopy'] || '';
      d.mail.subject    = data['mailSubject'] || '';
      d.mail.fromName   = data['mailFromName'] || '';

      d.managerFields = data.managerFields || {};

      d.statusDefault = +data.statusDefault || 0;

      d.phoneMaskUsers     = data.phoneMaskUsers || f.PHONE_MASK;
      d.phoneMaskCustomers = data.phoneMaskCustomers || f.PHONE_MASK;
      d.phoneMaskGlobal    = data.phoneMaskGlobal || f.PHONE_MASK;
    };

    setSetting();

    return d;
  },
};

f.HOOKS.beforeCreateApp = f.HOOKS.beforeCreateApp || (() => {});
f.HOOKS.beforeMoundedApp = f.HOOKS.beforeMoundedApp || (() => {});
f.HOOKS.afterMoundedApp = f.HOOKS.afterMoundedApp || (() => {});
