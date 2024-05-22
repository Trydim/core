const dataArchive = {
  data: [],

  add(data, config) {
    this.data.push(JSON.stringify({data, config}));
    if (this.data.length > 50) this.data.shift();
  },

  restore(app) {
    if (!this.data.length) return;

    const item = JSON.parse(this.data.pop());

    app.contentData = item.data;
    if (item.config) {
      app.contentConfig = item.config;
      app.mergeData();
    }
  }
};


const getCellKey = (i, j) => `s${i}x${j}`;

export default {
  mergeData() {
    const config = this.contentConfig,
          props  = this.contentProperties,
          defaultRow = config[0],
          res    = {s0: {}}; // первый спойлер, если будет только один не отображать

    let spoilerKey = 's0';

    this.contentData.forEach((csvRow, rowI) => {
      const xRow = config[rowI] ? config[rowI] : defaultRow;

      if (xRow[0].type === 'spoiler') {
        spoilerKey = xRow[0].name;
        res[spoilerKey] = {};
        return;
      }
      if (csvRow.join('').length === 0) return;

      res[spoilerKey][rowI] = csvRow.reduce((cR, csvCell, cellI) => {
        const defParam = defaultRow[cellI],
              param    = xRow[cellI],
              isInherit = param.type === 'inherit';
        // Only a column can be hidden
        if ((rowI === 0 && param.type === 'hidden') || defParam.type === 'hidden') return cR;
        // simpleList
        if (props[param.type]) param.props = props[param.type][param.list];

        cR[cellI] = {
          rowI, cellI,
          value: csvCell,
          param: isInherit ? defParam : param,
        };

        return cR;
      }, {});

      this.itemSpoiler[spoilerKey] = Object.keys(res[spoilerKey]).length;
    });

    if (Object.keys(res).length === 1) {
      this.showSpoiler = false;
      this.openSpoiler.s1 = true;
      this.itemSpoiler.s1 = this.itemSpoiler.s0;
      res.s1 = {...res.s0};
      delete res.s1[0]; // Удалить шапку
    }

    this.mergedData = res;
  },

  checkSelectedCell(i, j) { return this.selectedCells.hasOwnProperty(getCellKey(i, j)) },

  toggleSpoiler(s) { this.openSpoiler[s] = !this.openSpoiler[s] },

  selectRow(e, spoiler, i) {
    this.contextMenuPosition = e.target.getBoundingClientRect();
    this.selected.spoiler = spoiler;
    this.selected.row     = i;
  },
  removeRow() {
    const s = this.selected;

    dataArchive.add(this.contentData, this.contentConfig);
    this.contentData.splice(s.row, 1);
    this.contentConfig.splice(s.row, 1);
    this.mergeData();
  },
  addRow(position) {
    const s = this.selected,
          start = +s.row + (position === 'after' ? 1 : 0),
          config = new Array(this.columns).fill({type: 'inherit'});

    dataArchive.add(this.contentData, this.contentConfig);
    this.contentData.splice(start, 0, this.contentData[s.row]);
    this.contentConfig.splice(start, 0, config);
    this.mergeData();
  },

  selectCell(e, cell) {
    if (cell.param.type === 'customEvent') return;

    const key = getCellKey(cell.rowI, cell.cellI);

    this.focusedCell = cell;

    if (e.metaKey || e.ctrlKey) {
      if (this.selectedCells[key]) delete this.selectedCells[key];
      else this.selectedCells[key] = cell;
    }
  },
  clearSelected() { this.selectedCells = {} },
  startSelect(e, cell) {
    //this.startCell = getCellKey(cell.rowI, cell.cellI);

    // Если отпустил в любом другом месте прекратить выделение
  },
  stopSelect(e, cell) {
    /*if (this.startCell === getCellKey(cell.rowI, cell.cellI)) {
     this.startCell = undefined;
     return;
     }*/
  },

  /**
   * @param {{type: 'set'|'change', value: string, valueType: 'absolute'|'relative'}} c
   */
  applyChange(c) {
    if (c.value.toString() === '') { f.showMsg('Введите значение', 'error'); return; }
    if (!Object.keys(this.selectedCells).length) { f.showMsg('Ничего не выбрано', 'error'); return; }

    dataArchive.add(this.contentData);

    Object.values(this.selectedCells).forEach(cell => {
      const i = cell.rowI,
            j = cell.cellI;

      if (c.type === 'set') {
        cell.value = this.contentData[i][j] = c.value;
      } else {
        let cV = cell.value,
            nV = c.value,
            result;

        if (isFinite(cV) || cell.param.type === 'number') {
          result = c.valueType === 'absolute' ? +cV + +nV
                                              : +cV * (1 + +nV / 100);
        }

        cell.value = this.contentData[i][j] = result;
      }
    });
  },
  undoChanges() {
    dataArchive.restore(this);
  },
}
