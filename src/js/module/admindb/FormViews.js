"use strict";

const checkInputValue = (input, value) => {
  let min = input.getAttribute('min'),
      max = input.getAttribute('max');

  if (min && value < +min) return +min;
  if (max && value > +max) return +max;

  return +value;
}

const inputBtnChangeClick = function (e) {
  e.preventDefault();
  let targetName = this.getAttribute('data-input'),
      target     = f.qS('input[name="' + targetName + '"'),
      change     = this.getAttribute('data-change');

  if (target) {
    let match    = /[?=\.](\d+)/.exec(change),
        fixCount = (match && match[1].length) || 0,
        value    = checkInputValue(target, (+target.value + +change).toFixed(fixCount));
    target.value = value.toFixed(fixCount);
    target.dispatchEvent(new Event('change'));
  }
};

const inputBlur = function () {
  this.value = checkInputValue(this, +this.value);
};

export const FormViews = {
  init() {
    this.relTarget = Object.create(null);

    this.formN  = f.gTNode('#FormViesTmp');
    this.rowN   = f.gTNode('#FormRowTmp');
    this.paramN = f.gTNode('#FormParamTmp');

    this.csv = this.queryResult['csvValues'];
    this.xml = this.prepareDataXml();

    this.setParam();
    if (this.cell.id === undefined) f.showMsg('Ключи таблицы не обнаружены', 'error');
    this.render();
    this.onEvent();
  },

  checkRelation(params) {
    params.forEach(param => {
      const attr = param['@attributes'],
            type = attr && attr.type;
      if (['select', 'checkbox'].includes(type) && attr.relTarget) {
        this.relTarget[attr.relTarget] = attr.relativeWay;
      }
    })
  },
  checkValue(value) {
    return !(value === '0' || !value);
  },

  prepareDataXml() {
    return Object.values(this.queryResult['XMLValues'].row).reduce((r, row) => {
      const id = row['@attributes'].id;
      row.params = Array.isArray(row.params.param)
                   ? row.params.param
                   : Object.values(row.params);
      this.checkRelation(row.params);
      r[id] = row;
      return r;
    }, {});
  },
  // Определение индексов столбцов по их назначению this.cell
  setParam() {
    const params = Object.values(this.xml)[0].params;
    this.cell = Object.create(null);

    for (let i = 0; i < 3; i++) {
      this.csv[i].forEach((cell, i) => {
        if (cell.match(/(id|key)/i)) this.cell.id = i;
        else {
          let find = params.find(p => p.key === cell);
          find && (this.cell[find.key] = i);
        }
      });

      if (Object.values(this.cell).length) break;
    }
  },

  // Добавление параметров записи
  setRowParam(rowNode, row, config, rowIndex) {
    const params = config.params,
          paramField = rowNode.querySelector('[data-field="params"]'),
          paramItems = this.paramN;

    if (!params) return;

    params.forEach(param => {
      let index = this.cell[param.key],
          paramAttr = param['@attributes'],
          paramItem = paramItems.querySelector(`[data-type="${paramAttr.type}"]`).cloneNode(true),
          input = paramItem.querySelector('input, select'),
          node;

      switch (paramAttr.type) {
        default:
        case 'string': break;
        case 'number':
          input.name += Math.random() * 1000 | 0;
          input.min = paramAttr.min || 0;
          input.max = paramAttr.max || 1000000000;

          let step = paramAttr.step || 1;
          node = paramItem.querySelector('.actionMinus');
          node.dataset.change = (step * -1).toString();
          node.dataset.input = input.name;

          node = paramItem.querySelector('.actionPlus');
          node.dataset.change = step;
          node.dataset.input = input.name;
          break;
        case 'simpleList':
          input.innerHTML = JSON.parse(paramAttr.values).map(i => `<option value="${i}">${i}</option>`);
          break;
        case 'relationTable':
          break;
        case 'checkbox':
          paramAttr.relTarget && (input.dataset.target = paramAttr.relTarget);
          input.checked = this.checkValue(row[index]) || false;
          break;
      }

      input.dataset.col = index;
      input.dataset.row = rowIndex;
      input.value = row[index] || '';

      paramField.append(paramItem);
    });
  },

  // Сборка и вывод формы
  render() {
    let form = this.formN,
        cell = this.cell;

    this.csv.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;

      const rowNode = this.rowN.cloneNode(true),
            id = row[cell.id],
            config = this.xml[id] || false;

      rowNode.id = id;

      this.relTarget[id] && rowNode.classList.add(id);

      if (config) {
        config.description && (rowNode.querySelector('[data-field="description"]').innerHTML = config.description);
        this.setRowParam(rowNode, row, config, rowIndex);
      } else if (row.join('') !== '') {
        rowNode.classList.add('font-weight-bold');
        rowNode.innerHTML = '<div>' + row.join('</div><div>') + '</div>';
      } else return;

      form.append(rowNode);
    });

    f.relatedOption(form);

    form.querySelectorAll('button.inputChange').forEach(n => n.addEventListener('click', inputBtnChangeClick));
    form.querySelectorAll('input[type="number"]').forEach(n => n.addEventListener('blur', inputBlur));
    form.querySelectorAll('input').forEach(n => n.addEventListener('change', (e) => this.changeInputForm(e)));
    //form.addEventListener('change', (e) => this.changeInputForm(e));
    this.mainNode.append(form);
    // Пока любой клик
    this.mainNode.addEventListener('click', () => this.enableBtnSave());
  },

  // DB event function
  //--------------------------------------------------------------------------------------------------------------------

  changeInputForm(e) {
    let target = e.target,
        col = target.dataset.col,
        row = target.dataset.row;

    if (!col || !row) { console.warn(e.target + 'index error'); return; }

    this.csv[row][col] = target.value;
  },

  save() {
    const data = new FormData();

    data.set('mode', 'DB');
    data.set('dbAction', 'saveTable');
    data.set('tableName', this.tableName);
    data.set('csvData', JSON.stringify(this.csv));

    f.Post({data}).then(data => {
      f.showMsg(data['status'] ? 'Сохранено' : 'Произошла ошибка!');
      this.disableBtnSave();
    });
  },

  // DB event bind
  //--------------------------------------------------------------------------------------------------------------------

  onEvent() {
    this.btnSave.addEventListener('click', () => this.save());
  }
}
