// TODO сохранять в сессии потом, что бы можно было перезагрузить страницу

class SelectedId {
  constructor(key) {
    this.key = key;
    this.id = new Set();
  }

  add(id) {
    if (!Array.isArray(id)) id = [id];
    id.forEach(id => this.id.add(id));
    this.fire();
    return this;
  }

  delete(id) {
    this.id.delete(id);
    this.fire();
    return this;
  }

  clear() {
    this.id = new Set();
    this.fire();
    return this;
  }

  get size() {
    return this.id.size;
  }

  getAsArray() {
    let ids = [];
    for (let id of this.id.values()) ids.push(id);
    return ids;
  }

  forEach(func) {
    this.id.forEach(func);
  }

  fire() {
    this.timeOut && clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      clearTimeout(this.timeOut);
      f.observer.fire(this.key, this.getAsArray(), this.size);
    }, 10);
  }
}

export class SelectedRow {
  /**
   * @param {object} param
   * @param {HTMLElement} param.table
   */
  constructor(param) {
    let {
      table = f.qS('#table'),
      //selectedField = f.qS('#')
    } = param;


    if (!table) return;
    this.table = table;
    this.observerKey = 'selected' + (Math.random() * 10000 | 0);
    this.setSelectedId();
    this.onTableMutator();
    this.onTableEvent();
    f.observer.addArgument(this.observerKey, this);
  }

  setSelectedId() {
    this.selectedId = new SelectedId(this.observerKey);
  }
  clear() {
    this.checkedRows(false);
    this.selectedId.clear();
  }
  add(id) {
    this.selectedId.add(id);
    return this;
  }
  remove(id) {
    this.selectedId.delete(id);
    return this;
  }

  // Observer func
  /**
   * @return {string} - use observerKey in fire function as name
   */
  getObserverKey() {
    return this.observerKey;
  }
  /**
   * @param {function(string[], int, , SelectedRow)} func - fired function(selectedIds, count, any, SelectedRow)
   *
   * @param {any} arg - add argument
   */
  subscribe(func, ...arg) {
    f.observer.subscribe(this.observerKey, (selectedIds, b, c) => func(selectedIds, b, ...arg, c));
  }

  getSelected() {
    return this.selectedId.getAsArray();
  }
  getSelectedSize() {
    return this.selectedId.size;
  }

  // Выделить выбранные строки
  checkedRows(check = true) {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      input && (input.checked = check);
    });
  }

  checkedAll() {
    this.table.querySelectorAll(`input[data-id]`)
        .forEach(i => {
          this.add(i.dataset.id);
          i.checked = true;
        });
  }

  /**
   * @param {string|id} id
   * @param {boolean} check
   * @return {SelectedRow}
   */
  checkedById(id, check = true) {
    let input = this.table.querySelector(`input[data-id="${id}"]`);
    input && (input.checked = check);
    this.remove(id);
    return this;
  }

  handle() {
    this.checkedRows();
  }

  onTableMutator() {
    const observer = new MutationObserver(this.handle.bind(this));

    observer.observe(this.table, {
      childList: true,
      subtree: true,
    });
  }

  // Event function
  mouseOver(e) {
    let tr = e.target.closest('tr');
    if (e.buttons) tr.classList.add('mouseSelected');
    else if (tr.classList.contains('mouseSelected')) tr.classList.remove('mouseSelected')
  }
  mouseDown(e) {
    let tr = e.target.closest('tr');
    this.startClick = tr && tr.rowIndex;
  }
  mouseUp(e) {
    let tr = e.target.closest('tr');
    if (!tr) return;
    let finishClick = tr.rowIndex,
        start = Math.min(this.startClick, finishClick),
        finish = Math.max(this.startClick, finishClick);

    for (let i = start; i <= finish; i++) {
      let input = this.table.rows[i].querySelector('input'),
          id = input && input.dataset.id;

      if (!input || !id) return;
      input.checked = !input.checked;
      input.checked ? this.add(id) : this.remove(id);
    }

    delete this.startClick;
    this.table.querySelectorAll('.mouseSelected')
        .forEach(tr => tr.classList.remove('mouseSelected'));
  }

  // Bind event
  onTableEvent() {
    this.table.addEventListener('mouseover', e => this.mouseOver(e));
    this.table.addEventListener('mousedown', e => this.mouseDown(e));
    this.table.addEventListener('mouseup', e => this.mouseUp(e));
    this.table.addEventListener('click', e => e.preventDefault());
  }
}
