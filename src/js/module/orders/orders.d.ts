declare interface TableBase {
  selected: any;
  selectedArea: HTMLElement | undefined;
  mainAction: string;
  needReload: boolean;
  headRendered: boolean;
  queryParam: {
    mode: string;
    dbAction: string;
    tableName: string;
    sortColumn: string;
    sortDirect: boolean;
    currPage: number;
    countPerPage: number;
    pageCount: number;
    [key: string]: any;
  };
  confirm: HTMLElement | null;
  selectStatus: HTMLElement | null;
  confirmMsg: string;
  dealerId: number;
  orders: Record<string, any>;
  filter: Record<string, any>;
  orderType: string;
  table: HTMLElement | null;
  btnMainOnly: NodeListOf<HTMLElement> | HTMLElement[];
  config: {
    ordersAllColumns: string[];
    ordersColumns: any[];
    ordersVisitColumns: any[];
  };
  template: {
    tableHeader: string;
    impValue: string | null;
    searchMsg: string;
  };
  M: any;
  p: any;
  loaderTable: any;
  websocket: WebSocket | undefined;
  statusList: any;

  setParam(): void;
  init(): void;
  getTypeConfig(): string;
  ordersHeadRender(): void;
  ordersGetTableCellTemplate(): string;
  ordersPrepare(data: any[]): any[];
  ordersFilter(data: any[], search?: any): any[];
  bodyRender(data: any, search?: any): void;
  ordersRender(data: any, search?: any): void;
  selectedRender(): void;
  setOrders(data: any[]): void;
  fillSelectStatus(data: any): void;
  showOrder(data: any): void;
  toggleDisableBtn(id: number): void;
  initSocket(): void;
  query(action?: string): Promise<boolean>;
}

declare interface TableEvents extends TableBase {
  init(): void;
  onEventNode(node: HTMLElement, func: Function, options?: any, eventType?: string): void;
  onEvent(): void;
  changeTextInput(e: Event): void;
  inputSearch(e: Event): void;
  actionBtn(e: Event): void;
  changeStatusOrder(): boolean;
  delOrders(): boolean;
  delVisitorOrders(): boolean;
  openOrder(): void;
  printOrder(): void;
  savePdf(selectedSize: number, target: HTMLElement): void;
  sendOrder(): void;
  orderTypeChange(selectedSize: number, target: HTMLElement): void;
  setupColumns(): void;
  actionSelect(e: Event): void;
  filterCustomers(target: HTMLElement): void;
  statusOrders(target: HTMLElement): void;
  changeEmailInput(e: Event): void;
  resetSelected(): void;
  unmounted(): void;
}

declare interface Table extends TableEvents {
  [key: string]: any
}

declare interface KanbanBase {
  kanbanNode: HTMLElement | undefined;
  searchNode: HTMLElement | undefined;
  filterNode: HTMLElement | undefined;
  sortFieldNode: HTMLElement | undefined;
  sortDirectNode: NodeListOf<HTMLElement> | HTMLElement[] | undefined;
  kanbanObj: any;
  mainAction: string;
  needReload: boolean;
  queryParam: {
    mode: string;
    dbAction: string;
    tableName: string;
    sortColumn: string;
    sortDirect: boolean;
    currPage: number;
    countPerPage: number;
    pageCount: number;
    [key: string]: any;
  };
  confirmMsg: string;
  statusList: Record<string, number>;
  orders: Record<string, any>;
  filter: Record<string, any>;
  loaderTable: any;

  constructor(): void;
  setTemplateFunc(): void;
  setParam(): void;
  init(): void;
  ordersPrepare(data: any[]): any[];
  setOrders(data: any[]): void;
  fillSelectStatus(data: any): void;
  setStyle(): void;
  query(action?: string): Promise<boolean>;
  reset(): void;
  unmounted(): void;
}

declare interface KanbanEvents extends KanbanBase {
  constructor(): void;
  resetSelected(): void;
  changeStatus(order: any): void;
  applySort(): void;
  onActionComplete(args: any): void;
  itemOpen(args: any): void;
  itemPdf(args: any): void;
  itemExcel(args: any): void;
  itemView(args: any): void;
  onCardClick(args: any): void;
  onDragStop(args: any): void;
  onDialogOpen(args: any): void;
  onSearchFocus(e: Event): void;
  onSearchKeyup(e: Event): void;
  onFilterChange(e: Event): void;
  onSortFieldChange(e: Event): void;
  onSortDirectChange(e: Event): void;
  unmounted(): void;
  onCreate(): void;
  onActionBegin(): void;
  onActionFailure(): void;
  onDataBinding(): void;
  onDataBound(): void;
  onCardRendered(args: any): void;
  onQueryCellInfo(): void;
  onCardDoubleClick(args: any): void;
  onDragStart(): void;
  onDrag(): void;
}

declare interface Kanban extends KanbanEvents {
  [key: string]: any
}

declare interface Orders {
  selectedView: 'table' | 'kanban';
  viewInstance: Table | Kanban | { init(): void; unmounted(): void };
  overSetViewMethods?: (viewInstance: Table | Kanban) => void;
  onMountedView?: (viewInstance: Table | Kanban) => void;

  switchView(): void;
  onEvent(): void;
  actionBtn(target: { value: string }): void;
}
