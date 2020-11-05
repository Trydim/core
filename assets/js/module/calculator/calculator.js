'use strict';

import {f} from '../../main.js';

class List {
  data = Object.create(null);

  constructor(id) {
    let node = f.gI(id),
        json = JSON.parse(node.value);

    node.remove();
    Object.values(json).map((i, index) => {
      let idKey = Object.values(i)[0];
      if (this.data[idKey]) idKey += index.toString();
      this.data[idKey] = i;
    })
  }

  get(id) {
    return this.data[id] ||
      this.data[this.pref + id] ||
      {
        id   : id,
        name : 'Not found ' + id,
        size : 0,
        value: 0
      };
  }

  setPref(str) {
    this.pref = str;
  }
}

const price      = (id) => Object.assign({}, calculator.price.get(id));
const config     = (id) => Object.assign({}, calculator.config.get(id));

//Перенести
const checkInputValue = (input, value) => {
  let min = input.getAttribute('min'),
      max = input.getAttribute('max');

  if (min && value < +min) return +min;
  if (max && value > +max) return +max;

  return +value;
}

//Перенести
/*
const getSelectText = (id) => {
  let s;
  if (typeof id === 'string') s = document.getElementById(id);
  else s = id;
  return s && s.selectedIndex !== -1 ? s.options[s.selectedIndex].innerText : 'notNode';
};*/
const getInputCheckedText = (name) => {
  let s;
  if (typeof name === 'string') s = document.querySelector(`input[value="${name}"]`);
  if (s && s.id) {
    s = document.querySelector(`label[for="${s.id}"]`);
    if (s) return s.innerText.trim();
  }
  return 'Not fount input' + name;
};

// TODO Отчет перенести
//----------------------------------------------------------------------------------------------------------------------

