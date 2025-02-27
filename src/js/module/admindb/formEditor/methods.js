const dataArchive = {
  data: [],

  add(contentData, mergedData, config) {
    this.data.push(JSON.stringify({contentData, mergedData, config}));
    if (this.data.length > 50) this.data.shift();
  },

  restore(app) {
    if (!this.data.length) return;

    const item = JSON.parse(this.data.pop());

    app.contentData = item.contentData;

    if (item.config) {
      app.contentConfig = item.config;
      app.mergeData();
    } else {
      app.mergedData  = item.mergedData;
    }
  }
};

const getCellKey = (i, j) => `s${i}x${j}`;

export default {
  addArchive() { dataArchive.add(this.contentData, this.mergedData) },
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
  calcColumnsWidth() {
    Object.values(this.header).forEach((header, index) => {
      if (index === 0) return;

      let columnI  = this.contentData[0].indexOf(header.value),
          maxWidth = -1;

      for (const row of this.contentData) {
        if (maxWidth > 50) {maxWidth = 50; break;}
        maxWidth = Math.max(maxWidth, row[columnI].toString().length);
      }

      this.columnWidths.push(maxWidth);
    });
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

    dataArchive.add(this.contentData, this.mergedData, this.contentConfig);
    this.contentData.splice(s.row, 1);
    this.contentConfig.splice(s.row, 1);
    this.mergeData();
  },
  addRow(position) {
    const s = this.selected,
          start = +s.row + (position === 'after' ? 1 : 0),
          config = new Array(this.columns).fill({type: 'inherit'});

    dataArchive.add(this.contentData, this.mergedData, this.contentConfig);
    this.contentData.splice(start, 0, [...this.contentData[s.row]]);
    this.contentConfig.splice(start, 0, config);
    this.mergeData();
  },

  selectCell(e, cell, doubleClick = false) {
    if (cell.param.type === 'customEvent') return;

    const key = getCellKey(cell.rowI, cell.cellI);

    this.focusedCell = cell;

    if (e.metaKey || e.ctrlKey || doubleClick) {
      if (this.selectedCells[key]) delete this.selectedCells[key];
      else this.selectedCells[key] = cell;
    }
  },
  clearSelected() { this.selectedCells = {} },
  startTouch(e, cell) {
    this.startTouch = new Date().getTime();
    this.startCell = getCellKey(cell.rowI, cell.cellI);

    // Если отпустил в любом другом месте прекратить выделение
  },
  stopTouch(e, cell) {
    if (new Date().getTime() - this.startTouch > 1000) {
      const key = getCellKey(cell.rowI, cell.cellI);

      if (this.selectedCells[key]) delete this.selectedCells[key];
      else this.selectedCells[key] = cell;
    }
  },
  startSelect(e, cell) {
    this.startCell = {rowI: cell.rowI, cellI: cell.cellI};

    // Если отпустил в любом другом месте прекратить выделение
  },
  moveSelect(e, cell, sKey) {
    if (!this.startCell) return;

    const sCell = this.startCell,
          rowI  = cell.rowI,
          cellI = cell.cellI;

    this.selectedCells = {};

    let i  = Math.min(sCell.rowI, rowI),
        sJ = Math.min(sCell.cellI, cellI), j = sJ,
        lI = Math.abs(rowI - sCell.rowI) + i,
        lJ = Math.abs(cellI - sCell.cellI) + j;

    for (; i <= lI; i++) {
      for (j = sJ; j <= lJ; j++) {
        const key = getCellKey(i, j);

        if (this.mergedData[sKey][i] && this.mergedData[sKey][i][j]) {
          this.selectedCells[key] = this.mergedData[sKey][i][j];
        }
      }
    }
  },
  stopSelect(e, cell) {
    const sCell = this.startCell,
          rowI  = cell.rowI,
          cellI = cell.cellI;

    if (sCell && sCell.rowI === rowI && sCell.cellI === cellI) this.selectedCells = {};

    this.selectedCells[getCellKey(rowI, cellI)] = cell;
    this.startCell = undefined;
  },

  inputKeyDown(e, i, j) {
    if (e.key !== 'Enter') return;

    const key = `cell${+i + 1}x${j}`;

    if (this.$refs[key]) this.$refs[key][0].$el.focus();
  },

  /**
   * @param {{type: 'set'|'change', value: string, valueType: 'absolute'|'relative', fraction: number}} c
   */
  applyChange(c) {
    if (c.value.toString() === '') { f.showMsg('Введите значение', 'error'); return; }
    if (!Object.keys(this.selectedCells).length) { f.showMsg('Ничего не выбрано', 'error'); return; }

    this.addArchive();

    Object.values(this.selectedCells).forEach(cell => {
      const i = cell.rowI,
            j = cell.cellI;

      if (c.type === 'set') {
        cell.value = this.contentData[i][j] = c.value;
      } else {
        let cV = (cell.value || '').toString().replace(',', '.'),
            nV = c.value,
            result;

        if (isFinite(+cV) || cell.param.type === 'number') {
          if (c.valueType === 'absolute') result = +cV + +nV;
          else if (c.valueType === 'relative') result = +cV * (1 + +nV / 100);
          else result = +cV * +nV;

          result = result.toFixed(c.fraction);
        }

        cell.value = this.contentData[i][j] = result;
      }
    });
  },
  undoChanges() {
    dataArchive.restore(this);
    // Reselect cells
    Object.keys(this.selectedCells).forEach((key) => {
      const [i, j] = key.slice(1).split('x');

      Object.values(this.mergedData).forEach(spoiler => {
        if (spoiler[i] && spoiler[i][j]) this.selectedCells[key] = spoiler[i][j];
      })
    });
  },
}


function calculateColumnWidths(data, maxWidth) {
  const columnCount = data[0].length;
  const columnWidths = new Array(columnCount).fill(0);

  // Определение максимальной ширины для каждой колонки
  for (const row of data) {
    row.forEach((cell, index) => {
      columnWidths[index] = Math.max(columnWidths[index], cell.toString().length);
    });
  }

  // Подсчет общей ширины колонок
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  // Нормализация ширины, если необходимо
  if (totalWidth > maxWidth) {
    const scaleFactor = maxWidth / totalWidth;
    for (let i = 0; i < columnWidths.length; i++) {
      columnWidths[i] = Math.floor(columnWidths[i] * scaleFactor);
    }
  }

  return columnWidths;
}
