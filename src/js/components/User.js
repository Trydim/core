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
    this.data.fields = JSON.parse(this.data.fields || '{}');

    this.setSettings();

    node.remove();
  }

  setSettings() {
    if (f.INIT_SETTING) {
      let interval,
          applySetting = () => {
        if (f.cmsSetting) {
          Object.entries(f.cmsSetting).forEach(([id, setting]) => {
            if (this.data.fields[id] !== undefined) {
              this.data.fields[id] = {value: this.data.fields[id], ...setting};
            }
          });
          clearInterval(interval);
        }
      }

      if (f.cmsSetting) applySetting();
      else interval = setInterval(applySetting, 90);
      setTimeout(() => clearInterval(interval), 300);
    }
  }

  get() {
    return this.data;
  }
}
