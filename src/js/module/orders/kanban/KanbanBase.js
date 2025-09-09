import '../../../../css/module/orders/orders.scss';

import {Kanban} from '@syncfusion/ej2-kanban';

import * as Locale from './locale/ru.json';
import { L10n } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';

//import { CheckBox } from '@syncfusion/ej2-buttons';
//import { NumericTextBox, TextBox } from '@syncfusion/ej2-inputs';
//import { DropDownList, SelectEventArgs } from '@syncfusion/ej2-dropdowns';

//import {generateData}  from "./data/getData";
//import * as dataSource from './data/datasource.json';

const getDateString = (v) => {
  const d = new Date(v);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU').slice(0, 5);
}

L10n.load({ru: Locale.ru});

export default class {
  kanbanNode = undefined;
  searchNode = undefined;
  filterNode = undefined;
  sortFieldNode  = undefined;
  sortDirectNode = undefined;
  kanbanObj = {};

  mainAction = 'loadOrders';

  needReload = false;
  queryParam = {
    mode        : 'DB',
    dbAction    : 'loadOrders',
    tableName   : 'orders',
    sortColumn  : 'createDate',
    sortDirect  : true, // true = DESC, false
    currPage    : 0,
    countPerPage: 20,
    pageCount   : 0,
  };

  confirmMsg = '';

  statusList = {};
  orders = {};
  filter = {};

  constructor() {
    this.kanbanObj = new Kanban({ //Initialize Kanban control
      enableVirtualization: true, // To enable virtual scrolling feature.
      keyField: 'Status',
      cardSettings: {
        headerField: 'Id',
        contentField: 'Summary',
        template: '#cardTemplate'
      },
      swimlaneSettings: {
        //keyField: 'Assignee'
      },

      locale: f.cookieGet('lang'),

      /*cardRendered: (args: CardRenderedEventArgs) => {
       let val: string = ((<{[key: string]: Object}>(args.data)).Priority as string).toLowerCase();
       addClass([args.element], val);
      },*/

      dialogSettings: {
        template: '#dialogTemplate',
      },

      height: (window.screen.height - 310).toString() + 'px',
      cardHeight: '180px',
    });

    this.setTemplateFunc();
    this.setParam();
  }

  setTemplateFunc() {
    // Шаблон карточки -----------------------------------------------------------------------------------------------------
    window.ordersGetTags = (data) => {
      let tagDiv = '',
          tags = data.split(',');
      for (let tag of tags) {
        tagDiv += '<div class="e-card-tag-field">' + tag + '</div>';
      }
      return tagDiv;
    };
  }
  setParam() {
    this.kanbanNode = f.gI('orderKanban');
    this.searchNode = f.gI('searchText');
    this.filterNode = f.gI('filterSelect');
    this.sortFieldNode  = f.gI('sortField');
    this.sortDirectNode = f.qA('[name="sortDirect"]');

    f.oneTimeFunction.add('fillSelectStatus', this.fillSelectStatus.bind(this));
  }

  init() {
    this.loaderTable = new f.LoaderIcon(this.kanbanNode);

    this.kanbanObj.appendTo('#Kanban'); // Render initialized Kanban control
    void this.query();
  }

  ordersPrepare(data) {
    return data.map(item => {
      // Обязательный поля для библиотеки
      item.Id     = item['ID'];
      item.Status = item.status;
      item.Summary = '';

      item.title   = '№' + item.Id;
      item.created = getDateString(item['createDate']);
      item.edited  = item['createDate'] !== item['lastEditDate'] ? 'Изменено: ' + getDateString(item['lastEditDate']) : '';

      if (item.customerContacts) {
        let value = Object.entries(item.customerContacts).map(n => ({key: window._(n[0]), value: n[1]}));
        item.phone   = item.customerContacts.phone || '-';
        item.Summary = f.replaceTemplate('${value} ', value);
      }

      if (item.importantValue) {
        // Производитель добавляет свои поля, сохраняя текущие в baseVal
        let value = Object.entries(item.importantValue).map(n => ({key: window._(n[0]), value: n[1]}));
        item.importantValue = f.replaceTemplate('${key}:${value}', value);
      }

      item.total = new Intl.NumberFormat("ru-RU").format(item.total)

      this.orders[item['ID']] = item;

      return item;
    });
  }

  setOrders(data) {
    this.kanbanObj.dataSource = this.ordersPrepare(data);
    //this.kanbanObj.dataSource = generateData();
  }

  // Заполнить статусы
  fillSelectStatus(data) {
    data.forEach((s, index) => {
      this.statusList[s.name] = s.ID;

      this.kanbanObj.addColumn({
        template: '#headerTemplate',
        allowToggle  : true,
        showItemCount: true,
        headerText   : s.name,
        keyField     : s.name,
      }, index);
    });

    if (data.length > 4) {
      this.kanbanObj.width = (data.length * 320).toString() + 'px';
    }
    // Filter status
    this.filterNode.innerHTML = ['All'].concat(Object.keys(this.statusList)).map((item) => {
      return `<option value="${item}">${_(item)}</option>`;
    }).join('');
    this.setStyle();
  }
  setStyle() {
    const styleNode = document.createElement('style');

    const colors = ['#07A5D066', '#28AD004D', '#FFCC004D', '#FF00004D'];

    styleNode.innerHTML = Object.keys(this.statusList).map((s) => {
      const cI = f.random(0, 3);

      return `
        th[data-role="kanban-column"][data-key="${s}"] { background: ${colors[cI]} !important; }
        .e-card[data-key="${s}"] { border-left: 4px ${colors[cI]} solid !important; }
      `;
    }).join('');

    document.head.append(styleNode);
  }

  query(action) {
    const data  = {},
          param = this.queryParam;

    if (action) param.dbAction = action;

    Object.entries(param).map(([k, v]) => {
      v !== undefined && (data[k] = v.toString());
    });

    if (param.dbAction === this.mainAction) delete data['orderIds'];

    this.loaderTable.start();
    return f.Post({data}).then(data => {
      /*if (param.dbAction === 'changeStatusOrder') {
        const ws = this.websocket;
        ws && ws.readyState === ws.OPEN && ws.send(JSON.stringify({mode: param.dbAction}));
      }*/

      if (this.needReload) {
        this.needReload = false;
        //this.selected.clear();
        this.queryParam.dbAction = this.mainAction;
        this.queryParam.orderIds = '[]';
        return this.query();
      } else {
        this.confirmMsg && f.showMsg(this.confirmMsg, data.status ? 'success' : 'error') && (this.confirmMsg = false);
      }

      if (data['orders']) this.setOrders(data['orders']);
      if (data['statusOrders']) f.oneTimeFunction.exec('fillSelectStatus', data['statusOrders']);

      this.loaderTable.stop();
      return true;
    });
  }

  reset() {
    this.kanbanObj.query = new Query();
  }

  unmounted() {
    this.kanbanObj.destroy();
  }
}
