'use strict';

import {Common} from "./Main";

export class Elements extends Common {
  constructor(props) {
    super('elements', props);

    const field = f.qS(`#${this.type}Field`);

    this.setNodes(field, props.tmp);

    this.paginator = new f.Pagination(`#${this.type}Field .pageWrap`,{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.id = new f.SelectedRow({table: this.node.fieldT});

    f.observer.subscribe(`loadElements`, d => this.load(d));
    this.onEvent();
  }

  load(data) {
    data['elements'] && this.prepareItems(data['elements']);
    data['countRowsElements'] && this.paginator.setCountPageBtn(data['countRowsElements']);
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Создать элемент
  createElements() {
    let form = f.gTNode('#elementForm');

    this.queryParam.sectionId = this.curSectionNode.dataset.id || false;
    if (!this.queryParam.sectionId) {
      this.M.hide();
      return;
    }

    //this.onEventNode(form.querySelector('[name="sectionParent"]'), this.changeParentSection, {}, 'blur');

    form.querySelector('#changeField').remove();
    this.M.show('Создание элемента', form);
    this.reloadAction = {dbAction: 'openSection'};
  }
  // Открыть элемент
  openElements() {
    if (this.id.getSelectedSize() !== 1) { f.showMsg('Выберите только 1 элемент', 'error'); return; }

    this.queryParam.elementsId = this.id.getSelectedList()[0];
    this.query({sort: 'options'}).then(data => data && f.observer.fire('loadOptions', data));
  }
  // Изменить элемент
  changeElements() {
    // Нужен запрос на секции
    if (!this.id.getSelectedSize()) return;

    let oneElements = this.id.getSelectedSize() === 1,
        form        = f.gTNode('#elementForm'),
        id          = this.id.getSelectedList(),
        element     = this.elementsList.get(id[0]);

    this.queryParam.id = JSON.stringify(id);
    this.delayFunc     = () => this.id.clear();

    let node = form.querySelector('[name="C.symbol_code"]');
    if (oneElements) node.value = element['C.symbol_code'];
    else node.parentNode.remove();

    node = form.querySelector('[name="E.name"]');
    if (oneElements) node.value = element['E.name'];
    else node.parentNode.remove();

    node = form.querySelector('[name="activity"]');
    node.checked = oneElements ? !!(+element['activity']) : true;

    node = form.querySelector('[name="sort"]');
    if (oneElements) node.value = element['sort'];
    else node.parentNode.remove();

    this.M.show('Изменение элемента', form);
    this.reloadAction = {dbAction: 'openSection'};
  }
  // Удалить элемент
  delElements() {
    if (!this.id.getSelectedSize()) return;

    this.queryParam.id = JSON.stringify(this.getSelectedList('elements'));
    this.delayFunc = () => {
      this.id.clear();
      f.hide(this.node.field);
    }

    this.M.show('Удалить элемент', 'Удалить элемент и варианты?');
    this.reloadAction = {dbAction: 'openSection'};
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.node.field.addEventListener('click', (e) => this.commonEvent(e));
    this.onCommonEvent();
  }
}
