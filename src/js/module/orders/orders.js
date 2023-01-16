'use strict';

import Events from './events';

class Orders extends Events {
  constructor() {
    super();

    // Delay for hooks
    setTimeout(() => this.init(), 500);
  }
}

window.OrdersInstance = new Orders();
