'use strict';

export const data = {
  propertiesData: [],
  propertiesSelected: [],

  property: {
    name: '',
    code: '',
    type: '',
    fields: {},
  },

  propertiesLoading: true,
  propertiesModal: {
    display: false,
    title: '',
    confirmDisabled: false,
  },
  propertiesTypes: [
    {
      label: 'Простые',
      items: [
        {id: 'text', name: 'Текст (~200 символов)'},
        {id: 'textarea', name: 'Текст (много)'},
        {id: 'number', name: 'Число'},
        {id: 'date', name: 'Дата'},
        {id: 'bool', name: 'Флаг (да/нет)'},
      ]
    },
    {
      label: 'Составные',
      items: [
        {id: 'select', name: 'Справочник'},
      ]
    }
  ],
  propertiesDataBaseTypes: [
    {id: 'text', name: 'Текст (~200 символов)'},
    {id: 'textarea', name: 'Текст (много)'},
    {id: 'number', name: 'Целое число'},
    {id: 'float', name: 'Дробное число'},
    {id: 'date', name: 'Дата'},
    {id: 'file', name: 'Файл'},
    {id: 'bool', name: 'Флаг (да/нет)'},
  ],
}

export const watch = {
  'property.name'() {
    this.property.code = f.transLit(this.property.name);
  },
}

export const computed = {

}

export const methods = {
  loadProperties() {
    this.queryParam.dbAction = 'loadProperties';
    this.query().then(data => {
      //  Object.values(data['propertiesTables']) тут нужен массив
      this.propertiesData = data['propertiesTables'];
      this.propertiesLoading = false;
    });
  },

  // -------------------------------------------------------------------------------------------------------------------
  // Action
  // -------------------------------------------------------------------------------------------------------------------

  openAccordion(e) {
    let n   = e.originalEvent.target.closest(`[tabindex="${e.index}"]`),
        exp = n && n.getAttribute('aria-expanded') === 'false';
    exp && this.loadProperties();
  },
  createProperty() {
    this.queryParam.dbAction = 'createProperty';

    this.property.name = '';
    this.property.code = '';
    this.property.type = 'text';
    this.property.fields = {};

    this.propertiesModal.title = 'Создать свойство';
    this.propertiesModal.display = true;
  },
  changeProperty() {},
  deleteProperty() {},

  addPropertyField() {
    let random = Math.random() * 10000 | 0;

    this.property.fields[random] = {
      name: 'Поле' + random,
      type: 'text',
    }
  },
  removePropertyField(id) {
    delete this.property.fields[id];
  },

  propertiesConfirm() {
    //this.propertiesLoading = true;

    this.property.type === 'select' && (this.property.code = 'prop_' + this.property.code);
    this.queryParam.property = JSON.stringify(this.property);
    this.query().then(data => {
      this.propertiesData = data['propertiesTables'];
      this.propertiesLoading = false;
    });
    this.propertiesModal.display = false;
  },
  propertiesCancel() {
    this.propertiesModal.display = false;
  },
}

const getFieldNode = (p, field) => p.querySelector(`[data-field=${field}]`);


class Properties {
  constructor(modal) {
    this.form = f.qS('#propertiesTable');
    if (!this.form) return;

    this.setParam(modal);

    this.onEvent();
  }

  setParam(modal) {
    this.M = modal;

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
    this.field.colsField    = getFieldNode(this.tmp.create, 'propertiesCols');
    this.tmp.colItem        = getFieldNode(this.tmp.create, 'propertiesColItem');
    this.tmp.colItem.remove();

    this.loader = new f.LoaderIcon(this.field.body, false, true, {small: false});
    this.selected = new f.SelectedRow({table: this.form});

    f.relatedOption(this.tmp.create);
  }

  reloadQuery() {
    this.queryParam = {dbAction: 'loadProperties'};
    this.needReload = false;
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
    }

    if (action === 'confirmYes') { // Закрыть подтверждением
      this.delayFunc();
      this.delayFunc = () => {};
      this.needReload = true;
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

    this.M.show('Добавить новое свойство', this.tmp.create);
  }
  changeProperty() {
    let props = this.selected.getSelected();
    if (props.length !== 1) {
      f.showMsg('Выберите 1 параметр', 'error');
      return;
    }

    this.queryParam.props = props;

    this.M.show('Удалить параметр?', this.tmp.edit);
  }
  delProperty() {
    let props = this.selected.getSelected();
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
}
