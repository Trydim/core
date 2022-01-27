'use strict';

export default class {
  constructor(selector = '#dataUser') {
    if (!selector) return {};

    const node = typeof selector === 'string' ? f.qS(selector) : selector;
    if (!node || !node.value) {
      console.warn('class User node or value not found!');
      return {};
    }

    this.data = JSON.parse(node.value);
    this.data.contacts = JSON.parse(this.data.contacts);

    this.setSettings();

    node.remove();
  }

  setSettings() {
    if (f.INIT_SETTING) {
      const interval = setInterval(() => {
        if (f.cmsSetting) {
          Object.entries(f.cmsSetting).forEach(([id, setting]) => {
            this.data.contacts[id] && (this.data.contacts[id] = {
              value: this.data.contacts[id], ...setting,
            });
          });
          clearInterval(interval);
        }
      }, 80);
      setTimeout(() => clearInterval(interval), 300);
    }
  }

  get() {
    return this.data;
  }
}
