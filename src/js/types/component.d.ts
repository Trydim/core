
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
  constructor()

  addArgument(): void
  remove(): void
  getListPublisher(): void
  subscribe(): void
  fire()
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

declare interface User {}
