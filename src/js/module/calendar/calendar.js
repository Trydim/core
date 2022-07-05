'use strict';

import '../../../css/module/calendar/calendar.scss';
import './fullCalendar.min.js';

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
  filterTemplate: `
    <div class="fc-button-group select">
      <select class="select__item fc-today-button fc-button" id="orderFilter">
        <option value="all">Все заказы</option>
        <option value="create">По созданию</option>
        <option value="shipping">По отгрузке</option>
      </select>
    </div>
  `,
  filter: 'all',
  default: {
    height: window.innerHeight * 0.9,
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
      },
      eventContent: (arg) => {
        const order = arg.event.extendedProps.order,
              line = str => `<div>${str}</div>`;

        const lines = [
          `№${order['O.ID']} - ${order['C.name']}`,
          `${Math.round(order.total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} руб / ${order['S.name']}`
        ];
        const html = lines.reduce((acc, el) => acc + line(el), '');

        return {html}
      }
    }));
    this.calendar.setOption('locale', 'ru');

    //calendar.changeView('timeGridDay');

    this.calendar.render();
    //потому что в fullcalendar селектов нет, только кнопки
    f.qS('#calendar>div>div').insertAdjacentHTML('beforeend', component.filterTemplate);
    this.onEvent();
  },

  addOrder(order) {
    this.calendar.addEvent(order);
    return this.calendar;
  },

  // Event function
  // -------------------------------------------------------------------------------------------------------------------

  clickOrder(info) {
    let order = orders.getOrder(info.event['_def'].publicId);
    if(order) {
      order.importantValue = orders.formatImportant(order.importantValue);

      let title = 'Заказ №' + order['O.ID'],
          div   = document.createElement('div'),
          content = orders.template.orderContentBody.outerHTML;

      div.innerHTML = f.replaceTemplate(content, order);
      orders.template.orderContentBtn.dataset.id = order['O.ID'];

      calendar.M.show(title, div);
      calendar.M.btnField.append(orders.template.orderContentBtn);
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

  changeFilter(context, event) {
    //удалить все события
    context.calendar.getEvents().forEach(e => {
      e.remove();
    })
    //устанавливаем новое значение фильтра
    context.filter = event.target.value;
    //очищаем id уже как бы отрисованных
    orders.orderIds.clear();
    //рисуем новые события
    orders.showOrders();
  },

  // Event bind
  // -------------------------------------------------------------------------------------------------------------------

  onEvent() {
    f.qA('#calendar button', 'click', this.changeDateRange.bind(this));
    f.qS('#orderFilter').addEventListener('change', (event) => this.changeFilter(this, event));
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
    let node = f.qS('#ordersStatusValue');
    node && node.innerText && this.setStatus(JSON.parse(node.innerText));
    node && node.remove();

    node = f.qS('#ordersValue');
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
    //console.log(data);
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
    Object.entries(this.data).map(([id, order]) => {
      if (this.orderIds.has(id)) return;
      this.orderIds.add(id);

      const general = {id, order},
            createOrder = {
              color: '#0f9d58',
              allDay: true,
              start: order['createDate']
            },
            shippingOrder = {
              color: '#a52834', //так же заменять цвет в стилях! .fc-daygrid-dot-event
              allDay: false,
              start: order['startShippingDate'],
              end: order['endShippingDate']
            };
      //событие даты заказа
      component.filter !== 'shipping' && component.addOrder(Object.assign(general, createOrder));
      //событие даты отгрузки
      component.filter !== 'create' && component.addOrder(Object.assign(general, shippingOrder));
    });
  },

  formatImportant(value) {
    value = value ? JSON.parse(value.replace(/'/g, '"')) : '';
    return value.reduce ? value.reduce((a, i) => { a += `${i.key}:${i.value}`; return a; }, '') : '';
  },

  onEvent() {
    calendar.M.btnField.append(orders.template.orderContentBtn);
    orders.template.orderContentBtn.onclick = function () {
      let link = f.gI(f.ID.PUBLIC_PAGE),
          query = 'orderId=';
      link.href += '?' + query + this.dataset.id;
      link.click();
    };
  },
}

const calendar = {
  M: new f.initModal({showDefaultButton: false}),

  init() {
    orders.init();
    component.init();
    orders.showOrders();

    return this;
  }
}

window.CalendarInstance = calendar.init();
