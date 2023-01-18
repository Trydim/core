
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
