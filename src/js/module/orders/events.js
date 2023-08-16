"use strict";

import Orders from "./OrdersClass";

// Orders list for search
class AllOrdersList {
  constructor(param) {
    const {node = false} = param;
    if (!node) return;

    const data = this.getFormData(param);

    this.node            = node;
    this.type            = param.tableType;
    this.data            = [];
    this.searchData      = Object.create(null);
    this.searchComponent = f.searchInit();
    this.loader          = new f.LoaderIcon(this.node);

    f.Post({data}).then(data => {
      data['orders'] && this.prepareSearchData(data['orders']);
      this.init(param);
      this.loader.stop();
    });
  }

  getFormData(param) {
    const fd = new FormData();
    fd.set('mode', 'DB');
    fd.set('dbAction', param.dbAction);
    fd.set('countPerPage', '1000');
    return fd;
  }

  init() {
    //this.count = 1;
    this.searchComponent.init({
      popup: false,
      node: this.node,
      searchData: this.searchData,
      showResult: this.showResult.bind(this),
    });
  }

  prepareSearchData(data) {
    if (this.type === 'order') {
      this.data = data.reduce((r, i) => {
        const id = i['ID'],
              phone = i['customerContacts'].phone.replace(/ |-|_|\(|\)|@/g, '');

        this.searchData[id] = id + i['customerName'] + phone + i['customerContacts'];
        r[id] = i;
        return r;
      }, Object.create(null));
    } else {
      this.data = data.reduce((r, i) => {
        this.searchData[i['cpNumber']] = i['cpNumber'] + ' ' + i['createDate'] + ' ' + i['total'];
        r[i['cpNumber']] = i;
        return r;
      }, Object.create(null));
    }
  }

  /**
   *
   * @param node
   * @param {[]} resultIds
   */
  showResult(node, resultIds) {
    let array = resultIds.reduce((r, i) => {r.push({...this.data[i]}); return r}, []);

    OrdersInstance.setOrders(array, true);
    /* Todo что бы учитывать настройки пагинации нужен запрос
     if (resultIds.length) {
     f.setLoading(this.node);
     this.FD.set('search', '1');
     this.FD.set('orderId', JSON.stringify(resultIds));

     f.Post({data: this.FD}).then(data => {
     f.removeLoading(this.node);
     if (data['orders']) orders.fillTable(data['orders'], true);
     });
     } else orders.fillTable([], true);*/
  }
}

export default class extends Orders {
  constructor() {
    super();
    this.onEvent();
  }
  /**
   * @param node
   * @param func
   * @param options
   * @param eventType {string}
   */
  onEventNode(node, func, options = {}, eventType = 'click') {
    node.addEventListener(eventType, e => func.call(this, e), options);
  }

  onEvent() {
    // Top buttons
    f.qA('input[data-action], button[data-action]', 'click', e => this.actionBtn.call(this, e));

    // Select
    f.qA('select[data-action]', 'change', e => this.actionSelect.call(this, e));

    // Focus Search Init
    f.qS('#search').addEventListener('focus', e => this.focusSearch(e), {once: true});
  }

  // Добавить проверку почты
  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  focusSearch(e) {
    const dbAction = this.orderType === 'visit' ? 'loadVisitorOrders' : this.mainAction,
          tableType = this.orderType === 'visit' ? 'visitOrder' : 'order';

    new AllOrdersList({dbAction, node: e.target, tableType});
  }

