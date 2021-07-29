'use strict';

import {Common} from "./Main";

export class Elements extends Common {
  constructor(props) {
    super('elements', props);

    const field = f.qS(`#${this.type}Field`);

    this.queryParam.tableName = this.type;
    this.setNodes(field, props.tmp);

    this.paginator = new f.Pagination(`#${this.type}Field .pageWrap`,{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.id = new f.SelectedRow({table: this.node.fieldT});

    f.observer.subscribe(`loadElements`, d => this.load(d));
    f.observer.subscribe(`openSection`, d => this.openSection(d));
    this.onEvent();
  }

  load(data) {
    this.id.clear();
    data['elements'] && this.prepareItems(data['elements']);
    data['countRowsElements'] && this.paginator.setCountPageBtn(data['countRowsElements']);
  }
  openSection(id) {
    this.queryParam.sectionId = id || false;
  }
  checkSection() {
    if (!this.queryParam.sectionId) { f.showMsg('Ошибка раздела', 'error'); return true; }
    return false;
  }

  getPopularType() {
    let obj = {}, count = -1, key;

    for (let item of this.itemList.values()) {
      let code = item['symbolCode'];
      !obj[code] && (obj[code] = 0);
      obj[code]++;

      if (count < obj[code]) {
        count = obj[code];
        key = code;
      }
    }

    return key;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Создать элемент
  createElements() {
    if (this.checkSection()) return;

    let form = this.tmp.form.cloneNode(true);
    let node = form.querySelector('[name="type"]');
    node.value = this.getPopularType();

    node = form.querySelector('[name="parentId"]');
    node.value = this.queryParam.sectionId;
    node.disabled = true;

    this.queryParam.form = form;
    this.M.show('Создание элемента', form);
    form.querySelector('[name="name"]').focus();
    this.reloadAction = {
      dbAction: 'openSection',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }
  // Открыть элемент
  openElements() {
    if (this.id.getSelectedSize() !== 1) { f.showMsg('Выберите только 1 элемент', 'error'); return; }

    this.queryParam.elementsId = this.id.getSelected()[0];
    this.id.clear();
    f.observer.fire('openElements', this.queryParam.elementsId);
    this.query({sort: 'options'}).then(data => data && f.observer.fire('loadOptions', data));
  }
  // Изменить элемент
  changeElements() {
    if (!this.id.getSelectedSize() || this.checkSection()) { f.showMsg('Выберите минимум 1 элемент', 'error'); return; }

    let form        = this.tmp.form.cloneNode(true),
        oneElements = this.id.getSelectedSize() === 1,
        id          = this.id.getSelected(),
        element     = this.itemList.get(id[0]);

    this.queryParam.elementsId = JSON.stringify(id);
    this.delayFunc = () => this.id.clear();

    let node = form.querySelector('[name="type"]');
    if (oneElements) node.value = element['symbolCode'];
    else node.closest('.formRow').remove();

    node = form.querySelector('[name="name"]');
    if (oneElements) node.value = element['E.name'];
    else node.closest('.formRow').remove();

    node = form.querySelector('[name="parentId"]');
    node.value = this.queryParam.sectionId;

    node = form.querySelector('[name="activity"]');
    node.checked = oneElements ? !!(+element['activity']) : true;

    node = form.querySelector('[name="sort"]');
    if (oneElements) node.value = element['sort'];
    else node.closest('.formRow').remove();

    this.queryParam.form = form;
    this.M.show('Изменение элемента', form);
    this.reloadAction = {
      dbAction: 'openSection',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }
  // Копировать Элемент
  copyElements() {
    if (this.id.getSelectedSize() !== 1) { f.showMsg('Выберите только 1 элемент', 'error'); return; }

    let form = this.tmp.form.cloneNode(true),
        id          = this.id.getSelected(),
        element     = this.itemList.get(id[0]);

    let node = form.querySelector('[name="type"]');
    node.value = this.getPopularType();

    node = form.querySelector('[name="name"]');
    node.value = element['E.name'];
    node.focus();

    node = form.querySelector('[name="parentId"]');
    node.value = this.queryParam.sectionId;
    node.disabled = true;

    this.queryParam.form = form;
    this.M.show('Копирование элемента', form);
    this.reloadAction = {
      dbAction: 'openSection',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }
  // Удалить элемент
  delElements() {
    if (!this.id.getSelectedSize()) return;
    this.queryParam.elementsId = JSON.stringify(this.id.getSelected());

    this.M.show('Удалить элемент', 'Удалить элемент и варианты?');
    this.reloadAction = {
      dbAction: 'openSection',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }

  selectedAll() {
    this.id.checkedAll();
  }
  clearId() {
    this.id.clear();
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.node.field.addEventListener('click', (e) => this.commonEvent(e));
    this.onCommonEvent();
  }
}
