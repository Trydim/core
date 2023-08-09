
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
  subscribe()
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
