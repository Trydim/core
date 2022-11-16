'use strict';

import Tree from 'primevue/tree';

import {data as sectionData, watch as sectionWatch, methods as sectionMethods} from "./Sections";
import {data as elementsData, watch as elementsWatch, computed as elementsComputed, methods as elementsElements} from "./Elements";
import {data as optionsData, watch as optionsWatch, computed as optionsComputed, methods as optionsMethods} from "./Options";

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
    localStorage: new f.LocalStorage(),
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
    setOptionColumnsSelected() {
      this.optionsColumnsSelected = this.localStorage.has('optionsColumnsSelected')
                                    ? JSON.parse(this.localStorage.get('optionsColumnsSelected'))
                                    : this.optionsColumns;

      this.$watch('optionsColumnsSelected', {
        deep: true,
        handler: () => {
          this.$nextTick(() => {
            this.localStorage.set('optionsColumnsSelected', JSON.stringify(this.optionsColumnsSelected));
          });
        },
      });
    },

    setReloadQueryParam() {
      delete this.reloadAction.callback;
      this.queryParam = Object.assign(this.queryParam, this.reloadAction);
      this.reloadAction = false;
    },

    query() {
      let data = new FormData(),
          FDFiles = [];

      Object.entries(this.queryParam)
            .map(param => data.set(param[0], param[1].toString()));
      //action && data.set('dbAction', action);

      Object.entries(this.queryFiles).forEach(([id, file]) => {
        const fileP = this.files.get(id);

        if (file instanceof File) data.append('files' + id, file, file.name);

        FDFiles.push({id: fileP.id || 'files' + id, optimize: fileP.optimize || false});
      });
      FDFiles.length && data.set('filesInfo', JSON.stringify(FDFiles))
      data.delete('files');

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
    this.setOptionColumnsSelected();
    this.loadSections();
  },
}
