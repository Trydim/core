
// TODO сохранять в сессии потом, что бы можно было перезагрузить страницу
import {orders} from "./orders";

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
    f.observer.add(this.constructor.name, this);
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

  // выбор заказа
  clickRows(e) {
    let input = e.target.closest('tr').querySelector('input'),
        id = input.dataset.id;
    input !== e.target && (input.checked = !input.checked);
    input.checked ? this.addSelectedId(id) : this.deleteSelectedId(id);
    //this.checkBtnRows();
    console.log(this.getSelectedList());
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

  onTableEvent() {
    this.table.onclick = (e) => this.clickRows(e);
  }
}