  actionBtn(e) {
    let target = e.target,
        action = target.dataset.action,
        hideActionWrap = false,
        selectedSize   = this.selected.getSelectedSize();

    if (!['setupColumns'].includes(action)) return;
    if (!['confirmYes', 'confirmNo'].includes(action)) this.queryParam.dbAction = action;
    if (!selectedSize && !(['setupColumns', 'orderTypeChange', 'confirmYes', 'confirmNo']).includes(action)) {
      f.showMsg('Выберите заказ!', 'warning'); return;
    }
    this.queryParam.orderIds = this.selected.getSelected();

    if (action.includes('confirm')) { // Закрыть подтверждение
      f.hide(this.confirm, f.qS('#selectStatus'), f.qS('#printTypeField'));
      f.show(f.qS('#actionBtnWrap'));

      if (action === 'confirmYes') {
        this.queryParam.commonValues = this.queryParam.orderIds;
        this.query();
      }
    } else { // Открыть подтверждение
      this[action] && (hideActionWrap = this[action](selectedSize, target));
      hideActionWrap && f.hide(f.qS('#actionBtnWrap'));
    }
  }
  changeStatusOrder() {
    this.needReload = true;
    this.selectStatus.dispatchEvent(new Event('change'));

    this.confirmMsg = 'Статусы Сохранены';
    f.show(this.confirm, this.selectStatus);
    return true;
  }
  delOrders() {
    this.needReload = true;
    this.confirmMsg = window._('Deleted');
    f.show(this.confirm);
    return true;
  }
  loadOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    const data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'loadOrderById');
    data.set( 'orderId', this.queryParam.orderIds);

    f.Post({data}).then(data => this.showOrder(data));
  }
  openOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let link = f.gI(f.ID.PUBLIC_PAGE),
      /* нужно это делать от дефолтного типа */
        query = this.orderType === 'visit' ? 'orderVisitorId=' : 'orderId=';
    link.href += '?' + query + this.selected.getSelected()[0];
    link.click();
  }
  printOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }
    let P    = f.initPrint(),
        data = new FormData();

    data.set('mode', 'docs');
    data.set('cmsAction', 'print');
    data.set('orderId', this.queryParam.orderIds);
    data.set('addManager', 'true');
    data.set('addCustomer', 'true');

    f.Post({data}).then(data => {
      try { data && P.print(data['printBody']); }
      catch (e) { console.log(e.message); }
    });
  }
  savePdf(selectedSize, target) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let data = new FormData(),
        url = this.dealerId ? 'dealer/' + this.dealerId + '/' : '';

    data.set('mode', 'docs');
    data.set('cmsAction', 'pdf');
    data.set('addCustomer', 'true');
    data.set('orderId', this.queryParam.orderIds);
    data.set('pdfOrientation', 'P');

    f.setLoading(target);
    target.setAttribute('disabled', 'disabled');

    f.Post({url: f.SITE_PATH + url, data}).then(data => {
      f.removeLoading(target);
      target.removeAttribute('disabled');
      if (data['pdfBody']) {
        f.saveFile({
          name: data['name'],
          type: 'base64',
          blob: 'data:application/pdf;base64,' + data['pdfBody']
        });
        target.blur();
      }
    });
  }
  sendOrder(selectedSize) {
    if (selectedSize !== 1) { f.showMsg('Выберите 1 заказ!', 'warning'); return; }

    let form = f.gTNode('#sendMailTmp');

    let fd = new FormData();
    fd.set('mode', 'DB');
    fd.set('dbAction', 'loadCustomerByOrder');
    fd.set('orderId', this.queryParam.orderIds);
    f.Post({data: fd}).then(data => {
      if (!data['customer']) {
        f.showMsg('Customer for order ' + this.queryParam.orderIds + ' not found', 'error');
        return;
      }

      if (data['customer']['contacts']) {
        let contacts = JSON.parse(data['customer']['contacts']),
            user     = data['users'],
            node     = form.querySelector('[name="email"]');

        this.queryParam.mode     = 'docs';
        this.queryParam.dbAction = 'mail';
        this.queryParam.docType  = 'pdf';
        this.queryParam.orderId  = this.queryParam.orderIds;
        this.queryParam.name     = user.name || user['login'];
        this.queryParam.phone    = contacts.phone || '';
        this.queryParam.email    = contacts['email'];

        this.onEventNode(node, this.changeEmailInput, {}, 'change');
        contacts['email'] && (node.value = contacts['email']);
        new f.Valid({form,
          sendFunc: () => {},
        });

        this.M.btnConfig('confirmYes', {value: 'Отправить'});
        this.M.show('Отправить на почту', form);

        this.confirmMsg = 'Отправлено';
      }
    });
  }
  orderTypeChange(selectedSize, target) {
    if (this.orderType === target.value) return;
    this.orderType = target.value;

    this.queryParam.sortColumn = 'createDate';
    this.queryParam.sortDirect = false;
    this.queryParam.currPage   = 0;
    this.queryParam.pageCount  = 0;
    delete this.queryParam.orderIds;

    if (this.orderType.toString() === 'visit') {
      this.queryParam.dbAction  = 'loadVisitorOrders';
      this.queryParam.tableName = 'client_orders';
      this.table.dataset.type   = 'visit';

      f.hide(f.qS('#orderBtn'));
    } else {
      this.queryParam.dbAction  = this.mainAction;
      this.queryParam.tableName = 'orders';
      this.table.dataset.type   = 'order';

      f.show(f.qS('#orderBtn'));
    }

    //this.setTableTemplate(this.table.dataset.type);
    this.query();
  }

  setupColumns() {
    const modal = new f.initModal(),
          form  = f.gTNode('#orderColumnsTableTmp'),
          queryParam = {mode: 'setting', dbAction: 'saveColumns'};

    queryParam.tableType = this.orderType === 'visit' ? 'ordersShowVisitorColumns' : 'ordersShowColumns';

    this.config.ordersColumns.forEach((key) => {
      const inputN = form.querySelector(`[name="${key['dbName']}"]`),
            wrap   = inputN.parentNode.parentNode;

      inputN.checked = true;
      form.append(wrap);
    });

    form.querySelectorAll('.droppable').forEach((wrap) => {
      const dragN  = wrap.querySelector('.dragItem');

      let currentDroppable = null;

      dragN.onmousedown = function(event) {
        let s = wrap.getBoundingClientRect(),
            shiftX = event.clientX - s.left,
            shiftY = event.clientY - s.top;

        function enterDroppable(elem) { elem.style.outline = '1px solid red'; }
        function leaveDroppable(elem) { elem.style.outline = ''; }
        function moveAt(pageX, pageY) {
          wrap.style.left = pageX - shiftX + 'px';
          wrap.style.top = pageY - shiftY + 'px';
        }
        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);

          wrap.hidden = true;
          let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
          wrap.hidden = false;

          if (!elemBelow) return;

          let droppableBelow = elemBelow.closest('.droppable');
          if (currentDroppable !== droppableBelow) {
            if (currentDroppable) { // null если мы были не над droppable до этого события
              leaveDroppable(currentDroppable); // (например, над пустым пространством)
            }
            currentDroppable = droppableBelow;
            if (currentDroppable) { // null если мы не над droppable сейчас, во время этого события
              enterDroppable(currentDroppable); // (например, только что покинули droppable)
            }
          }
        }

        wrap.style.position = 'absolute';
        wrap.style.width = s.width + 'px';
        wrap.style.zIndex = 1000;
        document.body.append(wrap);

        moveAt(event.pageX, event.pageY);

        document.addEventListener('mousemove', onMouseMove);

        dragN.onmouseup = function() {
          if (currentDroppable) currentDroppable.after(wrap);
          else form.prepend(wrap);

          wrap.style.position = 'initial';
          wrap.style.width = 'auto';

          document.removeEventListener('mousemove', onMouseMove);
          dragN.onmouseup = null;
          form.dispatchEvent(new Event('input'));
        };
      };

      dragN.ondragstart = function() { return false; };
    })

    form.oninput = () => queryParam.columns = JSON.stringify([...new FormData(form).keys()]);
    form.dispatchEvent(new Event('input'));

    modal.btnConfig('confirmYes', {value: _('Confirm')});
    modal.show('Настройка колонок', form, {
      afterConfirm: () => {
        f.Post({data: queryParam}).then(data => {
          if (data.status) f.showMsg(_('Saved! Change will be visible after reload page'), 'warning');
        });
      }
    });
  }

  actionSelect(e) {
    let target = e.target,
        action = target.dataset.action,
        selectedSize   = this.selected.getSelectedSize();

    if (!selectedSize && !(['setupColumns', 'orderType']).includes(action)) { f.showMsg(_('Choose an order!'), 'warning'); return; }

    let select = {
      'filterDealer': () => this.filterChange(target),
      'statusOrders': () => this.changeSelectInput(target),
    };

    select[action] && select[action]();
  }
  filterChange(target) {
    const id = target.value,
          dealerPath = f.SITE_PATH + 'dealer/' + id + '/';

    this.selected.clear();
    this.queryParam.mode = 'DB';
    this.queryParam.dbAction = this.mainAction;
    this.queryParam.orderIds = '[]';
    this.queryParam.currPage = 0;
    this.toggleDisableBtn(+id);

    this.query(+id ? dealerPath : undefined);
  }
  changeSelectInput(target) {
    this.queryParam.statusId = target.value;
  }
  changeEmailInput(e) {
    this.queryParam.email = e.target.value;
  }

  resetSelected() {
    this.selected.clear();
  }
}
