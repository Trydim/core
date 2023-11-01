'use strict';

import Events from './events';

class Orders extends Events {
  constructor() {
    super();

    // Delay for hooks
    setTimeout(() => this.init(), 0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.OrdersInstance = new Orders();
});
