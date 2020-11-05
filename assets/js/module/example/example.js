'use strict';

import {f} from '../../main.js';

export const example = {
  form: new FormData(),

  queryParam: {
    dbAction: '',
  },

  init() {
    this.form.set('mode', 'DB');

    return this;
  },

  query() {

    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1]);
    })

    f.Post({data: this.form}).then(data => {

    });
  },
}
