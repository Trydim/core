'use strict';

export const data = {
  optionsModal: {
    display: false,
    chooseFileDisplay: false,
    confirmDisabled: true,
    title: '',
    single: true,
    displayContinue: false,
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
    moneyInput   : true,
    percent      : true,
    moneyOutputId: true,
    moneyOutput  : true,
    activity     : true,
    sort         : true,
    properties   : false,
  },

  elementLoaded: 0,
  elementName  : '',
  optionsSelected: [],
  loadedFiles    : undefined,
  filesUpSelected: [], // Выбранные файлы из загруженных.
  filesUploaded: [],   // Загруженные файлы

  optionsSelectedShow: false,
  elementParentModalDisabled: false,
  elementParentModalSelected: undefined,

  optionsColumns: [
    {name: 'Номер', value: 'id'},
    {name: 'Файлы', value: 'images'},
    {name: 'Ед.Измерения', value: 'unitName'},
    {name: 'Активен', value: 'activity'},
    {name: 'Сортировка', value: 'sort'},
    {name: 'Валюта вход', value: 'moneyInputName'},
    {name: 'Сумма вход', value: 'inputPrice'},
    {name: 'Процент', value: 'outputPercent'},
    {name: 'Валюта выход', value: 'moneyOutputName'},
    {name: 'Сумма выход', value: 'outputPrice'},
  ],

  optionsColumnsSelected: undefined,
  files: new Map(),
}

