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
    return this;
  },

  changeTextInput(e) {
    if (e.target.value.length === 0) return;
    else if (e.target.value.length <= 2) { e.target.value = 'Ошибка Названия'; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeNumberInput(e) {
    if (isNaN(e.target.value)) { e.target.value = 0; return; }
    this.queryParam[e.target.name] = e.target.value;
  },
  changeMoneyInput(e, nodePercent, nodeOutput) {
    this.changeNumberInput(e);

    nodeOutput.value = +e.target.value * ( 1 + +nodePercent.value / 100);
    this.queryParam[nodeOutput.name] = nodeOutput.value;
  },
  changeOutputPercent(e, nodeInputM, nodeMoney) {
    this.changeNumberInput(e);

    nodeMoney.value = +nodeInputM.value * ( 1 + +e.target.value / 100);
    this.queryParam[nodeMoney.name] = nodeMoney.value;
  },
  changeMoneyOutput(e, nodeInputM, nodePercent) {
    this.changeNumberInput(e);

    nodePercent.value = (+e.target.value / +nodeInputM.value - 1) * 100;
    this.queryParam[nodePercent.name] = nodePercent.value;
  },
  changeCheckInput(e) {
    this.queryParam[e.target.name] = e.target.checked;
  },
  changeParentSection(e) {
    this.queryParam.sectionParentId = e.target.value;
    this.reloadAction.sectionId = e.target.value;
  },

}
