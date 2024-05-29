"use strict";

import Orders from "./OrdersClass";

let searchInProgress = false;

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
    f.qA('input[data-action], button[data-action]', 'click', e => this.actionBtn(e));

    // Select
    f.qA('select[data-action]', 'change', e => this.actionSelect(e));

    // Focus Search Init
    f.qS('#search').addEventListener('input', e => this.inputSearch(e));
  }

  // Добавить проверку почты
  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка'; return; }
    this.queryParam[e.target.name] = e.target.value;
  }

  // Events function
  //--------------------------------------------------------------------------------------------------------------------
  inputSearch(e) {
    const node = e.target,
          value = node.value.toString();

    const loader = new f.LoaderIcon(node);

    if (value.length < 2) {
      if (searchInProgress) {
        this.queryParam.dbAction = this.orderType === 'visit' ? 'loadVisitorOrders' : this.mainAction;
        searchInProgress = false;
      } else {
        loader.stop();
        return;
      }
    } else {
      searchInProgress = true;
      this.queryParam.dbAction = this.orderType === 'visit' ? 'searchVisitorOrders' : 'searchOrder';
      this.queryParam.searchValue = value;
    }

    this.query().then(() => loader.stop())
  }

  actionBtn(e) {
    let target = e.target,
        action = target.dataset.action,
        hideActionWrap = false,
        selectedSize   = this.selected.getSelectedSize();

    if (!['confirmYes', 'confirmNo'].includes(action)) this.queryParam.dbAction = action;
    if (['loadOrder', 'openOrder', 'printOrder', 'savePdf', 'sendOrder'].includes(action) && selectedSize !== 1) {
      f.showMsg('Выберите 1 заказ!', 'warning'); return;
    }
    if (!selectedSize && !['setupColumns', 'orderTypeChange', 'confirmYes', 'confirmNo'].includes(action)) {
      f.showMsg('Выберите заказ!', 'warning'); return;
    }
    this.queryParam.orderIds = this.selected.getSelected();

    if (action.includes('confirm')) { // Закрыть подтверждение
      f.hide(this.confirm, f.qS('#selectStatus'), f.qS('#printTypeField'));
      this.selected.unBlock();
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
    this.selected.block();
    return true;
  }
  delOrders() {
    this.needReload = true;
    this.confirmMsg = window._('Deleted');
    f.show(this.confirm);
    return true;
  }
  delVisitorOrders() {
    this.needReload = true;
    this.confirmMsg = window._('Deleted');
    f.show(this.confirm);
    return true;
  }
  /*loadOrder() {
    const data = new FormData();
    data.set('mode', 'DB');
    data.set('dbAction', 'loadOrderById');
    data.set('orderId', this.queryParam.orderIds);

    f.Post({data}).then(data => this.showOrder(data));
  }*/
  openOrder() {
    let link = f.gI(f.ID.PUBLIC_PAGE),
        // нужно это делать от дефолтного типа
        query = this.orderType === 'visit' ? 'orderVisitorId=' : 'orderId=';
    link.href += '?' + query + this.selected.getSelected()[0];
    link.click();
  }
  printOrder() {
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
  sendOrder() {
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
    this.headRendered = false;
    this.orderType = target.value;
    this.selected.clear();

    this.queryParam.sortColumn = 'createDate';
    this.queryParam.sortDirect = false;
    this.queryParam.currPage   = 0;
    this.queryParam.pageCount  = 0;
    delete this.queryParam.orderIds;

    if (this.orderType.toString() === 'visit') {
      this.queryParam.dbAction  = 'loadVisitorOrders';
      this.queryParam.tableName = 'client_orders';
      this.table.dataset.type   = 'visit';

      f.gI('deleteOrderBtn').dataset.action = 'delVisitorOrders';
      f.hide(f.qS('#orderBtn'));
    } else {
      this.queryParam.dbAction  = this.mainAction;
      this.queryParam.tableName = 'orders';
      this.table.dataset.type   = 'order';

      f.gI('deleteOrderBtn').dataset.action = 'delOrders';
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
        wrap.style.zIndex = 1250;
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
    const target = e.target,
          action = target.dataset.action;

    this[action] && this[action](target);
  }
  /*filterChange(target) {
    const id = target.value,
          dealerPath = f.SITE_PATH + 'dealer/' + id + '/';

    this.queryParam.mode = 'DB';
    this.queryParam.dbAction = this.mainAction;
    this.queryParam.orderIds = '[]';
    this.queryParam.currPage = 0;
    this.toggleDisableBtn(+id);

    this.query(+id ? dealerPath : undefined);
  }*/
  filterCustomers(target) {
    this.queryParam.mode = 'DB';
    this.queryParam.dbAction = this.mainAction;
    this.queryParam.currPage = 0;

    if (+target.value) this.queryParam.ordersFilter = JSON.stringify({customerId: target.value});
    else delete this.queryParam.ordersFilter;

    this.query();
  }

  statusOrders(target) {
    this.queryParam.statusId = target.value;
  }
  changeEmailInput(e) {
    this.queryParam.email = e.target.value;
  }

  resetSelected() {
    this.selected.clear();
  }
}
