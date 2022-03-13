'use strict';

/*export default class {
  constructor() {

    Object.defineProperty(this, 'firstKey', {
      get() {
        return this.keys[0];
      }
    });

    Object.defineProperty(this, 'keys', {
      get() {
        return this.length ? Object.keys(this) : this;
      }
    });

    Object.defineProperty(this, 'first', {
      get() {
        return this.values[0];
      }
    });

    Object.defineProperty(this, 'values', {
      get() {
        return this.length ? Object.values(this) : this;
      }
    });
  }

  /!**
   *
   * @param {string} key
   * @param {boolean} strict
   * @return {object}
   *!/
  hasKey(key, strict = false) {
    return strict ? this.keys.find(k => k === key)
                  : this.keys.includes(key);
  }

  /!**
   *
   * @param {string} key
   * @param value
   * @param {boolean} strict
   *!/
  hasValues(key, value, strict = false) {
    return this.length && strict ? this.values.find(v => v[key] === value)
                                 : this.values.find(v => v[key].includes(value));
  }
}*/
