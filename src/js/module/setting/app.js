'use strict';

import {data as permissionData,
  watch as permissionWatch,
  computed as permissionComputed} from "./permission";
import {data as managerFieldData,
  watch as managerFieldWatch,
  computed as managerFieldComputed} from "./managerField";
import {data as propertiesData,
  watch as propertiesWatch,
  computed as propertiesComputed} from "./properties";

import methods from './v_methods.js';

export default {
  components: {},
  data: () => Object.assign({
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
      onlyOne       : false,
    },

    rate: {
      autoRefresh: true,
    },

    queryParam: {
      mode: 'setting',

    },
    temp: false,

    //loadingPage: true,
  }, permissionData, managerFieldData, propertiesData),
  computed: Object.assign({}, permissionComputed, managerFieldComputed, propertiesComputed),
  watch   : Object.assign({}, permissionWatch, managerFieldWatch, propertiesWatch),
  methods : methods,
  mounted() {
    this.loadData();
    //debugger
    this.setFieldMask();

    this.$nextTick(() => {
      this.permissionsChanged = false;
    });
    //this.loadingPage = false;
  },
}
