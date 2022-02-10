'use strict';

import sf from './settingFunc';

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

    return sf.loadData(d);
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
