'use strict';

import {FullCalendar} from './main.js';

// TODO click custom btn
const clickCustomBTN = () => {
  alert('clicked the custom button!');
}

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

    buttonText: {
      today: "Сегодня",
      month: "Месяц",
      week : "Неделя",
      day  : "День",
      list : "Повестка дня"
    },
  },

  init() {
    //let locale = await f.importModuleFunc();

    this.calendar = new FullCalendar.Calendar(f.gI('calendar'), Object.assign(this.default, {
      selectable: true,
      dateClick: (info) => { // клик по дате
        this.calendar.getEventById('123');
        //alert('Date: ' + info.dateStr);
      },
      select: function (info) { // выделение
        //alert('Date: ' + info.startStr + info.endStr);
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

  },

  addOrder(order) {
    this.calendar.addEvent(order);
    return this.calendar;
  },

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

      let title   = 'Заказ №' + order['O.ID'],
          content = f.replaceTemplate(orders.tmp, order),
          div = document.createElement('div');

      div.innerHTML = content;
      div
      calendar.M.show(title, div);
    }

  },

  //clickInput
}

const orders = {
  data: Object.create(null),

  init() {
    this.initOrders();
    this.tmp || (this.tmp = f.gT('orderTemplate'));
  },

  initOrders() {
    let node = f.gI('ordersValue');
    if(node && node.innerText) {
      this.setOrders(JSON.parse(node.innerText));
    }
  },

  setOrders(orders) {
    orders.map(i => this.data[i['O.ID']] = i);
    this.showOrders();
  },

  getOrder(id) {
    return this.data[id] || false;
  },

  showOrders() {
    Object.entries(this.data).map(o => {
      let item, title, temp;

      o[1].important_value && (temp = this.formatImportant(o[1].important_value));

      title = o[0] + ' ';
      title += temp;

      item = { id: o[0], title, start: o[1]['create_date'] };

      component.addOrder(item);
    })
  },

  formatImportant(value) {
    value = JSON.parse(value.replace(/'/g, '"'));
    return value.reduce ? value.reduce((a, i) => { a += `${i.key}:${i.value}`; return a; }, '') : '';
  },
}

export const calendar = {
  M: f.initModal(),

  init() {
    component.init();
    orders.init();

    return this;
  }
}
