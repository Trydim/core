'use strict';

import Tree from 'primevue/tree';

import {data as sectionData, watch as sectionWatch, methods as sectionMethods} from "./sections";
import {data as elementsData, watch as elementsWatch, computed as elementsComputed, methods as elementsElements} from "./elements";
import {data as optionsData, watch as optionsWatch, computed as optionsComputed, methods as optionsMethods} from "./options";

const setData = selector => {
  const node = f.qS(selector),
        res  = node && node.value ? JSON.parse(node.value) : false;
  node.remove();
  return res;
}

const prepareData = data => data.map(el => {
  el['activity'] = f.toNumber(el['activity']);
  return el;
});

export default {
  components: {
    Tree,
  },
  data: () => ({
    search: '',
    searchShow : true,
    sectionShow: true,
    elementShow: true,
    reloadAction: Object.create(null),
    queryParam  : Object.create(null),
    queryFiles  : Object.create(null),
    temp: false,

    codes: [],
    ...sectionData, ...elementsData, ...optionsData
  }),
  computed: {...elementsComputed, ...optionsComputed},
  watch: {...sectionWatch, ...elementsWatch, ...optionsWatch,
    search() {
      if (this.search.length > 1) {
        this.sectionShow = false;
        this.queryParam.dbAction = 'searchElements';
        this.queryParam.searchValue = this.search;

        this.sectionLoaded = this.elementLoaded = 0;
        this.options = [];

        this.elementsLoading = true;
        this.query().then(data => {
          this.elements        = prepareData(data['elements']);
          this.elementsLoading = false;
          this.clearAll();
        });
      } else {
        this.sectionShow = true;
      }
    },
  },
  methods: {...sectionMethods, ...elementsElements, ...optionsMethods,
    setReloadQueryParam() {
      delete this.reloadAction.callback;
      this.queryParam = Object.assign(this.queryParam, this.reloadAction);
      this.reloadAction = false;
    },

    query(action = '') {
      let data = new FormData();

      Object.entries(Object.assign({}, this.queryParam))
            .map(param => data.set(param[0], param[1]));
      //action && data.set('dbAction', action);

      Object.entries(this.queryFiles).forEach(([id, file]) => {
        if (file instanceof File) data.append('files' + id, file, file.name);
        else data.set('files' + id, file.toString());
      });
      data.delete('files');

      this.queryFiles = Object.create(null);

      return f.Post({data}).then(async data => {
        if (this.reloadAction) {
          let cbFunc = this.reloadAction.callback || false;
          this.setReloadQueryParam();
          let cbData = await this.query();
          data.status && cbFunc && cbFunc(data, cbData);
        }

        if (data.status === false && data.error) f.showMsg(data.error, 'error');
        return data;
      });
    },
  },
  mounted() {
    this.queryParam.mode = 'DB';
    this.codes = setData('#dataCodes');
    this.units = setData('#dataUnits');
    this.money = setData('#dataMoney');
    this.properties = setData('#dataProperties');
    this.optionsColumnsSelected = this.optionsColumns;
    this.loadSections();
  },
}
