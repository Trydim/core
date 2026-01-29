'use strict';

import Table  from './tableView/Table';
import Kanban from './kanban/Kanban';

const storage = new f.LocalStorage();

class Orders {
  /**
   * @type {'table' | 'kanban'}
   */
  selectedView = 'table'; // table|kanban
  /**
   * @type {Table | Kanban | object}
   */
  viewInstance = {init() {}, unmounted() {}};

  constructor() {
    if (storage.has('orderView')) {
      this.selectedView = storage.get('orderView');
    } else {
      storage.set('orderView', this.selectedView);
    }

    this.onEvent(); // тоже нужна задержка для хуков
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
    // Kanban is not available
    if (!inputs.length) this.actionBtn({value: 'table'});

    inputs.forEach((input) => {
      input.onclick = (e) => this.actionBtn(e.target);
      if (input.value === this.selectedView) input.click();
    });
  }

  actionBtn(target) {
    this.selectedView = target.value;
    this.switchView();

    storage.set('orderView', this.selectedView);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.OrdersInstance = new Orders();
});
