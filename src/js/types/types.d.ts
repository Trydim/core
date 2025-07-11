/// <reference lib="component.d.ts" />
/// <reference lib="sweetalert2.d.ts" />

declare interface Hooks {
  beforeCreateApp: Function|null
  beforeMoundedApp: Function|null
  afterMoundedApp: Function|null
}

declare type CMSGlobalObject = {
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

  ID: {
    AUTH_BLOCK: string
    PUBLIC_PAGE: string
  }

  INIT_SETTING: Object | false
  /** global mask for function initMask */
  PHONE_MASK_DEFAULT: string
  /** Global hooks for cms module on vue */
  HOOKS: Hooks
  /** same INIT_SETTING */
  CMS_SETTING: Object

  CLASS_NAME: {
    SORT_BTN_CLASS: string,
  }

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
  parseNumber(v: any): number

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
          options?: boolean | object
  ): void
  /**
   * flatten object
   * @param obj
   */
  objectFlat(obj: Object): [string, any][]

  /**
   * Save file from browser
   *
   * @example for PDF:
   * {name: 'file.pdf',
   * type: 'base64',
   * blob: 'data:application/pdf;base64,' + data['pdfBody']}
   */
  saveFile(data: {name: string, type: undefined | string  | 'json' | 'base64', lob: string}): void
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

  Get(obj: {
    url?: string,
    data?: any,
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<Response>

  Post(obj: {
    url?: string,
    data: BodyInit | {},
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<Response>

  LoaderIcon: typeof LoaderIcon

  Modal<T = any>(options: SweetAlertOptions|string): SweetAlertResult<Awaited<T>>
  Modal<T = any>(title: string, html?: string, icon?: SweetAlertIcon): SweetAlertResult<Awaited<T>>
  initModal(),

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

  /* Without description */
  createLink(filename: string): HTMLAnchorElement

  getSetting()

  Valid: typeof Valid
}

interface Window extends Window {
  f: CMSGlobalObject
}

declare const f: CMSGlobalObject;