const Report = () => {
  let r = Object.create(null);

  r.addCustom = function (item) {
    this.report[this.curListCus].push(item);
  }

  // TODO перенести параметр name, куда-нить
  r.add = function (name = '', element = {}, count = 1, rClass = '') {

    let item = Object.create(null);
    item.id  = element.id || '';
    item.name  = name || element.name || '';
    item.unit  = element.unit || '';
    item.count = count = +(count.toFixed(2));
    element.dontAddTotal && (item.dontAddTotal = true);
    item.value = element.value || 0;

    item.total     = element.value * count;
    item.nodeClass = rClass;

    this.report[this.curList] || (this.report[this.curList] = []);
    this.report[this.curList].push(item);
  };

  r.delCustom = function (id, subListCode = 'base') {
    this.report[subListCode] = this.report[subListCode].filter(i => i.id !== id);
  }

  r.clear = function () {
    this.report        = Object.create(null);
    this.report.custom = [];
    this.subList       = Object.create(null);
    this.subList.base  = Object.assign(Object.create(null), {name: '', sTotal: 0});
    this.global        = Object.create(null);

    this.curList    = 'base';
    this.curListCus = 'custom';

    this.total = 0;
    this.bruto = 0;

    this.pipe = Object.create(null);
  }

  r.createSubList = function (code, name, className = '') {
    //if(this.subList[code]) throw new Error('Sub List exist!');

    this.subList[code] = Object.assign(Object.create(null), {name, className, sTotal: 0});
    this.curList       = code;
  }
  r.createCustomSubList = function (code) {
    this.report[code] = [];
    this.curListCus   = code;
  }

  r.setSubList       = function (code) {
    if (this.subList[code]) this.curList = code;
    /* else return; Возможно искать по имени */
  }
  r.setCustomSubList = function (code) {
    if (this.report[code]) this.curListCus = code;
    /* else return; Возможно искать по имени */
  }

  r.sumReport = function () {
    this.total = 0;

    Object.entries(this.report).map(list => {
      let [curList, item] = list;

      if (!this.subList[curList]) return;
      this.subList[curList].sTotal = 0;

      item.map(i => {
        if (i['dontAddTotal'] || !i.total) return;

        this.subList[curList].sTotal += i.total;
        this.total += i.total;
      });
    });
  }

  /**
   * @param config {object} -
   *    showSubListName {bool} - Показывать в отчете название подгруппы
   *    showZeroCount {bool} - Показывать позиции если количество 0
   */
  r.showTotal = function (config = {}) {
    let html     = '';
    let listName = config['showSubListName'] || false;

    this.sumReport();

    Object.entries(this.report).map(i => {
      if (typeof i[1] === 'object' && !Object.values(i[1]).length) return;
      if ((Array.isArray(i[1]) && !i[1].length) || i[0] === 'custom') return;

      if (listName) { // вывод названия подгруппы
        let list = this.subList[i[0]];
        html += `<tr class="${list.className}"><td>${list.name}</td>${'<td></td>'.repeat(5)}</tr>`;
      }

      i[1].map(tr => { // вывод содержимого подгруппы
        html += `<tr class="${tr.nodeClass}" data-id="${tr.id}"><td>${tr.name}</td>` +
          `<td>${tr.value}</td><td>${tr.count}</td><td>${tr.total.toFixed(1)}</td></tr>`;
      });
    })

    f.gI('tbody').innerHTML    = html;
    f.gI('total').innerHTML    = 'Итого: ' + (+this.total).toFixed(0);

    calculator.onEventCustom();
  };

  r.setReport         = function (report) {
    typeof report === 'object' && (this.report = report.report);
    typeof report === 'object' && (this.subList = report.subList);

    /* Только навесы */
    Object.values(this.report).map(list => {
      list.map(i => {
        if (i.nodeClass === 'custom') calculator.addCustom(i, false);
      });
    });
    /* Только навесы */
  }
  r.getReport         = function () {
    return {report: this.report, subList: this.subList, global: this.global};
  }
  r.setImportantValue = function (report) {
    !report.length && (report = [report]);
    typeof report === 'object' && report.map(i => this[i.fieldName] = i.value);
  }
  // Важные значений калькулятора
  r.getImportantValue = function () {
    return {key: 'Другие поля', fieldName: 'total', value: this.total.toFixed(2)};
  }
  return r;
};

// Customers list for search
//----------------------------------------------------------------------------------------------------------------------

const customers = {
  data: [],
  searchData: Object.create(null),

  init(form) {
    this.form = form;
    this.node = form.querySelector('input[name="search"]');
    this.searchComponent = f.searchInit();

    this.searchComponent.init({
      node: this.node,
      searchData: this.searchData,
      finishFunc: this.applyFound.bind(this),
      showResult: this.showResult.bind(this),
    });
  },

  setData(form) {
    if(Object.values(this.data).length
      && Object.values(this.searchData).length) this.init(form);

    let data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'loadCustomers');
    data.set('countPerPage', '1000');

    f.Post({data}).then(data => {
      data['customers'] && this.prepareSearchData(data['customers']);
      this.init(form);
    });
  },

  prepareSearchData(data) {
    this.data = data.reduce((r, i) => {
      !i['ITN'] && (i.ITN = '');
      i.contacts = JSON.parse(i.contacts);
      delete i.orders; //i['C.ID']

      this.searchData[i['C.ID']] = [i.name, i.ITN, Object.values(i.contacts)]
        .join('').replace(/ |-|_|\(|\)|@/g, '');

      r[i['C.ID']] = i;
      return r;
    }, Object.create(null));
  },

  applyFound(index) {
    let result = this.data[index];
    let customerChangeNode = this.form.querySelector('#customerChange'),
        changeEvent = (n) => {
          let changeBool = this.form.querySelector('input[name="changeBool"]');
          n.dispatchEvent(new Event('blur'));
          n.addEventListener('input', () => {
              f.show(customerChangeNode);
              changeBool.value = true;
            },
            {once: true});
        }

    f.hide(customerChangeNode);

    this.form.querySelectorAll('input').forEach(n => {
      switch (n.name) {
        case 'C.ID': n.value = result['C.ID']; changeEvent(n); return;
        case 'name': n.value = result.name; changeEvent(n); return;
        case 'phone': n.value = result.contacts.phone; changeEvent(n); return;
        case 'email': n.value = result.contacts['email']; changeEvent(n); return;
        case 'address': n.value = result.contacts['address']; changeEvent(n); return;
        case 'ITN':
          if (result['ITN']) this.form.querySelector('input[value="b"]').click();
          else this.form.querySelector('input[value="i"]').click();
          n.value = result['ITN'];
          changeEvent(n); return;
      }
    });
  },

  showResult(node, resultIds) {
    if (!resultIds.length) return;

    node.innerHTML = resultIds.reduce((r, id) => {
      let i = this.data[id];
      r += `<div class="p-2" data-id="${i['C.ID']}">${i.name} ${i.ITN} ${Object.values(i.contacts).join(' ')}</div>`;
      return r;
    }, '');
  }
}

