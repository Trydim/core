'use strict';

export const data = {
  optionsModal: {
    display: false,
    chooseFileDisplay: false,
    confirmDisabled: true,
    title: '',
    single: true,
  },

  options: [],
  optionsLoading: false,
  filesLoading: false,

  option: {
    id           : 0,
    elementId    : 0,
    images       : [],
    name         : '',
    unitId       : 0,
    activity     : true,
    sort         : 100,
    percent      : 0,
    moneyInputId : 0,
    inputPrice   : 0,
    moneyOutputId: 0,
    outputPrice  : 0,
    propertiesJson : '',
    properties     : {},
  },

  fieldChange: {
    unitId       : true,
    moneyInputId : true,
    percent      : true,
    moneyOutputId: true,
    activity     : true,
    sort         : true,
    properties   : false,
  },

  elementLoaded: 0,
  elementName  : '',
  optionsSelected: [],
  loadedFiles    : undefined,
  filesUpSelected: [],
  filesUploaded: [],

  optionsSelectedShow: false,
  elementParentModalDisabled: false,
  elementParentModalSelected: undefined,

  optionsColumns: [
    {name: 'Номер', value: 'id'},
    {name: 'Файлы', value: 'images'},
    {name: 'Ед.Измерения', value: 'unitName'},
    {name: 'activity', value: 'activity'},
    {name: 'sort', value: 'Сортировка'},
    {name: 'moneyInputName', value: 'moneyInputName'},
    {name: 'inputPrice', value: 'inputPrice'},
    {name: 'outputPercent', value: 'outputPercent'},
    {name: 'moneyOutputName', value: 'moneyOutputName'},
    {name: 'outputPrice', value: 'outputPrice'},
  ],

  optionsColumnsSelected: undefined,
  files: {},
}

export const watch = {
  option: {
    deep: true,
    handler() {
      if (this.optionsSelected.length !== 1) return;
      this.optionsModal.confirmDisabled = !this.option.name;
    },
  },

  'option.moneyInputId'() {
    // инпут кросс курс умножить на проценты изменить отп цену.
  },
  'option.inputPrice'() {
    this.option.outputPrice = this.option.inputPrice * getPercent(this.option.percent);
  },
  'option.moneyOutputId'() {
    // инпут кросс курс умножить на проценты изменить отп цену.
  },

  files: {
    deep: true,
    handler() { this.optionsModal.confirmDisabled = !this.option.name },
  },
}

export const computed = {
  optionsColumnsValues() {
    return this.optionsColumnsSelected.map(v => v.value);
  },

  getOptionSelectedId() {
    return this.optionsSelected.map(i => i.id);
  },
}

const getPercent = p => 1 + (p / 100);
const reload = that => ({
  dbAction : 'openElement',
  callback: (fData, aData) => {
    that.options         = aData['options']
    that.optionsLoading  = false;
    that.optionsSelected = [];
    that.files           = Object.create(null);
  }
});

