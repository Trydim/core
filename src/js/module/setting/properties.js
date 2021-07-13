'use strict';

const getFieldNode = (p, field) => p.querySelector(`[data-field=${field}]`);

export class Properties {
  constructor() {
    this.form = f.qS('#propertiesTable');
    if (!this.form) return;

    this.setParam();
    //this.tmp = f.gTNode('#properties');

    this.onEvent();
  }

  setParam() {
    this.M = f.initModal();

    this.needReload = false;
    this.delayFunc = () => {};
    this.queryParam = {
      dbAction: 'loadProperties',
    };

    this.field = {
      body: this.form.querySelector('tbody'),
    }

    this.tmp = {
      create: f.gTNode('#propertiesCreateTmp'),
      property: this.field.body.innerHTML,
    };

    this.field.propertyType = getFieldNode(this.tmp.create, 'propertyType');
    this.field.colsField = getFieldNode(this.tmp.create, 'propertiesCols');
    this.tmp.colItem = getFieldNode(this.tmp.create, 'propertiesColItem');
    this.tmp.colItem.remove();

    this.loader = new f.LoaderIcon(this.field.body, false, true, {small: false});
    this.selected = new f.SelectedRow({table: this.form});

    f.relatedOption(this.tmp.create);
  }

  reloadQuery() {
    this.queryParam = {dbAction: 'loadProperties'};
    this.needReload = false;
    this.query();
  }

  setProperties(properties) {
    this.propertiesList = new Map();
    Object.entries(properties).forEach(([k, v]) => this.propertiesList.set(k, v));
  }
  showPropertiesTables(tables) {
    let properties = Object.entries(tables).reduce((r, [property, value]) => {
          r.push(Object.assign({property}, value));
          return r;
        }, []);

    this.field.body.innerHTML = f.replaceTemplate(this.tmp.property, properties);
  }

  query() {
    let form = new FormData();

    form.set('mode', 'DB');
    Object.entries(this.queryParam).map(param => form.set(param[0], param[1]));

    setTimeout(() => this.loader.start(), 1);
    f.Post({data: form}).then(data => {
      if(this.needReload) {
        this.reloadQuery();
        return;
      }

      if (data['propertiesTables']) {
        this.setProperties(data['propertiesTables']);
        this.showPropertiesTables(data['propertiesTables']);
      }

      if (data['propertyValue']) {
        this.setPropertyValue(data['propertyValue']);
        this.showPropertyValue(data['propertyValue']);
      }

      this.loader.stop();
    });
  }
  // Events function
  //--------------------------------------------------------------------------------------------------------------------

  actionBtn(e) {
    let target = e.target,
        action = target.dataset.action;

    if (!action) return;

    let select = {
      'loadProperties': () => !e.target.parentNode.open && this.reloadQuery(),
      'createProperty': () => this.createProperty(),
      'changeProperty': () => this.changeProperty(),
      'delProperty': () => this.delProperty(),

      'addCol': () => this.addCol(),
      'remCol': () => this.remCol(),
    }

    if (action === 'confirmYes') { // Закрыть подтверждением
      this.delayFunc();
      this.delayFunc = () => {};
      this.needReload = true;
      this.query();
    } else {
      !['addCol', 'remCol'].includes(action) && (this.queryParam.dbAction = action);
      select[action] && select[action]();
    }
  }

  createProperty() {
    this.delayFunc = () => {
      let fd = new FormData(this.tmp.create);

      for (const [k, v] of fd.entries()) this.queryParam[k] = v;
    }

    // default Form;
    //this.field.propertyType.value = 's_text';
    //f.eraseNode(this.field.colsField);

    this.M.show('Добавить новое свойство', this.tmp.create);
  }
  changeProperty() {
    let props = this.selected.getSelectedList();
    if (props.length !== 1) {
      f.showMsg('Выберите 1 параметр', 'error');
      return;
    }

    this.queryParam.props = props;
    this.query();
    this.M.show('Удалить параметр?', this.tmp.edit);
  }
  delProperty() {
    let props = this.selected.getSelectedList();
    if (!props.length) {
      f.showMsg('Выберите параметр', 'error');
      return;
    }

    this.queryParam.props = props;
    this.M.show('Удалить параметр?', props.join(', '));
  }

  addCol(keyValue = false, typeValue = false) {
    let node = this.tmp.colItem.cloneNode(true),
        key = getFieldNode(node, 'key'),
        type = getFieldNode(node, 'type'),
        randName = new Date().getTime();

    key.name = 'colName' + randName;
    key.value = keyValue || 'Поле' + randName.toString().slice(-2);
    type.name = 'colType' + randName;
    type.value = typeValue || 'string';
    this.field.colsField.append(node);
  }
  remCol() {
    this.field.colsField.lastChild.remove();
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    f.qA('#propertiesWrap [data-action]', 'click', (e) => this.actionBtn.call(this, e));

    // Кнопки Модалки
    [this.M.btnCancel, this.M.btnConfirm].forEach(n => n.addEventListener('click', (e) => this.actionBtn.call(this, e)));

    // Форма свойств
    this.tmp.create.addEventListener('click', (e) => this.actionBtn.call(this, e));
  }
}
