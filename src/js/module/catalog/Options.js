'use strict';

import {Common} from "./Main";

export class Options extends Common {
  constructor(props) {
    super('options', props);

    const field = f.qS(`#${this.type}Field`);

    this.queryParam.tableName = 'options_elements';
    this.setNodes(field, props.tmp);

    this.paginator = new f.Pagination(`#${this.type}Field .pageWrap`,{
      queryParam: this.queryParam,
      query: this.query.bind(this),
    });
    this.id = new f.SelectedRow({table: this.node.fieldT});

    f.observer.subscribe(`loadOptions`, d => this.load(d));
    f.observer.subscribe(`openElements`, d => this.openElements(d));
    this.onEvent();
  }

  load(data) {
    data['options'] && this.prepareItems(data['options']);
    data['countRowsOptions'] && this.paginator.setCountPageBtn(data['countRowsOptions']);
  }
  openElements(id) {
    this.queryParam.elementsId = id;
  }
  checkElements() {
    if (!this.queryParam.elementsId) { f.showMsg('Ошибка элемента', 'error'); return true; }
    return false;
  }
  changeMoneyInput(e, nodePercent, nodeOutput) {
    nodeOutput.value = +e.target.value * (1 + +nodePercent.value / 100);
    this.queryParam[nodeOutput.name] = nodeOutput.value;
  }
  changeOutputPercent(e, nodeInputM, nodeMoney) {
    nodeMoney.value = +nodeInputM.value * (1 + +e.target.value / 100);
    this.queryParam[nodeMoney.name] = nodeMoney.value;
  }
  changeMoneyOutput(e, nodeInputM, nodePercent) {
    nodePercent.value = (+e.target.value / +nodeInputM.value - 1) * 100;
    this.queryParam[nodePercent.name] = nodePercent.value;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Добавить вариант
  createOptions() {
    let form = this.tmp.form.cloneNode(true);

    let nodeInput   = form.querySelector('[name="inputPrice"]');
    let nodePercent = form.querySelector('[name="outputPercent"]');
    let nodeOutput  = form.querySelector('[name="outputPrice"]');

    this.onEventNode(nodeInput, (e) => this.changeMoneyInput(e, nodePercent, nodeOutput), {}, 'blur');
    nodeInput.value = 0;

    this.onEventNode(nodePercent, (e) => this.changeOutputPercent(e, nodeInput, nodeOutput), {}, 'blur');
    nodePercent.value = 30;

    this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput(e, nodeInput, nodePercent), {}, 'blur');
    nodeOutput.dispatchEvent(new Event('blur'));

    this.queryParam.form = form;
    this.M.show('Добавить вариант', form);
    form.querySelector('[name="name"]').focus();
    this.reloadAction = {
      dbAction: 'openElements',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }
  // Изменить вариант
  changeOptions() {
    if (!this.id.getSelectedSize()) { f.showMsg('Выберите варианты', 'error'); return; }

    let form        = this.tmp.form.cloneNode(true),
        oneElements = this.id.getSelectedSize() === 1, node,
        id          = this.id.getSelectedList(),
        options     = this.optionsList.get(id[0]);

    this.queryParam.id = JSON.stringify(id);
    this.delayFunc            = () => this.id.clean();

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

    this.queryParam.form = form;
    this.M.show('Изменение вариантов', form);
    this.reloadAction = {dbAction: 'openElements'};
  }
  // Копировать вариант
  copyOptions() {
    if (!this.id.getSelectedSize()) { f.showMsg('Выберите варианты', 'error'); return; }

    let form = this.tmp.form.cloneNode(true);

    this.queryParam.form = form;
    this.M.show('Копировать вариантов', form);
  }
  // Удалить вариант
  delOptions() {
    if (!this.id.getSelectedSize()) return;

    this.queryParam.id = JSON.stringify(this.id.getSelectedList());
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