// Event function
//----------------------------------------------------------------------------------------------------------------------

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

const inputCmsClick = function (e) {
  let target = e.target,
      action = this.getAttribute('data-action'),
      query  = true,
      data   = new FormData(),
      cpNumber = +f.gI('orderNum').dataset.order;

  calculator.rFront.global.cpNumber = cpNumber ? cpNumber : false;

  f.setLoading(target);

  data.set('dbAction', action);

  let select = {
    'savePdf': () => {
      data.set('mode', 'docs');
      data.set('docType', 'pdf');
      data.set('reportVal', JSON.stringify(calculator.rFront.getReport()));
    },
    'printReport': async () => {
      let p    = f.initPrint(),
          type = target.dataset.type;

      p.print(await f.printReport(type,
        calculator.rFront.report.custom,
        calculator.rFront.global.cpNumber));
      f.removeLoading(target);
      query = false;
    },
  }

  select[action]();

  query && f.Post({data}).then(data => {
    f.removeLoading(target);
    if (data['pdfBody']) f.savePdf(data);
  });
}

const btnAddCustomPosition = () => {
  calculator.M.show('', f.gTNode('addPositionTmp'));
  calculator.onAddPositionEvent();
}

// Окно сохранения заказа
const btnSaveOrder = () => {
  let form = f.gTNode('sendMailTmp');
  form.querySelector('.modalT').innerHTML = 'Сохранить заказ';

  if (calculator.loadClient) {
    customers.init(form);
    applyFound(form, calculator.loadClient);
  } else customers.setData(form);

  calculator.M.show('', form);
  calculator.M.bindBtn();

  f.relatedOption();
  f.initValid(saveOrder);
}

// Сохранение заказа
const saveOrder = (AuthForm, finish) => {
  let sendForm = new FormData(AuthForm),
      calcForm = new FormData(calculator.form),
      saveVal  = Object.create(null),
      report   = {
        rFront: calculator.rFront.getReport(),
      };

  for (let i of calcForm.entries()) {
    saveVal[i[0]] = i[1];
  }

  if (+sendForm.get('changeBool') === 0) {
    sendForm.delete('changeBool');
    sendForm.delete('customerChange');
  }

  sendForm.set('mode', 'DB');
  sendForm.set('dbAction', 'saveOrder');
  sendForm.set('saveVal', JSON.stringify(saveVal));
  sendForm.set('importantVal', JSON.stringify(calculator.rFront.getImportantValue()));
  sendForm.set('orderTotal', JSON.stringify(calculator.rFront.total));
  sendForm.set('reportVal', JSON.stringify(report));

  f.Post({data: sendForm}).then(data => {
    if (data['status'] && data['orderID']) {
      let node = f.gI('orderNum')
      node.innerHTML = data['orderID'];
      node.dataset.order = data['orderID'];
      f.show(node.parentNode);
      f.showMsg('Заказ сохранен №' + data['orderID']);
      finish();
      calculator.M.hide();
    }
  })
}

