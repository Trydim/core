'use strict';

import {Common} from "./Main";

export class Options extends Common {
  constructor(props) {
    super('options', props);

    const field = f.qS(`#${this.type}Field`);

    this.setNodes(field, props.tmp);

    this.paginator = new f.Pagination(`#${this.type}Field .pageWrap`,{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.id = new f.SelectedRow({table: this.node.fieldT});

    f.observer.subscribe(`loadOptions`, d => this.load(d));
    this.onEvent();
  }

  load(data) {
    data['options'] && this.prepareItems(data['options']);
    data['countRowsOptions'] && this.paginator.setCountPageBtn(data['countRowsOptions']);
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Добавить вариант
  createOptions() {
    let form = f.gTNode('#optionForm');

    this.onEventNode(form.querySelector('[name="optionName"]'), this.changeTextInput, {}, 'blur');

    let nodeInput   = form.querySelector('[name="moneyInput"]');
    let nodePercent = form.querySelector('[name="outputPercent"]');
    let nodeOutput  = form.querySelector('[name="moneyOutput"]');

    this.onEventNode(nodeInput, (e) => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
    nodeInput.value = 0;

    this.onEventNode(nodePercent, (e) => this.changeOutputPercent.apply(this, [e, nodeInput, nodeOutput]), {}, 'blur');
    nodePercent.value = 30;

    this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput.apply(this, [e, nodeInput, nodePercent]), {}, 'blur');
    nodeOutput.dispatchEvent(new Event('blur'));

    form.querySelector('#changeField').remove();
    this.M.show('Создание вариантов', form);
    this.reloadAction = {dbAction: 'openElements'};
  }
  // Изменить вариант
  changeOptions() {
    if (!this.optionsId.getSelectedSize()) {
      f.showMsg('Выберите варианты', 'error');
      return;
    }

    let oneElements = this.optionsId.getSelectedSize() === 1,
        form        = f.gTNode('#optionForm'),
        node,
        id          = this.optionsId.getSelectedList(),
        options     = this.optionsList.get(id[0]);

    this.queryParam.optionsId = JSON.stringify(id);
    this.delayFunc            = () => this.optionsId.clean();

    if (oneElements) {
      const prop = Object.assign({}, options, (options['properties'] && JSON.parse(options['properties'])));

      Object.entries(prop).forEach(([k, v]) => {
        node = form.querySelector(`[name="${k}"]`);
        node && (node.type !== 'checkbox' ? node.value = v : node.checked = !!+v);
      });

      //this.onEventNode(node, this.changeTextInput, {}, 'blur');
    } else {
      ['O.name'].forEach(n => {
        node = form.querySelector(`[name="${n}"]`);
        node && node.remove();
      })
    }

    let nodeInput   = form.querySelector('[name="input_price"]');
    let nodePercent = form.querySelector('[name="output_percent"]');
    let nodeOutput  = form.querySelector('[name="output_price"]');

    this.onEventNode(nodeInput, e => this.changeMoneyInput.apply(this, [e, nodePercent, nodeOutput]), {}, 'blur');
    if (oneElements) this.onEventNode(nodePercent,
      (e) => this.changeOutputPercent.apply(this, [e, nodeInput, nodeOutput]), {}, 'blur'); else this.onEventNode(
      nodePercent, this.changeNumberInput, {}, 'blur');
    this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput.apply(this, [e, nodeInput, nodePercent]), {}, 'blur');

    this.M.show('Изменение вариантов', form);
    this.reloadAction = {dbAction: 'openElements'};
  }
  // Удалить вариант
  delOptions() {
    if (!this.id.getSelectedSize()) return;

    this.queryParam.optionsId = JSON.stringify(this.id.getSelectedList());
    this.delayFunc = () => this.id.clear();

    this.M.show('Удалить вариант', 'Удалить выбранные варианты?');
    this.reloadAction = {dbAction: 'openElements'};
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.node.field.addEventListener('click', (e) => this.commonEvent(e));
    this.onCommonEvent();
  }
}
