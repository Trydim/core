'use strict';

import {f} from '../../main.js';

/*
function Node(node = {}) {
  this.nameNode = node.NAME;
  this.codeNode = node.CODE;
  this.childList = {};

  this.setNode = function (node) {
    if(!this.nameNode) {
      this.nameNode = node.NAME;
      this.codeNode = node.CODE;
    }
  };

  this.addChild = function (value) {
    if(this.childList[value]) return this;
    this.childList[value] = new Node();
  }
}

class SectionList {

  constructor(section) {
    this.name      = section.name || 'root';
    this.parentId  = section.parentId || 0;
    this.childList = [];
  }

  addChild(section) {
    this.childList.push(new SectionList(section));
  }



}
*/

export const catalog = {
  M: f.initModal(),

  field      : null,
  delayFunc  : () => {},
  sectionWrap: f.gI('sectionWrap').content.children[0],
  section    : f.gT('section'),

  curSectionNode: f.gI('sectionField'),

  changeSection: Object.create(null), // Узлы измений

  sectionList: new Map(),
  elementsList: new Map(),
  optionsList: new Map(),

  reloadAction: false,
  sortParam: {
    elements: {
      sortDirect: true, // true = DESC, false
      currPage: 0,
      countPerPage: 20,
      pageCount: 0,
    },

    options: {
      sortDirect: true, // true = DESC, false
      currPage: 0,
      countPerPage: 20,
      pageCount: 0,
    }
  },

  queryParam: {
    tableName: 'section',
    dbAction: 'loadSection',
    sectionId: 0,
    sectionName: '',
    sectionCode: '',
    sectionParentId: 0,
  },

  init() {
    this.query();

    this.onEventNode(this.curSectionNode, this.clickSection);
    //this.setNodes();
    this.onEvent();
    return this;
  },

  /*setNodes() {
    this.changeSection.wrap = f.gI('changeSection');
    this.changeSection.name = this.changeSection.wrap.querySelector('input[name=sectionName]');
    this.changeSection.parentName = this.changeSection.wrap.querySelector('input[name=sectionParent]');
  },*/

  query(param = {}) {
    let {sort = false} = param;

    let form = new FormData();
    form.set('mode', 'DB');

    if(sort) Object.entries(this.sortParam[sort]).map(param => {
      form.set(param[0], param[1]);
    })

    Object.entries(this.queryParam).map(param => {
      form.set(param[0], param[1]);
    })

    f.Post({data: form}).then(data => {

      if(this.reloadAction) {
        this.query(this.setReloadQueryParam());
        return;
      }

      if (data['section']) this.appendSection(data['section']);
      if (data['elements']) {
        this.prepareElements(data);
        if (data['countRowsElements'])  this.fillPagination(data['countRowsElements'], 'elements');
      }
      if (data['options']) {
        this.prepareOptions(data);
        if (data['countRowsOptions']) this.fillPagination(data['countRowsOptions'], 'options');
      }
    });
  },

  appendSection(sections) {
    this.addSectionList(sections);

    let wrap = this.sectionWrap.cloneNode(true);
    wrap.innerHTML = f.replaceTemplate(this.section, sections);

    /*ВРЕМЕННО*/
    let id = sections[0].parent.ID;
    let section = f.qS(`#sectionField`);
    let cursec = section.parentNode.querySelector(`[data-id="${id}"] + .subSection`);
    /*ВРЕМЕННО*/
    f.eraseNode(cursec).append(wrap);
    //f.eraseNode(this.curSectionNode.parentNode.querySelector('.subSection')).append(wrap);
    wrap.querySelectorAll('[data-id]').forEach(n => {
      this.onEventNode(n, this.clickSection);
      this.onEventNode(n, this.loadSection, {once: true}, 'dblclick');
    });
  },

  addSectionList(sections) {
    let parent = this.sectionList.get(this.queryParam.sectionId) || {ID: 0};

    for(let i of this.sectionList.entries()) { // обновление секции
      if(i[1].parent.ID === parent.ID) this.sectionList.delete(i[0]);
    }
    sections.forEach(i => this.sectionList.set(i.ID, Object.assign(i, {parent: parent})));
  },

  getParentSection(id) {
    let parent = this.sectionList.get(id);
    return parent.id ? parent.id : 0;
  },

  // Заполнить кнопки страниц
  fillPagination(count, id) {
    let countBtn = Math.ceil(+count / this.sortParam[id].countPerPage );

    if(this.sortParam[id].pageCount !== +countBtn) this.sortParam[id].pageCount = +countBtn;
    else return; // Кол кнопок не поменялось

    if ( countBtn === 1) { // Одну кнопку не отображать
      this.sortParam[id].pageCount = 0;
      f.eraseNode(f.gI(id + 'PageWrap')); return;
    }

    let html = '', tpl, input = f.gT('onePageInput');

    for(let i = 0; i < countBtn; i++) {
      tpl = input.replace('${page}', i.toString());
      tpl = tpl.replace('${pageValue}', (i + 1).toString());

      html += tpl;
    }

    f.gI(id + 'PageWrap').innerHTML = html;
    this.onPagePaginationClick(id);
  },

  prepareElements(data) {
    let param = {
      type: 'elements',
      fieldId: 'elementsField', // Ид таблицы вывода
    };

    this.setElementsList(data, param.type);
    this.showTableItems(data[param.type], param);
    f.show(f.gI(param.fieldId));
  },
  prepareOptions(data) {
    let param = {
      type: 'options', // тип данных
      fieldId: 'optionsField', // Ид таблицы вывода
    };

    this.setElementsList(data, param.type);
    this.showTableItems(data[param.type], param);
    f.show(f.gI(param.fieldId));
  },

  setElementsList(data, typeList) {
    this[typeList + 'List'] = new Map();
    data[typeList].forEach(i => this[typeList + 'List'].set(i.ID || i['O.ID'], i));
  },

  setTableHead(column, param) {
    let itemsField = param.type + 'Field',
        tmp = f.gT('itemsTableHead'), html = '<th></th>';
    this.sortParam[param.type].sortColumn = column[0] || false;

    column.map(i => html += tmp.replace(/\${name}/g, i));

    this[itemsField].querySelector('tr').innerHTML = html;
    this.onEventColumnTable(param.type);
    this.onEventFooterTable(param.type);
  },
  showTableItems(elements, param) {
    if (!elements.length) {
      this.sortParam[param.type].currPage > 0 && this.sortParam[param.type].currPage--;
      //this.query({sort: param.type});
      return;
    }

    let selParam = 'selected' + param.type + 'Id',
        itemsField = param.type + 'Field';

    this[selParam] = new Set();
    this[itemsField] || (this[itemsField] = f.gI(param.fieldId));
    this.checkboxTmp || (this.checkboxTmp = f.gT('itemsTableRowsCheck'))
    this.sortParam[param.type].sortColumn || (this.setTableHead(Object.keys(elements[0]), param));

    let trNode = [],
        tBody = this[itemsField].querySelector('tbody');

    elements.map(row => {
      let idField = Object.keys(row).find(i => i.toLowerCase().includes('id')),
          tr = document.createElement('tr');
      tr.innerHTML = this.checkboxTmp.replace('${ID}', row[idField]);
      Object.entries(row).map(i => {
        if(i[0] === 'activity') tr.innerHTML += !!+i[1] ? '<td>+</td>' : '<td>-</td>';
        else tr.innerHTML += `<td>${i[1]}</td>`;
      });
      trNode.push(tr);
    });

    f.eraseNode(tBody).append(...trNode);
    this.checkedRows(param);
    this.onEventElementsTable(itemsField);
  },

  setReloadQueryParam() {
    this.queryParam = Object.assign(this.queryParam, this.reloadAction);
    this.reloadAction = false;
  },

  // TODO events function
  //--------------------------------------------------------------------------------------------------------------------

  actionBtn(e) {
    let target = e.target,
        action = target.getAttribute('data-action');

    let select = {
      // Открыть секцию
      'openSection' : () => {
        this.queryParam.sectionId = this.curSectionNode.getAttribute('data-id') || false;
        if(!this.queryParam.sectionId) return;
        this.query();
      },
      // Изменить секцию
      'changeSection' : () => {
        let form = f.gTNode('sectionForm'), node;

        this.queryParam.sectionId = this.curSectionNode.getAttribute('data-id') || false;
        if(!this.queryParam.sectionId) { this.M.hide(); return; }

        let parentName = 'корень',
            section = this.sectionList.get(this.queryParam.sectionId);

        node = form.querySelector('[name="sectionName"]');
        node.value = section.name;
        this.onEventNode(node, this.changeTextInput, {}, 'blur');

        /*node = form.querySelector('[name="sectionCode"]');
        node.value = section.name;
        this.onEventNode(node, this.changeSectionInput, {}, 'blur');*/

        section.parent.name && (parentName = section.parent.name);
        node = form.querySelector('[name="sectionParent"]');
        node.value = parentName;
        this.onEventNode(node, this.changeParentSection, {}, 'blur');

        this.M.show('Изменить раздел', form);
        this.reloadAction = {
          dbAction : 'loadSection',
          sectionId: this.getParentSection(this.queryParam.sectionId)};
        },
      // Удалить секцию
      'delSection' : () => {
        this.queryParam.sectionId = this.curSectionNode.getAttribute('data-id') || false;
        if(!this.queryParam.sectionId) { this.M.hide(); return; }

        this.M.show('Удалить раздел', 'Удалятся вложенные элементы');
        this.reloadAction = {
          dbAction : 'loadSection',
          sectionId: this.getParentSection(this.queryParam.sectionId) };
        },
      // Создать секцию
      'createSection' : () => {
        let form = f.gTNode('sectionForm');

        this.onEventNode(form.querySelector('[name="sectionName"]'), this.changeTextInput, {}, 'blur');
        this.onEventNode(form.querySelector('[name="sectionCode"]'), this.changeTextInput, {}, 'blur');
        this.onEventNode(form.querySelector('[name="sectionParent"]'), this.changeParentSection, {}, 'blur');

        this.M.show('Создание раздел', form);
        this.reloadAction = { dbAction : 'loadSection', sectionId: 0 };
        },

      // Создать элемент
      'createElements' : () => {
        // Запросить типы элементов
        let form = f.gTNode('elementForm');

        this.queryParam.sectionId = this.curSectionNode.getAttribute('data-id') || false;
        if(!this.queryParam.sectionId) { this.M.hide(); return; }

        this.onEventNode(form.querySelector('[name="elementType"]'), this.changeTextInput, {}, 'blur');
        this.onEventNode(form.querySelector('[name="elementName"]'), this.changeTextInput, {}, 'blur');

        //this.onEventNode(form.querySelector('[name="sectionParent"]'), this.changeParentSection, {}, 'blur');

        form.querySelector('#changeField').remove();
        this.M.show('Создание элемента', form);
        this.reloadAction = { dbAction : 'openSection' };
      },
      // Открыть элемент
      'openElements': () => {
        if (this.selectedId.elements.size !== 1) return;

        this.queryParam.elementsId = this.selectedId.elements.keys().next().value;
        this.query({sort: 'options'});
      },
      // Изменить элемент
      'changeElements': () => {
        // Нужен запрос на секции
        if(!this.selectedId.elements.size) return;

        let oneElements = this.selectedId.elements.size === 1,
            form = f.gTNode('elementForm'),
            id = this.getSelectedList('elements'),
            element = this.elementsList.get(id[0]);

        this.queryParam.elementsId = JSON.stringify(id);
        this.delayFunc = () => this.eraseSelectedList('elements');

        let node = form.querySelector('[name="elementType"]');
        node.value = element['C.name'];
        this.onEventNode(node, this.changeTextInput, {}, 'blur');

        if(oneElements) {
          node       = form.querySelector('[name="elementName"]');
          node.value = element['E.name'];
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
        } else form.querySelector('[name="elementName"]').parentNode.remove();

        node = form.querySelector('[name="elementActivity"]');
        node.checked = oneElements ? !!(+element['activity']) : true;
        this.onEventNode(node, this.changeCheckInput, {}, 'change');

        node = form.querySelector('[name="elementSort"]');
        node.value = oneElements ? element['sort'] : 100;
        this.onEventNode(node, this.changeTextInput, {}, 'blur');

        //form.querySelector('[name="sectionParent"]').value = element[''];

        this.M.show('Изменение элемента', form);
        this.reloadAction = { dbAction : 'openSection' };
      },
      // Удалить элемент
      'delElements': () => {
        if (!this.selectedId.elements.size) return;

        this.queryParam.elementsId = JSON.stringify(this.getSelectedList('elements'));
        this.delayFunc = () => {
          this.eraseSelectedList('elements');
          f.hide(f.gI('optionsField'));
        }

        this.M.show('Удалить элемент', 'Удалить элемент и варианты?');
        this.reloadAction = { dbAction : 'openSection' };
      },

      // Добавить вариант
      'createOptions': () => {
        // Нужен запрос на ID валют
        // Нужен запрос на ID единиц измерения
        let form = f.gTNode('optionForm');

        //if(!this.queryParam.optionId) { this.M.hide(); return; }

        this.onEventNode(form.querySelector('[name="optionName"]'), this.changeTextInput, {}, 'blur');

        // валюта по умолчанию, заменить на select // Временно
        let node = form.querySelector('[name="moneyInputId"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        node.dispatchEvent(new Event('blur'));

        let nodeInput = form.querySelector('[name="moneyInput"]');
        let nodePercent = form.querySelector('[name="outputPercent"]');
        let nodeOutput = form.querySelector('[name="moneyOutput"]');

        this.onEventNode(nodeInput, (e) => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
        nodeInput.value = 0;

        // Временно
        node = form.querySelector('[name="unitId"]');
        this.onEventNode(node,  this.changeSelectInput, {}, 'blur');
        node.dispatchEvent(new Event('blur'));

        // Временно
        node = form.querySelector('[name="moneyOutputId"]');
        this.onEventNode(node,  this.changeSelectInput, {}, 'blur');
        node.dispatchEvent(new Event('blur'));

        this.onEventNode(nodePercent, (e) => this.changeOutputPercent.apply(this, [e, nodeInput, nodeOutput]), {}, 'blur');
        nodePercent.value = 30;

        this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput.apply(this, [e, nodeInput, nodePercent]), {}, 'blur');
        nodeOutput.dispatchEvent(new Event('blur'));

        form.querySelector('#changeField').remove();
        this.M.show('Создание вариантов', form);
        this.reloadAction = { dbAction : 'openElements' };
      },
      // Изменить вариант
      'changeOptions': () => {
        if (!this.selectedId.options.size) return;
        // Нужен запрос на ID валют
        // Нужен запрос на ID единиц измерения
        let oneElements = this.selectedId.options.size === 1,
            form = f.gTNode('optionForm'), node,
            id = this.getSelectedList('options'),
            options = this.optionsList.get(id[0]);

        this.queryParam.optionsId = JSON.stringify(id);
        this.delayFunc = () => this.eraseSelectedList('options');

        node = form.querySelector('[name="optionName"]');
        if (oneElements) {
          this.onEventNode(node, this.changeTextInput, {}, 'blur');
          node.value = options['O.name'];
        } else node.remove();

        // валюта по умолчанию, заменить на select // Временно
        node = form.querySelector('[name="moneyInputId"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        // из списка найти валюту, выбрать
        //node.value = 1; options['MI.name'];

        let nodeInput = form.querySelector('[name="moneyInput"]');
        let nodePercent = form.querySelector('[name="outputPercent"]');
        let nodeOutput = form.querySelector('[name="moneyOutput"]');

        if (oneElements) {
          this.onEventNode(nodeInput, (e) => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
          nodeInput.value = options['input_price'];
        } else nodeInput.remove();

        // Временно
        node = form.querySelector('[name="unitId"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        // из списка найти валюту, выбрать
        //node.value = 1; options['O.unit_id'];

        // Временно
        node = form.querySelector('[name="moneyOutputId"]');
        this.onEventNode(node, this.changeSelectInput, {}, 'blur');
        // из списка найти валюту, выбрать
        //node.value = 1; options['MO.name'];

        if (oneElements) {
          this.onEventNode(nodePercent, (e) => this.changeOutputPercent.apply(this, [e, nodeInput, nodeOutput]), {}, 'blur');
          nodePercent.value = options['output_percent'];
        } this.onEventNode(nodePercent, this.changeNumberInput, {}, 'blur');

        if (oneElements) {
          this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput.apply(this, [e, nodeInput, nodePercent]), {}, 'blur');
          nodeOutput.value = options['output_price'];
        } else nodeOutput.remove();

        node = form.querySelector('[name="optionActivity"]');
        node.checked = oneElements ? !!(+options['O.activity']) : true;
        this.onEventNode(node, this.changeCheckInput, {}, 'change');

        node = form.querySelector('[name="optionSort"]');
        node.value = oneElements ? options['sort'] : 100;
        this.onEventNode(node, this.changeTextInput, {}, 'blur');

        this.M.show('Изменение вариантов', form);
        this.reloadAction = { dbAction : 'openElements' };
      },
      // Удалить вариант
      'delOptions': () => {
        if (!this.selectedId.options.size) return;

        this.queryParam.optionsId = JSON.stringify(this.getSelectedList('options'));
        this.delayFunc = () => {
          this.eraseSelectedList('options');
        };

        this.M.show('Удалить вариант', 'Удалить выбранные варианты?');
        this.reloadAction = { dbAction : 'openElements' };
      },
    }

    if(action === 'confirmYes') {
      if (this.queryParam.dbAction.includes('Section')) this.queryParam.tableName = 'section';
      else if (this.queryParam.dbAction.includes('Element')) this.queryParam.tableName = 'elements';
      else if (this.queryParam.dbAction.includes('Option')) this.queryParam.tableName = 'options_elements';

      this.delayFunc();
      this.delayFunc = () => {}
      this.query();
    } else if (action === 'confirmNo') {
      this.reloadAction = false;
    } else {
      this.queryParam.dbAction = action;
      select[action] && select[action]();
    }
  },

  loadSection(e) {
    let target = e.target;

    for (let i = 0; i<3,target.tagName !== 'LI'; i++, target = target.parentNode) {
      if (target.hasAttribute('data-id')) break;
    }

    target.classList.remove('closeSection');

    target.classList.add('openSection');
    this.onEventNode(target, this.clickSection);
    this.onEventNode(target, this.dbClickSection, {}, 'dblclick');

    this.queryParam.sectionId = target.getAttribute('data-id');
    this.queryParam.dbAction  = 'loadSection';
    this.query();
  },

  clickSection(e) {
    let target = e.target;

    this.curSectionNode.classList.remove('focused');
    this.curSectionNode = target;

    target.classList.add('focused');
  },

  dbClickSection(e) {
    let target = e.target;

    target.classList.toggle('closeSection');
    target.classList.toggle('openSection');
  },

  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка Названия'; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeNumberInput(e) {
    if (isNaN(e.target.value)) { e.target.value = 0; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeSelectInput(e) {
    this.queryParam[e.target.name] = e.target.value;
  },
  changeMoneyInput(e, nodePercent, nodeOutput) {
    this.changeNumberInput(e);

    nodeOutput.value = +e.target.value * ( 1 + +nodePercent.value / 100);
    this.queryParam[nodeOutput.name] = nodeOutput.value;
  },
  changeOutputPercent(e, nodeInputM, nodeMoney) {
    this.changeNumberInput(e);

    nodeMoney.value = +nodeInputM.value * ( 1 + +e.target.value / 100);
    this.queryParam[nodeMoney.name] = nodeMoney.value;
  },
  changeMoneyOutput(e, nodeInputM, nodePercent) {
    this.changeNumberInput(e);

    nodePercent.value = (+e.target.value / +nodeInputM.value - 1) * 100;
    this.queryParam[nodePercent.name] = nodePercent.value;
  },
  changeCheckInput(e) {
    this.queryParam[e.target.name] = e.target.checked;
  },
  changeParentSection(e) {
    this.queryParam.sectionParentId = e.target.value;
    this.reloadAction.sectionId = e.target.value;
  },

  // сортировка Элементов
  sortRows(e) { /*'↑'*/
    let input = e.target,
        colSort = input.getAttribute('data-ordercolumn'),
        item = input && input.closest('[data-field]').getAttribute('data-field');

    this[item + 'Field'].querySelector(`input[data-ordercolumn="${colSort}"]`)
      .classList.remove(f.CLASS_NAME.SORT_BTN_CLASS);
    input.classList.add(f.CLASS_NAME.SORT_BTN_CLASS);

    if(this.sortParam[item].sortColumn === colSort) {
      this.sortParam[item].sortDirect = !this.sortParam[item].sortDirect;
    } else {
      this.sortParam[item].sortColumn = colSort;
      this.sortParam[item].sortDirect = false;
    }

    this.queryParam.dbAction = item === 'elements' ? 'openSection' : 'openElements';
    this.query({sort: item});
  },

  // кнопки листания
  pageBtn(e) {
    let btn = e && e.target,
        key = btn && btn.getAttribute('data-action') || 'def',
        item = btn && btn.closest('[data-field]').getAttribute('data-field');

    let select = {
      'new'  : (item) => { this.sortParam[item].currPage--; },
      'old'  : (item) => { this.sortParam[item].currPage++; },
      'page' : () => { this.sortParam[item].currPage = btn.getAttribute('data-page'); },
      'count': (item) => { this.sortParam[item].countPerPage = e.target.value; },
      //'def'  : (item) => { this.sortParam.dbAction     = 'openSection'; },
    }
    select[key](item);

    if (this.sortParam[item].currPage < 0) { this.sortParam[item].currPage = 0; return; }

    this.queryParam.dbAction = item === 'elements' ? 'openSection' : 'openElements';
    this.query({sort: item});
  },

  // TODO bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, (e) => func.call(this, e), options);
  },

  onEvent() {
    // buttons
    //f.qA('#footerBtn input[data-action], #modalWrap input[data-action], #btnElementsWrap input[data-action]',
    //f.qA('.controlWrap input[data-action]', 'click', (() => (e) => this.actionBtn.call(this, e))());
    f.qA('input[data-action]', 'click', (() => (e) => this.actionBtn.call(this, e))());
  },

  // кнопки таблицы
  onEventColumnTable(item) {
    this[item + 'Field'].querySelectorAll('thead input').forEach(n => {
      n.addEventListener('click', (e) => this.sortRows.call(this, e));
    });
  },

  onPagePaginationClick(id) {
    f.qA(`#${id}PageWrap input[data-action]`, 'click', (() => (e) => this.pageBtn.call(this, e))());
  },

  // TODO selected Rows
  //--------------------------------------------------------------------------------------------------------------------

  checkboxTmp: null,
  selectedId: { // TODO сохранять в сессии потом, что бы можно было перезагрузить страницу
    elements: new Set(),
    options: new Set(),
  },

  getSelectedList(item) {
    let ids = [];
    for( let id of this.selectedId[item].values()) ids.push(id);
    return ids;
  },

  eraseSelectedList(item) {
    this.selectedId[item].clear();
  },

  // выбор элемента
  selectRows(e) {
    let input = e.target,
        id = input.getAttribute('data-id'),
        item = input && input.closest('[data-field]').getAttribute('data-field');

    if (input.checked) this.selectedId[item].add(id);
    else this.selectedId[item].delete(id);

    //this.checkBtnRows();
  },

  // Выделить выбранные Заказы
  checkedRows(param) {
    let table = f.gI(param.fieldId);

    this.selectedId[param.type].forEach(id => {
      let input = table.querySelector(`input[data-id="${id}"]`);
      if (input) input.checked = true;
    });
  },

  onEventElementsTable(itemsField) {
    // Checked rows
    this[itemsField].querySelectorAll('tbody input').forEach(n => {
      n.addEventListener('change', (e) => this.selectRows.call(this, e));
    });
  },

  onEventFooterTable(item) {
    // Pagination btn
    f.qA('#' + item + 'Field .pageWrap input[data-action]', 'click', (() => (e) => this.pageBtn.call(this, e))());
    f.qA('#' + item + 'Field .pageWrap select[data-action]', 'change', (() => (e) => this.pageBtn.call(this, e))());
  },
}
