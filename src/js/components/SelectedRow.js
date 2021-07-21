
// TODO сохранять в сессии потом, что бы можно было перезагрузить страницу

export class SelectedRow {
  constructor(param) {
    let {
          table = f.qS('#table'),
        } = param;

    if (!table) return;

    this.table = table;
    this.dataset = this.table.dataset || {type: 'one'};
    this.initTable();
    this.onTableEvent();
    f.observer.addArgument(this.dataset.type, this);
  }

  initTable() {
    this.selectedId = Object.create(null);
    this.clear();
  }

  checkSelected() {
    !this.selectedId[this.dataset.type] && this.clear();
  }
  clear() {
    this.selectedId[this.dataset.type] = new Set();
  }
  addSelectedId(id) {
    this.checkSelected();
    this.selectedId[this.dataset.type].add(id);
  }
  deleteSelectedId(id) {
    this.selectedId[this.dataset.type].delete(id);
  }

  getSelectedList() {
    let ids = [];
    for (let id of this.selectedId[this.dataset.type].values()) ids.push(id);
    return ids;
  }
  getSelectedSize() {
    return this.selectedId[this.dataset.type].size;
  }



  /* Кнопки показать скрыть
   checkBtnRows() {
   if (this.selectedId.size === 1) f.show(this.btnOneOrderOnly);
   else f.hide(this.btnOneOrderOnly);
   if (this.selectedId.size > 0) f.show(this.btnMoreZero);
   else f.hide(this.btnMoreZero);
   },*/

  // Выделить выбранные Заказы
  checkedRows() {
    this.checkSelected();
    this.selectedId[this.dataset.type].forEach(id => {
      let input = this.table.querySelector(`input[data-id="${id}"]`);
      if (input) input.checked = true;
    });
  }

  // Event function

  /*// выбор заказа
  clickRows(e) {
    let tr = e.target.closest('tr'),
        input = tr && tr.querySelector('input'),
        id = input && input.dataset.id;

    if (!tr || !input || !id) return;
    input !== e.target && (input.checked = !input.checked);
    input.checked ? this.addSelectedId(id) : this.deleteSelectedId(id);
    //this.checkBtnRows();
    console.log(this.getSelectedList());
  }*/

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

    console.log(this.getSelectedList());
    delete this.startClick;
  }

  // Bind event
  onTableEvent() {
    //this.table.onclick = (e) => this.clickRows(e);
    this.table.addEventListener('mousedown', (e) => this.mouseDown(e));
    this.table.addEventListener('mouseup', (e) => this.mouseUp(e));
    this.table.addEventListener('click', (e) => e.preventDefault());
  }
}