export const methods = {
  loadOptions(id) {
    this.queryParam.dbAction   = 'openElement';
    this.queryParam.elementsId = id;
    this.elementLoaded         = id;
    this.elementName           = this.elements.find(e => +e.id === id).name;
    this.optionsLoading        = true;
    this.query().then(data => {
      this.options        = data['options'];
      this.optionsLoading = false;
      this.clearAllOptions();
    });
  },

  enableOptionField() {
    this.fieldChange = {
      unitId       : true,
      moneyInputId : true,
      percent      : true,
      moneyOutputId: true,
      activity     : true,
      sort         : true,
      properties   : false,
    };
  },

  setOptionModal(title, confirmDisabled, single) {
    this.$nextTick(() => {
      single && this.enableOptionField();
      this.optionsModal = {display: true, confirmDisabled, title, single};
    });
  },
  clearFiles(node) {
    const input = document.createElement('input');
    input.type = 'file';
    node.files = input.files;
  },
  setImages(option) {
    this.option.images = option.images.map(f => f.id).join(',');
    option.images.forEach(f => {
      this.files['F_' + f.id] = f;
      this.queryFiles['F_' + f.id] = f.id;
    });
  },
  setDefaultProperty() {
    Object.keys(this.properties).map(key => this.option.properties[key] = undefined);
  },
  setOptionProperty(el) {
    this.setDefaultProperty();
    Object.entries(el.properties).map(([key, value]) => this.option.properties[key] = value);
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  checkColumn(v) {
    return this.optionsColumnsValues.includes(v);
  },

  selectedAllOptions() {
    this.optionsSelected = Object.values(this.options);
  },
  clearAllOptions() {
    this.optionsSelected = [];
  },
  unselectedOption(id) {
    this.optionsSelected = this.optionsSelected.filter(i => i.id !== id);
    this.optionsSelectedShow = !!this.optionsSelected.length;
  },

  createOption() {
    this.queryParam.dbAction = 'createOption';

    this.option.name = '';
    this.option.unitId = this.units[0].id;
    this.option.moneyInputId  = this.money[0].id;
    this.option.moneyOutputId = this.money[0].id;
    this.option.sort = 100;
    this.setDefaultProperty();

    this.setOptionModal('Создать', true, true);
    this.reloadAction = reload(this);
  },
  changeOptions() {
    if (!this.optionsSelected.length) return;
    const el = this.optionsSelected[0],
          single = this.optionsSelected.length === 1;

    this.queryParam.optionsId = JSON.stringify(this.getOptionSelectedId);
    this.queryParam.dbAction = 'changeOptions';

    if (single) {
      this.option.name = el.name || '';
      this.option.inputPrice  = +el.inputPrice || 0;
      this.option.outputPrice  = +el.outputPrice || 0;
      this.filesUpSelected = [];
      this.setImages(el);
    }
    this.option.elementId = this.elementLoaded;
    this.option.unitId    = single ? el.unitId : this.units[0].id;
    this.option.moneyInputId  = single ? el.moneyInputId : this.money[0].id;
    this.option.moneyOutputId = single ? el.moneyOutputId : this.money[0].id;
    this.option.percent  = +el['outputPercent'];
    this.option.activity = single ? !!el.activity : true;
    this.option.sort     = this.getAvgSort(this.optionsSelected);
    single ? this.setOptionProperty(el) : this.setDefaultProperty();

    this.setOptionModal('Редактировать', single, single);
    this.reloadAction = reload(this);
  },
  copyOption() {
    if (this.optionsSelected.length !== 1) return;
    const el = this.optionsSelected[0];

    this.queryParam.optionsId = JSON.stringify(this.getOptionSelectedId);
    this.queryParam.dbAction = 'copyOption';

    this.option.name      = el.name;
    this.option.elementId = this.elementLoaded;
    this.option.unitId    = el.unitId;
    this.option.moneyInputId  = el.moneyInputId;
    this.option.moneyOutputId = el.moneyOutputId;
    this.option.activity = !!el.activity;
    this.option.sort     = el.sort;
    this.setImages(el);
    this.setOptionProperty(el);

    this.setOptionModal('Редактировать', false, true);
    this.reloadAction = reload(this);
  },
  deleteOptions() {
    if (!this.optionsSelected.length) return;

    this.queryParam.optionsId = JSON.stringify(this.getOptionSelectedId);
    this.queryParam.dbAction   = 'deleteOptions';

    this.setOptionModal('Удалить', false, false);
    this.reloadAction = reload(this);
  },

  dblClickOptions(e) {
    const node = e.target.closest('tr').querySelector('[data-id]'),
          id = node && +node.dataset.id;

    if (id) {
      this.optionsSelected = [this.options.find(e => +e.id === id)];
      this.changeOptions();
    }
  },
  changePercent() {
    this.$nextTick(() => {
      this.option.outputPrice = this.option.inputPrice * getPercent(this.option.percent);
    });
  },
  changeOutputPrice() {
    this.$nextTick(() => {
      this.option.percent = (this.option.outputPrice / this.option.inputPrice - 1) * 100;
    });
  },

  addFile(e) {
    Object.values(e.target.files).forEach(file => {
      let id    = Math.random() * 10000 | 0,
          error = false;

      file.fileError = file.size > 1024*1024;
      if (file.fileError && !error) error = true;

      this.queryFiles.id && (id += '1');
      this.queryFiles[id] = file;
      this.files[id] = {
        name: file.name,
        src: URL.createObjectURL(file),
        error,
      };
    });
    this.clearFiles(e.target);
  },
  removeFile(e) {
    const id = e.target.closest('[data-id]').dataset.id;
    delete this.queryFiles[id];
    delete this.files[id];
  },
  chooseUploadedFiles() {
    this.optionsModal.chooseFileDisplay = true;

    if (this.loadedFiles) return;
    this.filesLoading = true;
    this.queryParam.dbAction = 'loadFiles';

    this.reloadAction = false;
    this.query().then(data => {
      this.loadedFiles = data['files'];
      this.queryParam.dbAction = 'changeOptions';
      this.filesLoading = false;
    });
  },
  closeChooseImage() {
    Object.keys(this.filesUpSelected).forEach(id => {
      const f = this.loadedFiles.find(i => +i.id === +id);
      this.files['F_' + f.id] = f;
      this.queryFiles['F_' + f.id] = f.id;
    });

    this.optionsModal.chooseFileDisplay = false;
  },
  refreshUploadedFiles() {
    this.loadedFiles = undefined;
    this.chooseUploadedFiles();
  },

  optionsConfirm() {
    //this.optionsLoading = true;
    this.queryParam = {
      ...this.queryParam,
      option: JSON.stringify(this.option),
      fieldChange: JSON.stringify(this.fieldChange),
    };
    this.query();
    this.optionsModal.display = false;
  },
  optionsCancel() {
    this.files = Object.create(null);
    this.optionsModal.display = false;
  },
}
