'use strict';

import {Common} from "./Main";

export class Options extends Common {
  constructor(props) {
    super('options', props);

    const field = f.qS(`#${this.type}Field`);

    this.queryParam.tableName = 'options_elements';
    this.setNodes(field, props.tmp);

    this.setFileModal();
    this.paginator = new f.Pagination(`#${this.type}Field .pageWrap`,{
      dbAction : 'openElement',
      sortParam: this.sortParam,
      query    : action => this.query(action).then(d => this.load(d)),
    });
    this.id = new f.SelectedRow({table: this.node.fieldT});

    f.observer.subscribe(`openElement`, d => this.open(d));
    f.observer.subscribe(`sortEvent`, d => this.load(d));
    this.onEvent();
  }

  setFileModal() {
    this.fModal = f.initModal({ /*template: f.*/ });
  }
  open(id) {
    this.queryParam.elementsId = id;
    this.queryParam.dbAction = 'openElement';
    this.query().then(d => this.load(d));
  }
  load(data) {
    f.hide(this.node.field);
    this.id.clear();
    data['options'] && this.prepareItems(data['options']);
    data['countRowsOptions'] && this.paginator.setCountPageBtn(data['countRowsOptions']);
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
  }


  clearFiles(node) {
    let input = document.createElement('input');
    input.type = 'file';
    node.files = input.files;
  }
  getFileTemplate(file, i) {
    return `<div class="attach__item ${file.fileError ? this.cssClass.error : ''}">
        <span class="bold">${file.name}</span>
        <span class="table-basket__cross"
              data-id="${i}"
              data-action="removeFile"></span></div>`;
  }
  showFiles(fileField) {
    let html = '';

    Object.entries(this.queryFiles).forEach(([i, file]) => {
      html += this.getFileTemplate(file, i);
    });

    fileField.innerHTML = html;
  }
  initChooseFile(form) {
    const inputN = form.querySelector('input[type="file"]'),
          fileField = form.querySelector('#fileField'),
          btnN = form.querySelector('[name="chooseFile"]'),
          data = new FormData();

    inputN.addEventListener('change', () => {
      for (const file of Object.values(inputN.files)) {
        let id = Math.random() * 10000 | 0;

        file.fileError = file.size > 1024*1024;
        //if (file.fileError && !error) error = true;

        this.queryFiles[id] && (id += '1');
        this.queryFiles[id] = file;
      }
      this.clearFiles(inputN);
      this.showFiles(fileField);
    })

    data.set('mode', 'DB');
    data.set('dbAction', 'loadFiles');

    btnN.addEventListener('click', () => {
      f.Post({data}).then(data => {
        debugger
        this.fModal.show('Выбор файлов');
      })
    });
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  // Добавить вариант
  createOption() {
    let form = this.tmp.form.cloneNode(true);
    form.querySelectorAll('.onlyMany').forEach(n => n.remove());
    f.show(form.querySelector('[data-field="property"]'));

    this.initMoneyControl(form);
    this.initChooseFile(form);

    this.queryParam.form = form;
    this.M.show('Добавить вариант', form);
    form.querySelector('[name="name"]').focus();
    this.reloadAction = {
      dbAction: 'openElement',
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

    let nodeProp = form.querySelector('[data-field="property"]');

    if (oneElement) {
      form.querySelectorAll('.onlyMany').forEach(n => n.remove());
      f.show(nodeProp);

      initParam(option, ['property']);
      option.property && initParam(JSON.parse(option.property));
      this.initMoneyControl(form, option);
      //this.initImages(form, option.images);
      this.initChooseFile(form);
    } else {
      const node = form.querySelector('#property');
      node.addEventListener('change', () => {
        f.show(nodeProp);
        option.property && initParam(JSON.parse(option.property));
        node.remove();
      }, {once: true});

      form.querySelectorAll('.onlyOne').forEach(n => n.remove());
    }

    this.queryParam.form = form;
    this.queryParam.optionsId = JSON.stringify(id);
    this.M.show('Изменение вариантов', form);
    this.reloadAction = {
      dbAction: 'openElement',
      callback: data => {
        this.id.clear();
        this.load(data);
      },
    };
  }
  // Копировать вариант
  copyOption() {
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
    this.reloadAction = {dbAction: 'openElement'};
  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.node.field.addEventListener('click', e => this.commonEvent(e));
  }
}