'use strict';

import permission from "./permission";
import manager from "./managerField";
import properties from "./properties";

import sf from './settingFunc';

const app = {
  data: () => {
    const d = {
      ...permission.data,
      ...manager.data,
      ...properties.data,

      isAdmin: false,

      mail: {
        managerTarget    : '', // Почта получения заказов
        managerTargetCopy: '', // Дополнительная Почта получения заказов
        subject          : '', // тема письма
        fromName         : '', // Имя отправителя
      },

      user: {
        change        : false,
        name          : '',
        login         : '',
        password      : '',
        passwordRepeat: '',
        fields        : {},
        onlyOne       : false,
        showAllField  : false,
      },

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
  watch: {
    user: {
      deep: true,
      handler() {
        this.user.change = true;
      },
    },
  },
  computed: {},
  methods: {
    setFieldMask() {
      /*let node = this.$refs['mailTarget'];
       node && f.initMask(node.$el);

       node = this.$refs['mailTargetCopy'];
       node && f.initMask(node.$el);*/
    },

    query() {
      const data = new FormData();

      Object.entries(this.queryParam).map(param => data.set(param[0], param[1]));

      return f.Post({data});
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
  },
};

export default {
  components: {},
  data: app.data,
  computed: Object.assign(app.computed, permission.computed, manager.computed, properties.computed),
  watch   : Object.assign(app.watch, permission.watch, manager.watch, properties.watch),
  methods : Object.assign(app.methods, permission.methods, manager.methods, properties.methods),
  mounted() {
    this.setFieldMask();

    this.setPermission();

    //this.loadingPage = false;
  },
}
