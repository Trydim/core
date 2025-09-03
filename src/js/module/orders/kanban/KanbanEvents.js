import { Query } from '@syncfusion/ej2-data';
import { DropDownList, SelectEventArgs, ChangeEventArgs as DropDownChangeArgs } from '@syncfusion/ej2-dropdowns';

import KanbanBase from './KanbanBase';

let emptyValue = true,
    field      = 'lastEditDate',
    direct     = 'Descending';

export default class extends KanbanBase {
  constructor() {
    super();

    this.kanbanObj.cardClick  = this.onCardClick.bind(this);
    this.kanbanObj.dragStop = this.onDragStop.bind(this);

    this.kanbanObj.actionComplete = this.onActionComplete.bind(this);

    this.kanbanObj.dialogOpen = this.onDialogOpen.bind(this);

    this.searchNode.onfocus = this.onSearchFocus.bind(this);
    this.searchNode.onkeyup = this.onSearchKeyup.bind(this);
    this.filterNode.onchange = this.onFilterChange.bind(this);

    this.sortFieldNode.onchange  = this.onSortFieldChange.bind(this);
    this.sortDirectNode.onchange = this.onSortDirectChange.bind(this);

    this.applySort();
  }

  resetSelected() { }

  changeStatus(order) {
    this.needReload = true;
    this.confirmMsg = 'Статус Изменен';

    if (order.Status === order.status) return;

    //this.queryParam.currentStatusId = this.orders[this.selected.getSelected()[0]].statusId;
    this.queryParam.statusId = this.statusList[order.Status];
    this.queryParam.ordersIds = [order.ID];
    void this.query('changeOrders');
  }

  applySort() {
    this.kanbanObj['sortSettings'].sortBy    = 'Custom';
    this.kanbanObj['sortSettings'].field     = field;
    this.kanbanObj['sortSettings'].direction = direct;
  }

  onActionComplete(args) {
    if (args['requestType'] === "cardChanged") {
      this.changeStatus(args['changedRecords'][0]);
    }
  }

  // Kanban ------------------------------------------------------------------------------------------------------------
  onCardClick(args) {
    console.log('Kanban - ' + args.data.Id + ' - <b>Card Click</b> event called<hr>');
  }
  onDragStop(args) {
    const order = args.data[0];

    debugger

    if (order.Status === order.status) {
      this.applySort();
      return;
    }

    this.changeStatus(args.data[0])
  }

  // Edit dialog -------------------------------------------------------------------------------------------------------
  onDialogOpen(args) {
    args.element.querySelector('#Kanban_dialog_wrapper_title').innerHTML = _('Edit card details');
    args.element.querySelector('.e-dialog-edit').innerHTML = _('Save');
    args.element.querySelector('.e-dialog-cancel').innerHTML = _('Cancel');
    // Remove "Delete"
    args.element.querySelector('.e-dialog-delete').remove();

    if (args['requestType'] === 'Edit') {
      let curData = args.data;

      /*let node = args.element.querySelector('#Status');
      args.element.querySelector('#Status').innerHTML = Object.keys(this.statusList).map((s) => {
        return `<option value="${s}">${s}</option>`;
      }).join('');
      node.value = curData.Status;*/

      let statusDropObj = new DropDownList({
        value: curData.Status,
        dataSource: Object.keys(this.statusList),
        fields: { text: 'Status', value: 'Status' }, placeholder: 'Status'
      });

      statusDropObj.appendTo(args.element.querySelector('#Status'));

      /*let textareaObj = new TextBox({
        placeholder: 'Summary',
        multiline: true
      });
      textareaObj.appendTo(args.element.querySelector('#Summary'));*/
    }
  }

  // Search ------------------------------------------------------------------------------------------------------------
  onSearchFocus(e) {
    if (e.target.value === '') this.reset();
  }
  onSearchKeyup(e) {
    if (e.code === 'Tab' || e.code === 'Escape' || e.code === 'ShiftLeft' || (e.code === 'Backspace' && emptyValue)) {
      return;
    }
    let searchValue = e.target.value,
        searchQuery = new Query();

     emptyValue = searchValue.length === 0;

    if (searchValue) {
      searchQuery = new Query().search(searchValue, ['Id', 'Summary', 'customerName', 'userName'], 'contains', true);
    }

    this.kanbanObj.query = searchQuery;
  }

  // Filter ------------------------------------------------------------------------------------------------------------
  onFilterChange(e) {
    let filterQuery = new Query();

    if (e.target.value !== 'All') {
      filterQuery = new Query().where('Status', 'equal', e.target.value);
    }

    this.kanbanObj.query = filterQuery;
  }

  // Sort --------------------------------------------------------------------------------------------------------------
  onSortFieldChange(e) {
    field = e.target.value;
    this.applySort();
  }
  onSortDirectChange(e) {
    direct = e.target.value;
    this.applySort();
  }

  unmounted() {
    super.unmounted();
  }

  // Unused
  onCreate() {
    console.log('Kanban <b>Load</b> event called<hr>');
  }
  onActionBegin() {
    console.log('Kanban <b>Action Begin</b> event called<hr>');
  }
  onActionFailure() {
    console.log('Kanban <b>Action Failure</b> event called<hr>');
  }
  onDataBinding() {
    console.log('Kanban <b>Data Binding</b> event called<hr>');
  }
  onDataBound() {
    console.log('Kanban <b>Data Bound</b> event called<hr>');
  }
  onCardRendered(args) {
    console.log('Kanban - ' + args.data.Id + ' - <b>Card Rendered</b> event called<hr>');
  }
  onQueryCellInfo() {
    console.log('Kanban <b>Query Cell Info</b> event called<hr>');
  }
  onCardDoubleClick(args) {
    console.log('Kanban - ' + args.data.Id + ' - <b>Card Double Click</b> event called<hr>');
  }
  onDragStart() {
    console.log('Kanban <b>Drag Start</b> event called<hr>');
  }
  onDrag() {
    console.log('Kanban <b>Drag</b> event called<hr>');
  }
}
