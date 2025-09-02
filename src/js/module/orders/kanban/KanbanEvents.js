import KanbanBase from './KanbanBase';

export default class extends KanbanBase {
  constructor() {
    super();

    this.kanbanObj.cardClick  = this.onCardClick.bind(this);
    this.kanbanObj.dragStop = this.onDragStop.bind(this);
  }

  resetSelected() { }

  onCreate() {
    console.log('Kanban <b>Load</b> event called<hr>');
  }
  onActionBegin() {
    console.log('Kanban <b>Action Begin</b> event called<hr>');
  }
  onActionComplete() {
    console.log('Kanban <b>Action Complete</b> event called<hr>');
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
  onCardClick(args) {
    console.log('Kanban - ' + args.data.Id + ' - <b>Card Click</b> event called<hr>');
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
  onDragStop(args) {
    const order = args.data[0];

    this.needReload = true;
    this.confirmMsg = 'Статус Изменен';

    if (order.Status === order.status) return;

    //this.queryParam.currentStatusId = this.orders[this.selected.getSelected()[0]].statusId;
    this.queryParam.statusId = this.statusList[order.Status];
    this.queryParam.ordersIds = [order.ID];
    void this.query('changeOrders');
  }


  unmounted() {
    this.resetSelected();
  }
}
