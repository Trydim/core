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
  initMoneyControl(form, option = {}) {
    let nodeInput   = form.querySelector('[name="inputPrice"]');
    let nodePercent = form.querySelector('[name="outputPercent"]');
    let nodeOutput  = form.querySelector('[name="outputPrice"]');

    this.onEventNode(nodeInput, (e) => this.changeMoneyInput(e, nodePercent, nodeOutput), {}, 'blur');
    this.onEventNode(nodePercent, (e) => this.changeOutputPercent(e, nodeInput, nodeOutput), {}, 'blur');
    this.onEventNode(nodeOutput, (e) => this.changeMoneyOutput(e, nodeInput, nodePercent), {}, 'blur');
    nodeInput.value = option['moneyInput'] || 0;
    nodePercent.value = option['outputPercent'] || 30;
    nodeOutput.value = option['moneyOutput'] || 0;
    //nodeOutput.dispatchEvent(new Event('blur'));
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Добавить вариант
  createOptions() {
    let form = this.tmp.form.cloneNode(true);
    form.querySelectorAll('.onlyMany').forEach(n => n.remove());
    f.show(form.querySelector('[data-field="properties"]'));

    this.initMoneyControl(form);

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

    const form       = this.tmp.form.cloneNode(true),
          oneElement = this.id.getSelectedSize() === 1,
          id         = this.id.getSelected(),
          option     = this.itemList.get(id[0]),
          initParam  = (option, skip = []) => {
            Object.entries(option).forEach(([k, v]) => {
              if (skip.includes(k)) return;
              let node = form.querySelector(`[name="${k}"]`);
              node && (node.type === 'checkbox' ? node.checked = !!+v : node.value = v);
            });
          };

    let nodeProp = form.querySelector('[data-field="properties"]');

    /*activity: "1"
     images: null
     inputPrice: "1.0000"
     lastEditDate: "2021-07-21 12:17:01"
     moneyInputId: "1"
     moneyOutputId: "1"
     name: "мойка9"
     outputPercent: "1"
     outputPrice: "1.0000"
     properties: "{\"prop_brand\":\"2\",\"prop_sink_type\":\"1\",\"prop_material\":\"3\",\"prop_model\":\"1\"}"
     sort: "100"
     */

    if (oneElement) {
      form.querySelectorAll('.onlyMany').forEach(n => n.remove());
      f.show(nodeProp);

      initParam(option, ['properties']);
      option.properties && initParam(JSON.parse(option.properties));
      this.initMoneyControl(form, option);
    } else {
      form.querySelectorAll('.onlyOne').forEach(n => n.remove());
      form.querySelector('#properties').addEventListener('change', () => {
        f.show(nodeProp);
        option.properties && initParam(JSON.parse(option.properties));
      });
    }

    this.queryParam.form = form;
    this.queryParam.optionsId = JSON.stringify(id);
    this.M.show('Изменение вариантов', form);
    this.reloadAction = {
      dbAction: 'openElements',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
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

    this.queryParam.id = JSON.stringify(this.id.getSelected());
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
