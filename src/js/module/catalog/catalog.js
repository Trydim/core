'use strict';

export const catalog = {
  M: f.initModal(),

  table: f.qS('#elementsField'),
  field      : null,
  delayFunc  : () => {},
  sectionWrap: f.gTNode('#sectionWrap'),
  section    : f.gT('#section'),

  curSectionNode: f.qS('#sectionField'),

  changeSection: Object.create(null), // Узлы измений

  sectionList : new Map(),
  elementsList: new Map(),
  optionsList : new Map(),

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
    tableName      : 'section',
    dbAction       : 'loadSection',
    sectionId      : 0,
    sectionName    : '',
    sectionCode    : '',
    sectionParentId: 0,
  },

  init() {
    /*this.sectionId = new f.SelectedRow({
      table: f.qS('.subSection'),
    });*/

    this.pElements = new f.Pagination( '#elementsField .pageWrap',{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.elementsId = new f.SelectedRow({
      table: f.qS('#elementsField table'),
    });

    this.pOptions = new f.Pagination( '#optionsField .pageWrap',{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.optionsId = new f.SelectedRow({
      table: f.qS('#optionsField table'),
    });

    new f.SortColumns(this.table.querySelector('thead'), this.query.bind(this), this.queryParam);
    //new f.SortColumns(this.table.querySelector('thead'), this.query.bind(this), this.queryParam);
    this.query();

    this.setData();
    this.setNodes();
    this.onEventNode(this.curSectionNode, this.clickSection);
    this.onEvent();
    return this;
  },

  setData() {
    this.db = {
      units: JSON.parse(f.qS('#dataUnits').value),
      money: JSON.parse(f.qS('#dataMoney').value),
    }
    this.setting = {
      elementsCol: f.qS('#elementsColumn').value.split(','),
      optionsCol: f.qS('#optionsColumn').value.split(','),
    }

  },
  setNodes() {
    const elements = f.qS('#elementsField'),
          options = f.qS('#optionsField');
    this.node = {
      elements,
      elementsTBody: elements.querySelector('tbody'),
      options,
      optionsTBody: options.querySelector('tbody'),
    }
    this.tmp = {
      tHead: f.gT('#itemsTableHead'),
      checkbox: f.gT('#itemsTableRowsCheck'),

    }
    /*this.changeSection.wrap = f.gI('changeSection');
    this.changeSection.name = this.changeSection.wrap.querySelector('input[name=sectionName]');
    this.changeSection.parentName = this.changeSection.wrap.querySelector('input[name=sectionParent]');*/
  },

  query(param = {}) {
    let {sort = false} = param;

    let form = new FormData();
    form.set('mode', 'DB');

    if(sort) Object.entries(this.sortParam[sort]).map(param => form.set(param[0], param[1]));

    Object.entries(this.queryParam).map(param => form.set(param[0], param[1]));

    f.Post({data: form}).then(data => {
      if(this.reloadAction) {
        this.query(this.setReloadQueryParam());
        return;
      }

      if (data['section']) this.appendSection(data['section']);
      if (data['elements']) {
        this.prepareItems(data['elements'], 'elements');
        data['countRowsElements'] && this.pElements.setCountPageBtn(data['countRowsElements']);
      }
      if (data['options']) {
        this.prepareItems(data['options'], 'options');
        data['countRowsOptions'] && this.pOptions.setCountPageBtn(data['countRowsOptions']);
      }
    });
  },

  // Sections
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

  setItemsList(data, type) {
    this[type + 'List'] = new Map();
    data.forEach(i => this[type + 'List'].set(i.ID || i['O.ID'], i));
  },
  setTablesHeaders(type) {
    this.sortParam[type].sortColumn = 'O.ID';

    let html = '<tr><th></th>';
    this.setting[type + 'Col'].map(i => {
      html += f.replaceTemplate(this.tmp.tHead, {name: i});
    });
    this.node[type].querySelector('tr').innerHTML = html + '</tr>';
  },
  showTablesItems(data, type) {
    this.sortParam[type].sortColumn || this.setTablesHeaders(type);

    const trNode = [],
          colSelect = {
            'activity': v => !!+v ? '<td>+</td>' : '<td>-</td>',
            'O.activity': v => !!+v ? '<td>+</td>' : '<td>-</td>',

            'ex': v => '<td></td>',
            'images': v => '<td>Изображения</td>',

            'U.ID': v => `<td>${this.db.units[v]['short_name']}</td>`,
            'MI.ID': v => `<td>${this.db.money[v].name}</td>`,
            'MO.ID': v => `<td>${this.db.money[v].name}</td>`,
          };

    data.map(row => {
      let tr = document.createElement('tr');
      tr.innerHTML = f.replaceTemplate(this.tmp.checkbox, {id: row['ID'] || row['O.ID']});
      this.setting[type + 'Col'].forEach(col => {
        tr.innerHTML += (colSelect[col] && colSelect[col](row[col])) || `<td>${row[col]}</td>`;
      });
      trNode.push(tr);
    });

    f.eraseNode(this.node[type + 'TBody']).append(...trNode);
  },
  prepareItems(data, type) {
    this.setItemsList(data, type);
    this.showTablesItems(data, type);
    f.show(this.node[type]);
  },

  setReloadQueryParam() {
    this.queryParam = Object.assign(this.queryParam, this.reloadAction);
    this.reloadAction = false;
  },

  // Events function
  //--------------------------------------------------------------------------------------------------------------------

  actionBtn(e) {
    let target = e.target,
        action = target.dataset.action;

    let select = {
      // Открыть секцию
      'openSection' : () => {
        this.queryParam.sectionId = this.curSectionNode.getAttribute('data-id') || false;
        if(!this.queryParam.sectionId) return;

        this.elementsId.clear();
        this.optionsId.clear();
        f.hide(this.node.options);

        this.query();
      },
      // Изменить секцию
      'changeSection' : () => {
        let form = f.gTNode('#sectionForm'), node;

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
        let form = f.gTNode('#sectionForm');

        this.onEventNode(form.querySelector('[name="sectionName"]'), this.changeTextInput, {}, 'blur');
        this.onEventNode(form.querySelector('[name="sectionCode"]'), this.changeTextInput, {}, 'blur');
        this.onEventNode(form.querySelector('[name="sectionParent"]'), this.changeParentSection, {}, 'blur');

        this.M.show('Создание раздел', form);
        this.reloadAction = { dbAction : 'loadSection', sectionId: 0 };
      },

      // Создать элемент
      'createElements' : () => {
        // Запросить типы элементов
        let form = f.gTNode('#elementForm');

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
        if (this.elementsId.getSelectedSize() !== 1) { f.showMsg('Выберите только 1 элемент', 'error'); return; }

        this.queryParam.elementsId = this.elementsId.getSelectedList()[0];
        this.query({sort: 'options'});
      },
      // Изменить элемент
      'changeElements': () => {
        // Нужен запрос на секции
        if(!this.elementsId.getSelectedSize()) return;

        let oneElements = this.elementsId.getSelectedSize() === 1,
            form = f.gTNode('#elementForm'),
            id = this.elementsId.getSelectedList(),
            element = this.elementsList.get(id[0]);

        this.queryParam.elementsId = JSON.stringify(id);
        this.delayFunc = () => this.elementsId.clear();

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
        let form = f.gTNode('#optionForm');

        this.onEventNode(form.querySelector('[name="optionName"]'), this.changeTextInput, {}, 'blur');

        let nodeInput = form.querySelector('[name="moneyInput"]');
        let nodePercent = form.querySelector('[name="outputPercent"]');
        let nodeOutput = form.querySelector('[name="moneyOutput"]');

        this.onEventNode(nodeInput, (e) => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
        nodeInput.value = 0;

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
        if (!this.optionsId.getSelectedSize()) { f.showMsg('Выберите варианты', 'error'); return; }

        let oneElements = this.optionsId.getSelectedSize() === 1,
            form = f.gTNode('#optionForm'), node,
            id = this.optionsId.getSelectedList(),
            options = this.optionsList.get(id[0]);

        this.queryParam.optionsId = JSON.stringify(id);
        this.delayFunc = () => this.optionsId.clean();

        if (oneElements) {
          const prop = Object.assign({}, options, (options['properties'] && JSON.parse(options['properties'])));

          Object.entries(prop).forEach(([k, v]) => {
            node = form.querySelector(`[name="${k}"]`);
            node && (node.type !== 'checkbox'
                    ? node.value = v
                    : node.checked = !!+v);
          });

          //this.onEventNode(node, this.changeTextInput, {}, 'blur');
        } else {
          ['O.name'].forEach(n => {
            node = form.querySelector(`[name="${n}"]`);
            node && node.remove();
          })
        }

        let nodeInput = form.querySelector('[name="input_price"]');
        let nodePercent = form.querySelector('[name="output_percent"]');
        let nodeOutput = form.querySelector('[name="output_price"]');

        this.onEventNode(nodeInput, e => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
        if (oneElements) this.onEventNode(nodePercent, (e) => this.changeOutputPercent.apply(this, [e, nodeInput, nodeOutput]), {}, 'blur');
        else this.onEventNode(nodePercent, this.changeNumberInput, {}, 'blur');
        this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput.apply(this, [e, nodeInput, nodePercent]), {}, 'blur');

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

      'setupProperties': () => {

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
  sortRows(e) {
    let input = e.target,
        colSort = input.dataset.ordercolumn,
        item = colSort && input.closest('[data-field]').dataset.field;

    if (!colSort) return;

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

  // Bind events
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
    //f.qA('.controlWrap input[data-action]', 'click', (e) => this.actionBtn.call(this, e);
    f.qA('input[data-action]', 'click', (e) => this.actionBtn.call(this, e));

    // Кнопки сортировки
    this.node.elements.addEventListener('click', e => this.sortRows(e));
    this.node.options.addEventListener('click', e => this.sortRows(e));
  },
}
