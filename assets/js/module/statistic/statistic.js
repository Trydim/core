'use strict';

import {CanvasJSModule as CanvasJS} from './canvasjs.min.js';

// TODO click custom btn
const initCharts = (dataPoints) => {
  let chart = new CanvasJS.Chart("statistic", {
    animationEnabled: true,
    theme: "light2",
    title:{
      text: "Line Chart"
    },
    axisY:{
      includeZero: false
    },
    data: [{
      type: "line",
      indexLabelFontSize: 16,
      dataPoints: [
        { y: 450 }, { y: 414},
        { y: 520, indexLabel: "\u2191 highest",markerColor: "red", markerType: "triangle" },
        { y: 460 }, { y: 450 }, { y: 500 }, { y: 480 }, { y: 480 },
        { y: 410 , indexLabel: "\u2193 lowest",markerColor: "DarkSlateGrey", markerType: "cross" },
        { y: 500 }, { y: 480 }, { y: 510 }
      ]
    }]
  });
  chart.render();
}

export const statistic = {
  default: {},

  init() {
    //orders.init();
    initCharts();
  },

  addOrder(order) {},

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

      let title   = 'Закак №' + order['O.ID'],
          content = f.replaceTemplate(orders.tmp, order);

      statistic.M.show(title, content);
    }

  },
}

const orders = {
  data: Object.create(null),

  init() {
    this.initOrders();
    this.tmp || (this.tmp = f.gT('#orderTemplate'));
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

      calendar.addOrder(item);
    })
  },

  formatImportant(value) {
    value = JSON.parse(value.replace(/'/g, '"'));
    return value.reduce ? value.reduce((a, i) => { a += `${i.key}:${i.value}`; return a; }, '') : '';
  },
}
