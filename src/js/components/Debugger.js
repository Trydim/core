'use strict';

export class Debugger {
  /**
   *
   * @param {string|HTMLElement} field
   * @param param
   */
  constructor(field, param = Object.create(null)) {
    /*const {
      fieldSelector,
      fieldNode,
    } = param;*/

    this.field       = typeof field === 'string' ? document.querySelector(field) : field;
    this.showEach    = param.showEach || false;   // Show each added value
    this.showConsole = param.showConsole || true; // Show result to console
    this.showDom     = param.showDom || false;    // Output result to Dom
    this.showTrace   = param.trace || false;      // add Trace

    this.clear();
  }

  clear() {
    this.dataArr = [];
    this.data    = new Map();
  }

  setShowEach(flag) {
    this.showEach = flag ? flag : true;
  }

  /**
   * Максимум три параметра
   * @param {array|string|object} param - или строка как значение первого столбца или массив или объект с ключами.
   * @param {array|} param - строка как значенеи второй колонки, если первый аргумент массив или объект, игнорируется
   * @param {array|} param - строка как значение третьей колонки, если первый аргумент массив или объект, игнорируется
   * @return {Debugger}
   */
  add(...param) {
    const [key, value, comment = ''] = param;

    if (Array.isArray(key)) { this.addAsArray(key); return this;}
    if (typeof key === 'object') { this.addAsObject(key); return this;}

    this.data.set(key, {key, value, comment});
    this.dataArr.push(f.replaceTemplate('${key}: ${value} ${comment}', this.data.get(key)));
    return this;
  }
  addAsArray(arr) {
    arr.forEach(i => this.add(...i));
    return this;
  }
  addAsObject(obj) {
    Object.entries(obj).forEach(([k, v]) => this.add(k, v));
    return this;
  }

  getTable() {
    console.table([...this.data.values()]);
  }

  getObject() {
    return this.data;
  }

  show() {
    const node = this.getWrap();
    node.innerHTML = this.dataArr.map(i => `<div>${i}</div>`).join('');

    document.body.append(node);
  }

  getWrap() {
    const node = document.createElement('div'),
          btn = document.createElement('input');
    node.style.cssText = 'position: fixed; left: 0; right: 0; bottom: 0; background: white';

    btn.type = 'button';
    btn.value = 'x';
    btn.addEventListener('click', () => node.remove());

    node.append(btn);
    return node;
  }

  getTemplate() {
    return `<div style=""></div>`;
  }
}
