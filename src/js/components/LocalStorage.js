"use strict";

export default class {
  constructor() {
    this.lKeys = new Set(Object.keys(localStorage));

    Object.defineProperty(this, 'length',
      { get: () => localStorage.length, });
  }

  set(key, value, force = true) {
    const has = this.has(key);

    if (typeof value !== 'string') value = value.toString();

    if (has && force || !has) {
      localStorage.setItem(key, value);
      return this;
    } else {
      return false;
    }
  }

  has(key) { return !!this.get(key); }
  get(key) { return localStorage.getItem(key); }
  remove(key) { localStorage.removeItem(key); return this; }
}
