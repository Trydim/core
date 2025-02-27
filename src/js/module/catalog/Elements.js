'use strict';

export const data = {
  elementsModal: {
    display        : false,
    confirmDisabled: true,
    title          : '',
    single         : true,
    loading        : false,
  },

  elements: [],
  elementsLoading: false,

  element: {
    id      : 0,
    type    : 0,
    parentId: 0,
    name    : '',
    activity: true,
    sort    : 100,
    simple  : false,
  },

  fieldChange: {
    type    : true,
    parentId: true,
    activity: true,
    sort    : true,
  },

  sectionLoaded: 0,
  elementsSelected: [],
  elementsSelectedShow: false,
  elementParentModalDisabled: false,
  elementParentModalSelected: undefined,
}

export const watch = {
  'element.parentId'() {
    this.elementParentModalSelected = {[this.element.parentId]: true};
  },

  element: {
    deep: true,
    handler() {
      this.elementsModal.confirmDisabled = !this.element.name;
    },
  },
}

export const computed = {
  sectionTreeModal() {
    return this.sectionTree ? this.sectionTree[0].children : [{key: 0}];
  },

  getSectionId() {
    return this.getSectionSelectedId() || this.sectionTreeModal[0].key;
  },

  getElementsSelectedId() {
    return this.elementsSelected.map(i => i.id);
  },
}

const prepareData = data => data.map(el => {
  el.activity = f.toNumber(el.activity);
  el.simple = f.toNumber(el.simple);
  return el;
});

const reload = that => ({
  dbAction : 'openSection',
  callback: (fData, aData) => {
    if (aData['elements']) that.elements = prepareData(aData['elements']);

    that.elementsLoading  = false;
    that.elementsSelected = [];
  }
});

export const methods = {
  loadElements() {
    this.queryParam.dbAction = 'openSection';
    this.sectionLoaded = this.queryParam.sectionId;
    this.elementsLoading = true;
    this.query().then(data => {
      this.elements        = prepareData(data['elements']);
      this.elementsLoading = false;
      this.clearAll();
    });
  },
  loadSimpleOptions() {
    const crAction = this.queryParam.dbAction;

    this.queryParam.dbAction   = 'openElement';
    this.elementsModal.loading = true;

    return this.query().then(data => {
      this.options = data['options'];
      this.elementsModal.loading = false;
      this.queryParam.dbAction = crAction;
      this.reloadAction = reload(this);
    });
  },

  checkLoadedElement() {
    if (this.getElementsSelectedId.includes(this.elementLoaded.toString())) {
      this.options         = [];
      this.optionsSelected = [];
    }
  },

  enableField() {
    this.fieldChange = {
      type    : true,
      parentId: true,
      activity: true,
      sort    : true,
    };
  },

  getPopularType() {
    let obj = {}, count = -1, key;

    for (let item of this.elementsSelected) {
      let code = item['symbolCode'];
      !obj[code] && (obj[code] = 0);
      obj[code]++;

      if (count < obj[code]) {
        count = obj[code];
        key = code;
      }
    }

    return key;
  },
  getAvgSort(selected) {
    return selected.reduce((r, i) => (r += f.toNumber(i.sort)), 0) / selected.length;
  },

  setElementModal(title, confirmDisabled, single) {
    this.$nextTick(() => {
      single && this.enableField();
      this.elementsModal = {display: true, confirmDisabled, title, single};
    });
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  selectedAll() {
    this.elementsSelected = Object.values(this.elements);
  },
  clearAll() {
    this.elementsSelected = [];
  },
  unselectedElement(id) {
    this.elementsSelected = this.elementsSelected.filter(i => i.id !== id);
    this.elementsSelectedShow = !!this.elementsSelected.length;
  },

  elementParentModalSelectedChange(v) {
    this.element.parentId = Object.keys(v)[0];
  },

  elementNameInput() {
    this.elementsModal.confirmDisabled = !this.element.name;
  },

  // Создать
  createElement() {
    this.queryParam.dbAction = 'createElement';

    this.element.type = this.codes[0]['symbolCode'];
    this.element.name = '';
    this.element.parentId = this.getSectionId;
    this.element.sort = 100;

    this.setElementModal('Создать элемент', true, true);
    this.reloadAction = reload(this);
  },
  changeElements() {
    if (!this.elementsSelected.length) { f.showMsg('Ничего не выбрано', 'error'); return; }
    const el     = this.elementsSelected[0],
          single = this.elementsSelected.length === 1;

    this.queryParam.elementsId = JSON.stringify(this.getElementsSelectedId);
    this.queryParam.dbAction = 'changeElements';

    this.element.name     = single ? el.name : '';
    this.element.type     = single ? el['symbolCode'] : this.getPopularType();
    this.element.parentId = this.getSectionId;
    this.element.activity = single ? !!el.activity : true;
    this.element.sort     = single ? f.toNumber(el.sort) : this.getAvgSort(this.elementsSelected);
    this.element.simple   = single && el.simple && el.id;

    this.setElementModal('Редактировать элемент', single, single);
    this.reloadAction = reload(this);

    if (this.element.simple) this.loadSimpleOptions();
  },
  changeSimpleElements() {
    this.elementLoaded = this.element.simple;
    this.optionsSelected = [this.options[0]];
    this.changeOptions();
  },
  changeQuickSimpleElement(id) {
    this.queryParam.elementsId = JSON.stringify([id]);
    this.elementsSelected = [this.elements.find(el => el.id === id)];
    this.options = [];

    const interval = setInterval(() => {
      if (this.options.length) {
        clearInterval(interval);

        this.optionsSelected = [this.options[0]];
        this.changeOptions();
      }
    }, 100);

    this.loadSimpleOptions();
  },
  copyElement() {
    if (this.elementsSelected.length !== 1) { f.showMsg('Выберите только один элемент', 'error'); return; }
    const el = this.elementsSelected[0];

    this.queryParam.dbAction = 'copyElement';

    this.element.name     = el.name;
    this.element.type     = el['symbolCode'];
    this.element.parentId = this.getSectionId;
    this.element.activity = !!el.activity;
    this.element.sort     = f.toNumber(el.sort);

    this.setElementModal('Копировать элемент', false, true);
    this.reloadAction = reload(this);
  },
  deleteElements() {
    if (!this.elementsSelected.length) { f.showMsg('Ничего не выбрано', 'error'); return; }

    this.queryParam.elementsId = JSON.stringify(this.getElementsSelectedId);
    this.queryParam.dbAction   = 'deleteElements';

    this.setElementModal('Удалить элемент(ы)', false, false);
    this.reloadAction = {
      dbAction : 'openSection',
      callback: (fData, aData) => {
        this.checkLoadedElement();

        this.elements         = prepareData(aData['elements']);
        this.elementLoaded    = 0;
        this.elementsLoading  = false;
        this.elementsSelected = [];
      },
    };
  },

  elementConfirm() {
    //this.elementsLoading = true;
    this.queryParam = {
      ...this.queryParam,
      element: JSON.stringify(this.element),
      fieldChange: JSON.stringify(this.fieldChange)
    };
    this.query();
    this.elementsModal.display = false;
  },
  elementCancel() {
    this.elementsModal.display = false;
  },

  loadElement(e) {
    let tr = e.target.closest('tr'),
        n  = tr && tr.querySelector('[data-id]'),
        id = n && +n.dataset.id;
    id && this.loadOptions(id);
  },

  onToggle(value) {
    this.optionsColumnsSelected = this.optionsColumns.filter(col => value.includes(col));
  }
}