// Окно Отправка почты
const btnSendMail = () => {
  let form = f.gTNode('sendMailTmp');
  form.querySelector('.modalT').innerHTML = 'Отправка почты';
  //form.querySelector('#btnConfirmSend').innerHTML = 'Отправить';

  form.querySelector('.saveOrderField').remove();
  calculator.M.show('', form);
  calculator.M.bindBtn();

  f.initValid(sendMail);
}

// Отправка почты
const sendMail = (form, finish) => {
  let data = new FormData(form);
  data.set('mode', 'docs');
  data.set('docType', 'mail');
  data.set('reportVal', JSON.stringify(calculator.rFront.getReport()));

  f.Post({data}).then(data => {
    if (data['status']) {
      f.showMsg(/*data['mail'].message +*/ 'ok', data['mail'].status ? 'success' : 'error');
      finish();
      calculator.M.hide();
    }
  })
}

// Event bind
//----------------------------------------------------------------------------------------------------------------------

const onUIEvent = () => {
  f.qA('button.inputChange', 'click', inputBtnChangeClick); // Кнопки изменения значения в input.number
  f.qA('input[type="number"]', 'blur', inputBlur); // Проверка значения на минимум максимум
  //f.gI('btnOpenModal').addEventListener('click', btnAddCustomPosition);
  f.gI('btnSendMailModal').addEventListener('click', btnSendMail);

  let node = f.gI('saveOrderModal');
  node && node.addEventListener('click', btnSaveOrder);

  // CMS event
  f.qA('input[data-action], button[data-action]', 'click', inputCmsClick);

  // Dev event
  f.DEBUG && f.gI('devOn').addEventListener('click', () => {
    document.head.insertAdjacentHTML('beforeend', '<style>* {margin: 0!important; padding: 0!important;}</style>');
  });
}

