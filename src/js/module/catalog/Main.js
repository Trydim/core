'use strict';

export class Catalog {
  constructor() {
    this.M = f.initModal();
    this.delayFunc = () => {};

    this.reloadAction = false;
    this.setQueryParam();
    this.setData();
  }

  setQueryParam() {
    this.queryParam = Object.create(null);


  }

  setData() {
    this.db = {
      units: JSON.parse(f.qS('#dataUnits').value),
      money: JSON.parse(f.qS('#dataMoney').value),
    };
    this.setting = {
      elementsCol: f.qS('#elementsColumn').value.split(','),
      optionsCol: f.qS('#optionsColumn').value.split(','),
    };

    Object.defineProperty(this.queryParam, 'form', {
      enumerable: false,
      writable: true,
    });
  }

  setReloadQueryParam() {
    this.queryParam = Object.assign(this.queryParam, this.reloadAction);
    this.reloadAction = false;
  }

  query(param = {}) {
    let {sort = {}} = param,
        queryForm = this.queryParam.form || document.createElement('form');

    let form = new FormData(queryForm);

    form.set('mode', 'DB');

    Object.entries(Object.assign({}, this.queryParam, sort))
          .map(param => form.set(param[0], param[1]));

    this.queryParam.form = false;

    return f.Post({data: form}).then(data => {
      if(this.reloadAction) {
        this.query(this.setReloadQueryParam());
        return;
      }

      return data;
    });


      /*if (data['section']) this.section.appendSection(data['section']);
      if (data['elements']) {
        this.prepareItems(data['elements'], 'elements');
        data['countRowsElements'] && this.pElements.setCountPageBtn(data['countRowsElements']);
      }
      if (data['options']) {
        this.prepareItems(data['options'], 'options');
        data['countRowsOptions'] && this.pOptions.setCountPageBtn(data['countRowsOptions']);
      }
    });*/

  }

  // Bind events
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * @param node
   * @param func
   * @param options
   * @param eventType
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, (e) => func.call(this, e), options);
  }
}
