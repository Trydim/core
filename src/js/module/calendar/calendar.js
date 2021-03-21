'use strict';

import {FullCalendar} from './fullCalendar.js';

/*const importLocale = async (locale) => {
  try {
    let importModule = await new Promise((resolve, reject) => {
      import(`./locales/${locale}.js`)
        .then(module => resolve(module[moduleName]))
        .catch(err => reject(err));
    });
    return importModule.init(data) || false;
  } catch (e) { console.log(e.message); return false; }
}*/

const component = {
  default: {
    initialView  : 'dayGridMonth', // Вид по умолчанию dayGridMonth timeGridWeek timeGridDay
    firstDay     : 1, // Первый день в календаре 0 воскр 1 понедельник...
    slotMinTime: '0:00:00',
    slotMaxTime: '24:00:00',
    headerToolbar: { // Кнопки по умолчанию сверху
      left  : 'prev,next today',
      center: 'title',
      right : 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    footerToolbar: { // Кнопки по умолчанию сверху
      left  : 'prev,next today',
      center: 'title',
      right : 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    customButtons: { // Кнопки по умолчанию
      myCustomButton: {
        text : 'Своя кнопка',
        click: function () {
          alert('clicked the custom button!');
        }
      }
    },

    selectable: true,
    displayEventTime: false,

    /*eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      //second: false, //'2-digit',
      meridiem: false
    },*/

    // И как это связать с настройками добавить цвета
    eventClassNames: (arg) => orders.status.call(orders, arg),

    buttonText: {
      today: "Сегодня",
      month: "Месяц",
      week : "Неделя",
      day  : "День",
      list : "Повестка дня"
    },

    allDayText: 'Весь день',
  },

  form: new FormData(),
  queryParam: {
    mode        : 'DB',
    tableName   : 'orders',
    dbAction    : 'loadOrders',
    countPerPage: 1000,
  },

  //$db->loadOrder(0, 1000,	'last_edit_date', false, $dateRange);

  init() {
    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1].toString());
    })

    //let locale = await f.importModuleFunc();
    let node = f.qS('#calendar');

    this.calendar = new FullCalendar.Calendar(node, Object.assign(this.default, {
      dateClick: (info) => { // клик по дате
      },
      select: function (info) { // выделение
      },
      //events: [],
      eventClick: this.clickOrder,
      eventMouseEnter: function(info) {
        /*console.log('Event: ' + info.event.title);
        console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
        console.log('View: ' + info.view.type);*/
      }
    }));
    this.calendar.setOption('locale', 'ru');

    //calendar.changeView('timeGridDay');

    this.calendar.render();
    this.onEvent();
  },

  addOrder(order) {
    this.calendar.addEvent(order);
    return this.calendar;
  },

  // Event function
  // -------------------------------------------------------------------------------------------------------------------

  /*O.ID: "16"
   S.name: "Заказ сформирован"
   create_date: "2020-09-11 14:38:52"
   customer: "quest"
   important_value: "[{"key":"Сумма","fieldName":"total","value":72901.73724000002}]"
   last_edit_date: "2020-09-02 14:38:52"
   name: "admin"*/
  clickOrder(info) {
    let order = orders.getOrder(info.event['_def'].publicId);
    if(order) {
      order.important_value = orders.formatImportant(order.important_value);

      let title = 'Заказ №' + order['O.ID'],
          div   = document.createElement('div'),
          content = orders.template.orderContentBody.outerHTML;

      div.innerHTML = f.replaceTemplate(content, order);
      orders.template.orderContentBtn.dataset.id = order['O.ID'];

      calendar.M.show(title, div);
    }
  },

  changeDateRange(e) {
    let target = e.target, y, m, d, queryRange = [],
        range = this.calendar.currentData.dateProfile.renderRange;

    if ((new Date()).getTime() < range.start.getTime()) return;

    f.setLoading(target);

    y = range.start.getFullYear();
    m = range.start.getMonth() + 1;
    d = range.start.getDate();
    queryRange.push(`${y}-${m}-${d} 00:00:01`);

    y = range.end.getFullYear();
    m = range.end.getMonth() + 1;
    d = range.end.getDate();
    queryRange.push(`${y}-${m}-${d} 23:59:59`);

    this.form.set('dateRange', JSON.stringify(queryRange));

    f.Post({data: this.form}).then(data => {
      f.removeLoading(target);
      orders.setOrders(data['orders']);
      orders.showOrders();
    });
  },

  // Event bind
  // -------------------------------------------------------------------------------------------------------------------

  onEvent() {
    f.qA('#calendar button', 'click', this.changeDateRange.bind(this));
  }
}

const orders = {
  data: Object.create(null),
  orderIds: new Set(),

  template: {
    orderContentBody: f.gTNode('#orderTemplate'),
    orderContentBtn: f.gTNode('#orderBtnTemplate'),
  },

  init() {
    let node = f.gI('ordersStatusValue');
    node && node.innerText && this.setStatus(JSON.parse(node.innerText));
    node && node.remove();

    node = f.gI('ordersValue');
    node && node.innerText && this.setOrders(JSON.parse(node.innerText));
    node && node.remove();

    this.onEvent();
  },

  setOrders(orders) {
    orders.map(i => this.data[i['O.ID']] = i);
  },

  getOrder(id) {
    return this.data[id] || false;
  },

  setStatus(data) {
    console.log(data);
    this.getStatusClass = function (status) {
      /*switch (arg.event._def.extendedProps.status) {
       case "fulfilled": return 'myClass1';
       case "ok": return 'myClass2';
       case "rejected":
       default: return 'myClass3';
       }*/
    };
  },

  status(arg) {
    this.getStatusClass(arg.event._def.extendedProps.status);
  },

  showOrders() { // TODO привязать к настройкам
    Object.entries(this.data).map(o => {
      if (this.orderIds.has(o[0])) return;
      this.orderIds.add(o[0]);

      let title, temp;

      //o[1].important_value && (temp = this.formatImportant(o[1].important_value));

      title = o[0] + ' / ' + o[1].total + ' руб.';
      //title += temp;

      // Мой статус для цвета кружка
      component.addOrder({id: o[0], title, start: o[1]['create_date'], status: 'ok'});
    })
  },

  formatImportant(value) {
    value = value ? JSON.parse(value.replace(/'/g, '"')) : '';
    return value.reduce ? value.reduce((a, i) => { a += `${i.key}:${i.value}`; return a; }, '') : '';
  },

  onEvent() {
    orders.template.orderContentBtn.onclick = function () {
      let link = f.gI(f.ID.PUBLIC_PAGE),
          query = 'orderId=';
      link.href += '?' + query + this.dataset.id;
      link.click();
    };
  },
}

export const calendar = {
  M: f.initModal({showDefaultButton: false}),

  init() {
    orders.init();
    component.init();
    orders.showOrders();

    return this;
  }
}
