/// <reference path="./component.d.ts" />
/// <reference path="./sweetalert2.d.ts" />

declare interface Hooks {
  beforeCreateApp: Function|null
  beforeMoundedApp: Function|null
  afterMoundedApp: Function|null
}

export declare interface CMSGlobalObject {
  /** Global debug flag */
  DEBUG: boolean
  /** Yes or not safe editing csv tables */
  CSV_DEVELOP: boolean
  /** app starting as external module */
  OUTSIDE: boolean|undefined
  /** path to calc dir */
  SITE_PATH: string
  /** path to calc index.php */
  MAIN_PHP_PATH: string
  /** Base lang from config or from Main class */
  BASE_LANG: string,
  /**
   * use URI_IMG
   * @deprecated
   */
  PATH_IMG: string
  /** Uri to images folder */
  URI_IMG: string
  /** Uri to file manager folder */
  URI_SHARED: string
  /** Uri to dealer images folder */
  DEAL_URI_IMG : string,
  /** Uri to dealer file manager folder */
  DEAL_URI_SHARED : string,
  /** User is authorized */
  AUTH_STATUS: boolean
  /** app starting as dealer module */
  IS_DEAL: boolean
  /** app starting on local machine */
  IS_LOCAL: boolean

  ID: {
    AUTH_BLOCK : 'authBlock'
    PUBLIC_PAGE: 'publicPageLink'
  }

  INIT_SETTING: Object | false
  /** global mask for function initMask */
  PHONE_MASK_DEFAULT: string
  /** Global hooks for cms module on vue */
  HOOKS: Hooks
  /** same INIT_SETTING */
  CMS_SETTING: Object

  CLASS_NAME: {}

  /**
   * @param {string} msg
   */
  log(msg: string): void

  capitalize(string: string): string
  camelize(string: string): string

  arrRemoveItem(arr: [], item: any): []

  isMobile(ua?: Navigator): boolean
  isSafari(ua?: Navigator): boolean

  /**
   * Create element from string or
   *
   * @param htmlOrTemplate
   */
  createElement(htmlOrTemplate: string | HTMLTemplateElement): HTMLElement

  /**
   * Get Element by id from document or shadow DOM
   * @param {string} id String that specifies the ID value.
   * @return {HTMLElement} HtmlElement
   */
  gI(id: string): HTMLElement | Node | any

  /**
   * @param {string} selector
   * @param {HTMLElement} node
   */
  qS(selector: string, node?: HTMLElement): HTMLElement | Node | any

  /**
   *
   * @param selector - css selector string
   * @param nodeKey - param/key
   * @param value - value or function (this, Node list, current selector)
   */
  qA(selector: string, nodeKey?: string, value?: string | Function): NodeList | Iterable<Node>

  /**
   * получить html шаблона
   *
   * @param {string} selector
   * @return {string}
   */
  gT(selector: string): string

  /**
   * Получить Node шаблона
   * @param {string} selector
   */
  gTNode(selector: string): HTMLTemplateElement

  /**
   * @param selector
   * @return string - json
   */
  getData(selector: string): object

  getDataAsAssoc(selector: string): object
  getDataAsMap(selector: string): Map<any, any>
  getDataAsSet(selector: string): Set<any>
  getDataAsArray(selector: string): any[]

  show(...collection: NodeList | Iterable<Node>)
  hide(...collection: NodeList | Iterable<Node>)
  enable(...collection: NodeList | Iterable<Node>)
  disable(...collection: NodeList | Iterable<Node>)
  flashNode(...collection: NodeList | Iterable<Node>)

  eraseNode(node: HTMLElement)
  /**
   * Input будет давать true, когда активен(checked)
   * для определения цели добавить input-у data-target="targetClass"
   * Цели добавить в data-relation в виде логического выражения
   * Истина будет показывать цель.
   * Например: data-target="target" -> data-relation="target"
   *
   * Селекторы должны иметь класс useToggleOption
   * Опциям селектора добавить data-target="targetClass"
   * @param node
   */
  relatedOption(node?: HTMLElement)

  toNumber(v: any): number
  /**
   * @deprecated use toNumber
   * @param v
   */
  parseNumber(v: any): number
  toBool(v: any): boolean,

  /**
   * Generate random number from min to max
   * @default 1-99999
   */
  random(min?: number, max?: number): number,

  /**
   * replace ${key from obj} from template to value from obj
   */
  replaceTemplate(tmpString: string, arrayObjects: object): string

  /**
   * show Toast
   */
  showMsg(message: string,
          type?: 'tip' | 'info' | 'success' | 'ok' | 'warning' | 'error' | 'alert',
          options?: boolean | {animationDuration: number}
  ): void
  /**
   * flatten object
   * @param obj
   */
  objectFlat(obj: Object): [string, any][]

  /** Cookie get */
  cookieSet(key: string, value: string): void
  cookieGet(key: string): string | undefined,

  /**
   * Save file from browser
   * @param {{name}} data
   *
   * @example for PDF:
   * {name: 'file.pdf',
   * type: 'base64',
   * blob: 'data:application/pdf;base64,' + data['pdfBody']}
   */
  saveFile(data: {name: string, type?: string | 'json' | 'base64', blob: string}): void
  /**
   * Replace latin to cyrillic symbol
   */
  replaceLetter(value: string): string
  /**
   * replace ${key_from_obj} from template to value from obj
   */
  replaceTemplate(tmpString: string, arrayObjects: {[key: string]: string}): string
  /**
   * Mask for input
   */
  initMask(node: HTMLElement, phoneMask?: string): void
  /**
   * Set loading spinner icon
   */
  setLoading(node: HTMLElement, isLight?: false): void
  /**
   * Remove loading spinner icon
   */
  removeLoading(node: HTMLElement): void
  /**
   * Create and download Pdf document
   * Will be use template in views/docs/pdfTpl.php as default
   *
   * A global function "pdfResources" will be created, which can help to get an html+css template
   */
  downloadPdf(
    target: HTMLElement,
    report: {
      reportValue: Object | any,
      fileName?: string, fileTpl?: string,
      pdfOrientation?: 'P' | 'L',
      addManager?: boolean,
      addCustomer?: boolean,
    },
    data?: FormData,
    finishOk?: Function,
    errorFn?: Function,
  )

  /**
   * LocalStorage
   */
  LocalStorage

  transLit(value: string): string
  unique(value: number): string,

  Get<R>(obj: {
    url?: string,
    data?: any,
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<R | Record<string, any> & Response>

  Post<R>(obj: {
    url?: string,
    data: BodyInit | {},
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<R | Record<string, any> & Response>

  LoaderIcon: typeof LoaderIcon

  Modal<T = any>(options: SweetAlertOptions|string): SweetAlertResult<Awaited<T>>
  Modal<T = any>(title: string, html?: string, icon?: SweetAlertIcon): SweetAlertResult<Awaited<T>>
  initModal(),

  Toast: typeof ToastClass

  searchInit(): Searching

  Pagination: typeof Pagination
  SelectedRow: typeof SelectedRow
  SortColumns: typeof SortColumns
  User: typeof User

  oneTimeFunction: {
    add(name: string, func: Function)
    exec(name: string, ...arg: any)
    del(name: string)
  }

  /** Without description */
  createLink(filename: string): HTMLAnchorElement

  getSetting(key: string)

  Valid: typeof Valid
}

export declare global {
  interface Window extends Window {
    f: CMSGlobalObject

    _(...a: string[]): string

    OrdersInstance: Orders
  }

  declare const f: CMSGlobalObject;

  declare function _(key: string, ...a): string
}
