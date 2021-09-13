// TODO сохранять в сессии потом, что бы можно было перезагрузить страницу

export class SelectedRow {
  constructor(param) {
    let {
      table = f.qS('#table'),
      //selectedField = f.qS('#')
    } = param;
    if (!table) return;

    this.table = table;
    this.selectedId = new Set();
    this.onTableMutator();
    this.onTableEvent();
    f.observer.addArgument(param.type || 'selectedRow', this);
  }

  clear() {
    this.checkedRows(false);
    this.selectedId = new Set();
  }
  addSelectedId(id) {
    this.selectedId.add(id);
  }
  deleteSelectedId(id) {
    this.selectedId.delete(id);
  }

  getSelected() {
    let ids = [];
    for (let id of this.selectedId.values()) ids.push(id);
    return ids;
  }
  getSelectedSize() {
    return this.selectedId.size;
  }

  // Выделить выбранные Заказы
  checkedRows(check = true) {
    this.selectedId.forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      input && (input.checked = check);
    });
  }

  checkedAll() {
    this.table.querySelectorAll(`input[data-id]`)
        .forEach(i => {
          this.addSelectedId(i.dataset.id);
          i.checked = true;
        });
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
      input.checked ? this.addSelectedId(id) : this.deleteSelectedId(id);
    }

    f.observer.fire('selectedRow', this.getSelected(), this.getSelectedSize());
    delete this.startClick;
    this.table.querySelectorAll('.mouseSelected')
        .forEach(tr => tr.classList.remove('mouseSelected'));
  }

  // Bind event
  onTableEvent() {
    this.table.addEventListener('mouseover', (e) => this.mouseOver(e));
    this.table.addEventListener('mousedown', (e) => this.mouseDown(e));
    this.table.addEventListener('mouseup', (e) => this.mouseUp(e));
    this.table.addEventListener('click', (e) => e.preventDefault());
  }
}
