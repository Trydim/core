'use strict';

import {Section} from "./Section";
import {Elements} from "./Elements";
import {Options} from "./Options";

export const catalog = {
  init() {
    const db = {
      units: JSON.parse(f.qS('#dataUnits').value),
      money: JSON.parse(f.qS('#dataMoney').value),
    };
    const tmp = {
      tHead: f.gT('#itemsTableHead'),
      checkbox: f.gT('#itemsTableRowsCheck'),
    }

    this.section = new Section();
    this.elements = new Elements({db, tmp});
    this.options = new Options({db, tmp});

    //new f.SortColumns(this.table.querySelector('thead'), this.query.bind(this), this.queryParam);
    this.section.loadSection();

    setTimeout(() => {
      document.querySelector("#sectionField [data-id='9']").click();
      document.querySelector("#sectionField > div.controlWrap > input:nth-child(2)").click();

      setTimeout(() => {
        this.elements.id.addSelectedId('241');
        document.querySelector("#elementsField > div.mt-1.controlWrap > input:nth-child(2)").click();
      }, 500);

    }, 500);
    return this;
  },
}