export const watch = {
  option: {
    deep: true,
    handler() {
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
  optionsCount() {
    return this.options.length;
  },

  optionsColumnsValues() {
    return this.optionsColumnsSelected.map(v => v.value);
  },

  getOptionSelectedId() {
    return this.optionsSelected.map(i => i.id);
  },

  /**
   * true if can remove options
   */
  checkRemoveOptions() {
    return this.optionsCount > 1 && this.optionsCount > Object.keys(this.optionsSelected).length;
  },

  filesList() {
    return [...this.files.entries()];
  },
}

const getPercent = p => 1 + (p / 100);
const reload = (that, checkSimple = false) => ({
  dbAction : 'openElement',
  callback: (fData, aData) => {
    that.options         = aData['options']
    that.optionsLoading  = false;
    that.optionsSelected = [];
    that.files           = new Map();

    if (checkSimple) {
      const el = that.elements.find(el => +el.id === +that.elementLoaded);
      el.simple = that.options.length === 1;
    }
  }
});

export const methods = {
  loadOptions(id) {
    this.queryParam.dbAction   = 'openElement';
    this.queryParam.elementsId = JSON.stringify([id]);
    this.elementLoaded         = id;
    this.elementName           = this.elements.find(e => +e.id === id).name;
    this.optionsLoading        = true;

    this.query().then(data => {
      this.options        = data['options'];
      this.optionsLoading = false;
      this.clearAllOptions();
      this.$nextTick(() => {
        window.scrollTo(0, this.$refs['optionsWrap'].getBoundingClientRect().y);
      });
      f.showMsg('Открыт: ' + this.elementName);
    });
  },

  checkColumn(v) {
    return this.optionsColumnsValues.includes(v);
  },
  checkSelectedAndLoadedElements() {
    // Если false, значит все хорошо.
    switch (this.getElementsSelectedId.length) {
      case 0: return false;
      case 1: return +this.getElementsSelectedId[0] !== this.elementLoaded;
      default: return true;
    }
  },

  getAvgPrice(type) {
    let res = 0;

    this.optionsSelected.forEach(option => {
      res += +option[type + 'Price'];
    });

    return res / this.optionsSelected.length;
  },

  enableOptionField() {
    this.fieldChange = {
      unitId       : true,
      moneyInputId : true,
      moneyInput   : true,
      percent      : true,
      moneyOutputId: true,
      moneyOutput  : true,
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
      this.queryFiles[f.id] = f.id;
      this.files.set(f.id, f);
    });
  },
  setDefaultProperty() {
    // TODO хуита №1
    if (!this.properties) return;

    Object.keys(this.properties).map(key => this.option.properties[key] = undefined);
  },
  setOptionProperty(el) {
    this.setDefaultProperty();
    Object.entries(el.properties).map(([key, value]) => {
      if (this.properties[key].type === 'number') value = f.toNumber(value);
      this.option.properties[key] = value;
    });
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
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

  setFieldChange(check) {
    Object.keys(this.fieldChange).forEach(k => this.fieldChange[k] = check);
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
    this.reloadAction = reload(this, true);
  },
  changeOptions() {
    if (this.optionsCount === 1) this.optionsSelected = [this.options[0]];
    if (!this.optionsSelected.length) { f.showMsg('Ничего не выбрано'); return; }
    if (this.checkSelectedAndLoadedElements()) setTimeout(() => this.optionsModal.displayContinue = true, 100);

    const el = this.optionsSelected[0],
          single = this.optionsSelected.length === 1;

    this.queryParam.optionsId = JSON.stringify(this.getOptionSelectedId);
    this.queryParam.dbAction = 'changeOptions';

    if (single) {
      this.option.name = el.name || '';
      this.filesUpSelected = [];
      this.setImages(el);
    }
    this.option.elementId = this.elementLoaded;
    this.option.unitId    = single ? el.unitId : this.units[0].id;

    this.option.moneyInputId  = single ? el.moneyInputId : this.money[0].id;
    this.option.inputPrice    = single ? +el.inputPrice || 0 : this.getAvgPrice('input');

    this.option.moneyOutputId = single ? el.moneyOutputId : this.money[0].id;
    this.option.outputPrice  = single ? +el.outputPrice || 0 : this.getAvgPrice('output');

    this.option.percent  = +el['outputPercent'] || 0;
    this.option.activity = single ? !!+el.activity : true;
    this.option.sort     = this.getAvgSort(this.optionsSelected);
    single ? this.setOptionProperty(el) : this.setDefaultProperty();

    this.setOptionModal('Редактировать', single, single);
    this.reloadAction = reload(this);
  },
  copyOption() {
    if (this.optionsCount === 1) this.optionsSelected = [this.options[0]];
    if (this.optionsSelected.length !== 1) { f.showMsg('Выберите только 1 вариант', 'error'); return; }

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
    this.reloadAction = reload(this, true);
  },
  deleteOptions() {
    if (!this.optionsSelected.length) { f.showMsg('Ничего не выбрано', 'error'); return; }

    this.queryParam.optionsId = JSON.stringify(this.getOptionSelectedId);
    this.queryParam.dbAction   = 'deleteOptions';

    this.setOptionModal('Удалить', false, false);
    this.reloadAction = reload(this, true);
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
      let id    = f.random().toString(),
          error = false;

      file.fileError = file.size > 1024 * 1024;
      if (file.fileError && !error) error = true;

      this.queryFiles[id] && (id += '1');
      this.queryFiles[id] = file;
      this.files.set(id, {
        name: file.name,
        src: URL.createObjectURL(file),
        error,
        optimize: true,
      });
    });
    this.clearFiles(e.target);
  },
  removeFile(id) {
    delete this.queryFiles[id];
    this.files.delete(id);
  },
  chooseUploadedFiles() {
    this.optionsModal.chooseFileDisplay = true;
    if (this.loadedFiles) return;

    let data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'loadFiles');

    this.filesLoading = true;

    f.Post({data}).then(data => {
      this.loadedFiles = data['files'];
      this.filesLoading = false;
    });
  },
  closeChooseImage() {
    Object.keys(this.filesUpSelected).forEach(id => {
      const f = this.loadedFiles.find(i => +i.id === +id);
      this.queryFiles[f.id] = f.id;
      this.files.set(f.id, f);
    });

    this.optionsModal.chooseFileDisplay = false;
  },
  refreshUploadedFiles() {
    this.loadedFiles = undefined;
    this.chooseUploadedFiles();
  },

  optionsConfirm() {
    this.optionsLoading = true;
    this.queryParam = {
      ...this.queryParam,
      option: JSON.stringify(this.option),
      fieldChange: JSON.stringify(this.fieldChange),
    };
    this.query();
    this.optionsClose();
  },
  optionsClose() {
    this.queryFiles = Object.create(null);
    this.files = new Map();
    this.optionsModal.display = false;
  },

  optionsContinueConfirm() {
    this.optionsModal.displayContinue = false;
  },
  optionsContinueCancel() {
    this.optionsModal.displayContinue = false;
    setTimeout(() => this.optionsModal.display = false, 100);
  },
}
