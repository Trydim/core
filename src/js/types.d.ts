
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
}

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
  /** @deprecated use URI_IMG */
  PATH_IMG: string
  /** Uri to images folder */
  URI_IMG: string
  /** User is authorized */
  AUTH_STATUS: boolean
  /** app starting as dealer module */
  IS_DEAL: boolean

  INIT_SETTING: object|false
  /** global mask for function initMask */
  PHONE_MASK_DEFAULT: string
  /** Global hooks for cms module on vue */
  HOOKS: Hooks
  /** same INIT_SETTING */
  CMS_SETTING: object

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
  gI(id: string): HTMLElement | any

  /**
   * @param {string} selector
   * @param {HTMLElement} node
   */
  qS(selector: string, node?: HTMLElement): HTMLElement | any

  /**
   *
   * @param selector - css selector string
   * @param nodeKey - param/key
   * @param value - value or function (this, Node list, current selector)
   */
  qA(selector: string, nodeKey?: string, value?: string | Function): NodeList | Iterable<any>

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
  gTNode(selector: string): HTMLElement

  /**
   * @param selector
   * @return string - json
   */
  getData(selector: string): string

  getDataAsAssoc(selector: string): object
  getDataAsMap(selector: string): Map<any, any>
  getDataAsSet(selector: string): Set<any>
  getDataAsArray(selector: string): any[]

  show(collection: NodeList)
  hide(collection: NodeList)
  enable(collection: NodeList)
  disable(collection: NodeList)

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
  relatedOption(node: HTMLElement)

  toNumber(v: any): number
  parseNumber(v: any): number

  /**
   * return random number
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
   * LocalStorage
   */
  LocalStorage()

  transLit(value: string): string

  Get(obj: {
    url?: string,
    data?: string,
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<Response>

  Post(obj: {
    url?: string,
    data: BodyInit,
    type?: string | 'text' | 'json' | 'blob'
  }): Promise<Response>

  LoaderIcon: LoaderIcon
}

interface Window {
  f: CMSGlobalObject
}

declare const f: CMSGlobalObject;
