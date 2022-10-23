type CMSGlobalObject = {
  /**
   * @param {string} msg
   */
  log(msg: string): void

  capitalize(string: string): string
  camelize(string: string): string

  arrRemoveItem(arr: [], item: any) : []

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
  gI(id: string): HTMLElement

  /**
   * @param {string} selector
   * @param {HTMLElement} node
   */
  qS(selector: string, node?: HTMLElement): HTMLElement

  /**
   *
   * @param selector - css selector string
   * @param nodeKey - param/key
   * @param value - value or function (this, Node list, current selector)
   */
  qA(selector: string, nodeKey?: string, value?: string | Function): NodeList

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


  toNumber(v: any): number
  parseNumber(v: any): number


  /**
   * replace ${key from obj} from template to value from obj
   */
  replaceTemplate(tmpString: string, arrayObjects: object[]): string
}

interface Window {
  f: CMSGlobalObject
}

declare const f: CMSGlobalObject;
