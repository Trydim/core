'use strict';

import Table  from './tableView/Table';
import Kanban from './kanban/Kanban';

const storage = new f.LocalStorage();

class Orders {
  selectedView = 'table'; // table|kanban

  viewInstance = {};

  constructor() {
    if (storage.has('orderView')) {
      this.selectedView = storage.get('orderView');
    } else {
      storage.set('orderView', this.selectedView);
    }

    this.onEvent();
  }

  switchView() {
    this.viewInstance.unmounted && this.viewInstance.unmounted();

    switch (this.selectedView) {
      default: case 'table':
        this.viewInstance = new Table();
        break;
      case 'kanban':
        this.viewInstance = new Kanban();
        break;
    }

    setTimeout(() => this.viewInstance.init(), 0); // Delay for hooks
  }

  onEvent() {
    const inputs = f.qA('.header input[data-action]');

    inputs.forEach((input) => {
      input.onclick = (e) => this.actionBtn(e);
      if (input.value === this.selectedView) input.click();
    });
  }

  actionBtn(e) {
    let target = e.target;

    //if (this.selectedView === target.value) return;

    this.selectedView = target.value;
    this.switchView();

    storage.set('orderView', this.selectedView);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.OrdersInstance = new Orders();
});
