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

  /**
   * Over set viewInstance methods after switch views
   * @type {function}
   * @param {Table | Kanban} viewInstance
   */
  overSetViewMethods = (viewInstance) => viewInstance;

  /**
   * @type {function}
   * @param {Table | Kanban} viewInstance
   */
  onMountedView(viewInstance) {};


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
    // Delay for hooks
    setTimeout(() => {
      if (this.overSetViewMethods) this.overSetViewMethods(this.viewInstance);

      this.viewInstance.init();
      this.onMountedView(this.viewInstance);
    }, 0);
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
