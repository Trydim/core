'use strict';

export const data = {
  managerFields: {},

  managerFieldTypes: [
    {id: 'text', name: 'Текст (~200 символов)'},
    {id: 'textarea', name: 'Текст (много)'},
    {id: 'number', name: 'Число'},
    {id: 'date', name: 'Дата'},
  ],
}

export const watch = {}

export const computed = {}

export const methods = {
  addCustomField() {
    const rand = 'cf' + ((Math.random() * 1e8) | 0);
    this.managerFields[rand] = {name: 'Поле-' + rand, type: 'text'};
  },
  removeCustomField(id) {
    delete this.managerFields[id];
    delete this.user[id];
  },
}
