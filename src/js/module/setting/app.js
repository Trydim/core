'use strict';

const conArrToObject = (arr, key) => arr.reduce((r, i) => {r[i[key]] = i; return r;}, Object.create(null));

const loadData = d => {
  const data = f['cmsSetting'];

  d.mail.target     = data['mailTarget'] || '';
  d.mail.targetCopy = data['mailTargetCopy'] || '';
  d.mail.subject    = data['mailSubject'] || '';
  d.mail.fromName   = data['mailFromName'] || '';

  d.managerFields = data.managerFields || {};

  d.statusDefault = +data.statusDefault || 0;

  d.otherFields = {
    phoneMask: {
      users    : data['phoneMaskUsers'] || f.PHONE_MASK_DEFAULT,
      customers: data['phoneMaskCustomers'] || f.PHONE_MASK_DEFAULT,
      global   : data['phoneMaskGlobal'] || f.PHONE_MASK_DEFAULT,
    },
  };

  return d;
}

export default {
  components: {},
  data: () => {
    const d = {
      isAdmin: false,

      mail: {},
      user: {},

      rate: {
        autoRefresh: true,
      },

      queryParam: {
        mode: 'setting',
      },
      temp: false,

      //loadingPage: true,
    };

    return loadData(d);
  },
  computed: {},
  watch   : {},
  methods: {
    setFieldMask() {
      /*let node = this.$refs['mailTarget'];
       node && f.initMask(node.$el);

       node = this.$refs['mailTargetCopy'];
       node && f.initMask(node.$el);*/
    },

    updateMail(m) {
      this.queryParam.mail = JSON.stringify(m);
    },
    updateUser(u) {
      this.queryParam.user = JSON.stringify(u);
    },
    updatePermission(p) {
      this.queryParam.permissions = JSON.stringify(p)
    },
    updateManagerFields(mF) {
      this.queryParam.managerFields = JSON.stringify(mF);
    },
    updateRate(r) {
      this.queryParam.rate = JSON.stringify(r);
    },
    updateOrderStatus(s) {
      this.queryParam.orderStatus = JSON.stringify(s.orderStatus);
      this.queryParam.statusDefault = s.statusDefault;
    },
    updateProperties(p) {
      this.queryParam.properties = JSON.stringify(p);
    },
    updateOtherFields(p) {
      this.queryParam.otherFields = JSON.stringify(p);
    },

    query() {
      const data = new FormData();

      Object.entries(this.queryParam).map(param => data.set(param[0], param[1]));

      return f.Post({data});
    },

    // Event function
    // -------------------------------------------------------------------------------------------------------------------

    saveSetting() {
      this.queryParam.cmsAction = 'saveSetting';
      this.query().then(s => s.status && f.showMsg('Сохранено'));
    },
  },
  mounted() {
    this.setFieldMask();
    //this.loadingPage = false;
  },
}

f.HOOKS.beforeCreateApp = f.HOOKS.beforeCreateApp || (() => {});
f.HOOKS.beforeMoundedApp = f.HOOKS.beforeMoundedApp || (() => {});
f.HOOKS.afterMoundedApp = f.HOOKS.afterMoundedApp || (() => {});
