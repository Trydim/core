declare class LoaderIcon {
  constructor(
    field: string | HTMLElement | any,
    showNow?: boolean,
    param?: {
      wrap?: boolean | string,
      loader?: boolean | string
      loaderS?: boolean | string
      big?: boolean | string
    },
  )

  start(): void
  stop(): void
}

declare class Observer {
  addArgument(name: string, object: object): void
  remove(): void
  getListPublisher(): {}
  searchPublisherKey(searchKey: string): string
  subscribe(name: string, func: Function): void
  fire(name: string, ...arg)
}

declare class Pagination {
  constructor(fieldSelector: string, param: {
    dbAction: string,
    sortParam: {
      currPage: number,
      pageCount: number,
      countPerPage: number,
    },
    query: Function
  })

  //private setParam()
  //private checkBtn()

  public setQueryAction(action: string): void
  public setCountPageBtn(count: number): void
  public fillPagination(count: number): void
}

declare class SelectedRow {
  constructor(param: {
    table: HTMLTableElement
    observerKey?: string,
  })

  clear(): void
  add(id: string | number): SelectedRow
  getSelected(): string | number[]
  getSelectedSize(): number
  remove(id: string | number): SelectedRow

  block(): SelectedRow
  unBlock(): SelectedRow

  getObserverKey(): string

  subscribe(func: Function, ...arg: any): void

  checkedById(id: string | number, check = true): SelectedRow
  checkedAll()
}

declare class SortColumns {
  constructor(param: {
    thead: HTMLTableRowElement,
    query: Function,
    dbAction: string,
    sortParam: {
      currPage: number,
      pageCount: number,
      countPerPage: number,
    },
  })
}

declare interface Searching {
  init(param: {
    popup: boolean,
    node: Node,
    searchData: {[key: number]: any}[] | any[],
    finishFunc(),
    showResult(template: string, resultIds: number[] | string[])
  })
}

declare class User {
  get(key: string|'id'|'isAdmin'|'permission'|'tags'|'dealer'|'dealerSetting', defValue?: any)

  getDealerSettings(prop: string): undefined | any[]
  haveTags(tag: string): boolean
}

declare class Valid {
  constructor(param: {
    sendFunc: Function,
    form?: HTMLFormElement | HTMLTemplateElement | string,
    submit?: string,
    fileFieldSelector?: boolean
    initMask?: boolean,
    phoneMask?: string,
    classPrefix?: string,
  })
}

declare interface IToastOptions {
  prefix?: string,
  position?: 'topLeft' | 'topCenter' | 'topRight' | 'left' | 'center' | 'right' | 'bottomLeft' | 'bottom' | 'bottomRight',
  maxNotifications?: number,

  durations?: {
    global? : number,
    success?: number,
    info?   : number,
    tip?    : number,
    warning?: number,
    alert?  : number,
  },
  wrapClass?: string,
  wrapIndex?: number,
}
declare class ToastClass {
  constructor(options: {id?: string} & IToastOptions)

  container: HTMLElement | null

  tip(msg: string, options?: IToastOptions)
  info(msg: string, options?: IToastOptions)
  success(msg: string, options?: IToastOptions)
  warning(msg: string, options?: IToastOptions)
  alert(msg: string, options?: IToastOptions)

  async(promise: Promise<any>, onResolve: Function, onReject: Function, msg: string, options?: IToastOptions)
  asyncBlock(promise: Promise<any>, onResolve: Function, onReject: Function, msg: string, options?: IToastOptions)

  confirm(msg: string, onOk: Function, onCancel: Function, options?: IToastOptions)

  closeToasts(): void
}
