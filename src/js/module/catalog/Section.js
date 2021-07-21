'use strict';

import {Catalog} from "./Main";

export class Section extends Catalog {
  constructor() {
    super('section');
    this.setParam();
    this.setNodes();
    this.onEvent();

  }

  setParam() {
    this.sectionList = new Map();

    this.queryParam = {
      tableName: 'section',
      dbAction : 'loadSection',
      sectionId: 0,
    };
    this.oneFunc = new f.OneTimeFunction('msgEmpty', this.showMsgEmpty);
  }
  setNodes() {
    this.node = {
      main: f.qS('#sectionField'),
      cSection: document.createElement('div'),
    };
    this.tmp = {
      sectionWrap: f.gTNode('#sectionWrap'),
      section    : f.gT('#section'),
    };
  }
  showMsgEmpty(sections) {
    if (!sections.length) f.showMsg('Создайте свой первый раздел!', 'warning');
  }

  addSectionList(sections) {
    let parent = this.sectionList.get(this.queryParam.sectionId) || {ID: 0};

    for(let i of this.sectionList.entries()) { // обновление секции
      if(i[1].parent.ID === parent.ID) this.sectionList.delete(i[0]);
    }
    sections.forEach(i => this.sectionList.set(i.ID, Object.assign(i, {parent: parent})));
  }
  appendSection(sections) {
    this.oneFunc.exec('msgEmpty', sections);
    if (!sections.length) return;
    this.addSectionList(sections);

    let wrap = this.tmp.sectionWrap.cloneNode(true);
    wrap.innerHTML = f.replaceTemplate(this.tmp.section, sections);

    /*ВРЕМЕННО*/
    let id = sections[0].parent.ID;
    let section = f.qS(`#sectionField`);
    let curSec = section.parentNode.querySelector(`[data-id="${id}"] + .subSection`);
    /*ВРЕМЕННО*/

    f.eraseNode(curSec).append(wrap);
  }
  loadSection() {
    this.query().then(data => data['section'] && this.appendSection(data['section']));
  }

  getParentSection(id) {
    let parent = this.sectionList.get(id);
    return parent.id ? parent.id : 0;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Выбрать
  clickSection(target) {
    this.node.cSection.classList.remove('focused');
    this.node.cSection = target;
    target.classList.add('focused');
  }
  // Создать
  createSection() {
    let form         = f.gTNode('#sectionForm'),
        parentId     = this.node.cSection.dataset.id || false,
        nodeParentId = form.querySelector('[name="parentId"]');

    // TODO Добавить проверку раздела
    parentId && (nodeParentId.value = parentId);
    // TODO обновлять список разделов

    this.queryParam.form = form;
    this.M.show('Создание раздел', form);
    this.reloadAction = {
      dbAction : 'loadSection',
      sectionId: 0
    };
  }
  // Открыть
  openSection() {
    this.queryParam.sectionId = this.node.cSection.dataset.id || false;
    if (!this.queryParam.sectionId) return;

    //this.elementsId.clear();
    //this.optionsId.clear();
    f.hide(this.node.options);

    this.query().then(data => f.observer.fire('loadElements', data));
  }
  // Изменить
  changeSection() {
    let form = f.gTNode('#sectionForm'), node;

    this.queryParam.sectionId = this.node.cSection.dataset.id || false;
    if (!this.queryParam.sectionId) { this.M.hide(); return; }

    let parentName = 'корень', section = this.sectionList.get(this.queryParam.sectionId);

    node       = form.querySelector('[name="sectionName"]');
    node.value = section.name;
    this.onEventNode(node, this.changeTextInput, {}, 'blur');

    /*node = form.querySelector('[name="sectionCode"]');
     node.value = section.name;
     this.onEventNode(node, this.changeSectionInput, {}, 'blur');*/

    section.parent.name && (parentName = section.parent.name);
    node       = form.querySelector('[name="sectionParent"]');
    node.value = parentName;
    this.onEventNode(node, this.changeParentSection, {}, 'blur');

    this.M.show('Изменить раздел', form);
    this.reloadAction = {
      dbAction : 'loadSection',
      sectionId: this.getParentSection(this.queryParam.sectionId)
    };
  }
  // Удалить
  delSection() {
    this.queryParam.sectionId = this.node.cSection.dataset.id || false;
    if (!this.queryParam.sectionId) { this.M.hide(); return; }

    this.M.show('Удалить раздел', 'Удалятся вложенные элементы');
    this.reloadAction = {
      dbAction : 'loadSection',
      sectionId: this.getParentSection(this.queryParam.sectionId)
    };
  }
  // Открыть нижний уровень
  dbClickSection(e) {
    let target = e.target;
    !target.dataset.id && (target = target.closest(['data-id']));
    if (!target) return;

    target.classList.toggle('closeSection');
    target.classList.toggle('openSection');

    this.queryParam.sectionId = target.dataset.id;
    this.queryParam.dbAction  = 'loadSection';
    this.loadSection();
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.node.main.addEventListener('click', (e) => this.commonEvent(e));
    this.node.main.addEventListener('dblclick', (e) => this.dbClickSection(e));
  }
}
