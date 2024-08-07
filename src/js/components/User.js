'use strict';

export default class User {
  constructor(selector = '#dataUser') {
    if (!selector) return {};

    let node = typeof selector === 'string' ? f.qS(selector) : selector,
        data;

    if (typeof User.instance === 'object') return User.instance;
    if (!node || !node.value) {
      console.warn('class User node or value not found!');
      return {};
    }

    data = JSON.parse(node.value);
    data.fields = JSON.parse(data.fields || '{}');
    data.permission = data.permission || {tags: ''};

    if (typeof data.permission === 'object' && typeof data.permission.tags === 'string') {
      data.tags = data.permission.tags.split(' ').map(t => t.trim().toLowerCase()) || [];
    }

    this.data = data;
    this.setSettings();

    User.instance = this;
    node.remove();
  }

  setSettings() {
    if (f.INIT_SETTING) {
      let interval,
          applySetting = () => {
        Object.entries(f.CMS_SETTING).forEach(([id, setting]) => {
          if (this.data.fields[id] !== undefined) {
            this.data.fields[id] = {value: this.data.fields[id], ...setting};
          }
        });

        clearInterval(interval);
      }

      if (f.CMS_SETTING) applySetting();
      else interval = setInterval(applySetting, 90);
      setTimeout(() => clearInterval(interval), 300);
    }
  }

  /**
   *
   * @param {string|'id'|'isAdmin'|'permission'|'tags'|'dealer'|'dealerSetting'} key
   * @return {*}
   */
  get(key) {
    return this.data[key];
  }

  getDealerSettings(prop) {
    if (!f.IS_DEAL) return false;

    return this.data.dealer.settings[prop];
  }

  /**
   * @param {string} tag
   * @return {boolean}
   */
  haveTags(tag) {
    return (this.data.tags || '').includes(tag.toLowerCase());
  }
}