export const calculator = {
  M     : f.initModal(),
  rFront: Report(), // Отчет для сайта
  form  : f.gI('formParam'),

  price: Object.create(null),
  config: Object.create(null),

  param: null,

  init() {
    this.price  = new List('dataPrice');
    this.config = new List('dataConfig');
    this.onEvent();
    this.loadOrder() || (f.DEBUG && test());
  },

  // Загрузка заказа
  loadOrder() {
    let node = f.gI('orderSaveValue'), value;

    if (node && node.value) {
      value = JSON.parse(node.value);
      node.remove();

      const number      = (n, value) => n.value = value;
      const checkbox    = (n) => {
        n.checked = true;
        n.dispatchEvent(new Event('change'));
      }
      const radio       = (n, value) => {
        if (!n.forEach) n = f.qA(`input[name="${n.name}"]`);

        for (let i of n) {
          if (i.value === value) {
            i.checked = true;
            i.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
      const inputSelect = () => {}
      const textarea    = () => {}

      const select = {number, radio, checkbox};

      Object.entries(value).map(item => {
        /* ТОЛЬКО ДЛЯ НАВЕСОВ */
        if (item[0] === 'width') w = Math.ceil(+item[1]);
        if (item[0] === 'length') s = Math.ceil(+item[1] / 2.1);
        /* ТОЛЬКО ДЛЯ НАВЕСОВ */

        let n = f.qS(`input[name="${item[0]}"]`);
        if (n) {
          select[n.type](n, item[1]);
          return;
        }
        n = f.qS(`select[name="${item[0]}"]`);
        if (n) {
          inputSelect(n, item[1]);
          return
        }
        n = f.qS(`textarea[name="${item[0]}"]`);
        if (n) {
          textarea(n, item[1]);
        }
      });

    } else return false;

    node = f.gI('orderReport');
    if (node && node.value) {
      value = JSON.parse(node.value);
      node.remove();

      value.rFront && this.rFront.setReport(value.rFront);
    }
    node = f.gI('orderImportantValue');
    if (node && node.value) {
      value = JSON.parse(node.value);
      node.remove();
      this.rFront.setImportantValue(value);
    }

    node = f.gI('customerLoadOrders');
    if (node && node.value) {
      this.loadClient = JSON.parse(node.value);
      this.loadClient.contacts = JSON.parse(this.loadClient.contacts || '{}');
      node.remove();
    }

    this.rFront.showTotal();
  },

  // Event calc function
  // -------------------------------------------------------------------------------------------------------------------

  clickAddCustomPosition() {
    let form = new FormData(f.gI('addPositionForm')),
        data = Object.create(null);

    for (let i of form.entries()) {
      if (i[0] === 'name' && !i[1]) return;
      data[i[0]] = i[1];
    }

    this.addCustom(data);
    this.M.hide();
  },

  clickBtnCalc() {
    let form = new FormData(this.form);

    this.param = Object.create(null);
    for (let i of form.entries()) {
      this.param[i[0]] = i[1];
    }

    this.calc();

    let node = f.gI('btnField');
    node && !this.printField && (this.printField = true) && node.dispatchEvent(new Event('showBtnField'));
  },

  showBtnField(e) {
    f.show(e.target);
  },

  // Event calc bind
  // -------------------------------------------------------------------------------------------------------------------

  onEvent() {
    f.gI('btnCalc').addEventListener('click', (e) => this.clickBtnCalc(e));

    onUIEvent();

    let node = f.gI('btnField');
    node && node.addEventListener('showBtnField', this.showBtnField, {once: true});
  },

  onAddPositionEvent() {
    // Инициализировать кнопку
    this.M.bindBtn();
    // Добавить позицию
    f.gI('btnAddPosition').addEventListener('click', () => this.clickAddCustomPosition());
  },

  onEventCustom() {
    /*this.removeBtn || (this.removeBtn = getTNode('customPositionRemove'));

    f.qA('#tbody tr.custom').forEach(tr => {
      let node = this.removeBtn.cloneNode(true);
      node.querySelector('button').onclick = () => this.delCustom(tr);
      tr.append(node);
    });*/
  },

  // Custom Position
  //----------------------------------------------------------------------------------------------------------------------

  custom   : Object.create(null),
  removeBtn: null,

  addCustom(data, showTotal = true) {
    let id          = data.id || ((Math.random() * 10000) | 0);
    data            = Object.assign({id}, data);
    this.custom[id] = data;
    showTotal && this.rFront.add('Дополнительно', data, +data.count, data['coeff'], 'custom');
    showTotal && this.rFront.showTotal();
  },

  delCustom(tr) {
    let id = +tr.getAttribute('data-id');
    this.custom[id] && (delete this.custom[id]);
    this.rFront.delCustom(id);
    this.rFront.showTotal();
  },

  getCustom() {
    Object.values(this.custom).map(i => {
      this.rFront.add('Дополнительно', i, +i.count, i['coeff'], 'custom');
    });
  },

  // Event calculator
  //--------------------------------------------------------------------------------------------------------------------

  calc() {
    let rFront       = this.rFront,
        w            = +this.param.width,
        l            = +this.param.length,
        configI, count, element;

    rFront.clear();

    rFront.addCustom(['Ширина', '', 'м', w]);
    rFront.addCustom(['Длина', '', 'м', l]);

    //Наценка
    configI = config('margin');
    rFront.addCustom(['Наценка', '', 'м', configI.value]);

    count = w * l;
    //rFront.add('Цена', price('square'), count);

    rFront.createSubList('total', 'Сумма');
    element = price('square');
    //element.dontAddTotal = true;
    element.value *= ((configI.value / 100) + 1);
    rFront.add('Итого с наценкой', element, count);

    rFront.createSubList('delivery', 'Доставка');
    rFront.add('Доставка', price('delivery' + w), +this.param['delivery']);

    //this.getCustom();
    rFront.showTotal();
  },

};

const test = () => {
  f.gI('btnCalc').click();
}
