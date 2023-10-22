<template>
  <Accordion style="min-width: 78vw">
    <AccordionTab :header="prop.name">
      <div ref="table"></div>
    </AccordionTab>
  </Accordion>
</template>

<script>

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

export default {
  name: 'property-table',
  components: {Accordion, AccordionTab},
  props: {
    prop: {
      required: true,
      type: Object,
    },
    dealer: {
      required: true,
      type: Object,
    },
  },
  emits: ['changed'],
  data() {
    const self = this,
          prop = this.dealer.settings[this.prop.code];

    return {
      handsontable: undefined,

      config: {
        data: prop && prop.length ? prop : [new Array(this.prop.columns.length).fill('')],

        rowHeaders   : true,
        dropdownMenu : true,
        columnSorting: false,
        manualColumnResize: true,
        manualRowResize   : true,
        stretchH          : 'all',
        width             : '100%',
        height            : 'auto',
        licenseKey        : 'non-commercial-and-evaluation',

        contextMenu: {
          items: {
            "row_above" : {name: 'Добавить строку выше'},
            "row_below" : {name: 'Добавить строку ниже'},
            "hsep1"     : "---------",
            "remove_row": {name: 'Удалить строку'},
            "hsep2"     : "---------",
            "undo"      : {name: 'Отменить'},
            "redo"      : {name: 'Вернуть'}
          },
        },

        // Перебор всех ячеек
        cells(row, col) {
          if (row === 0 || this.hasOwnProperty('readOnly')) return; // Первую строку пропускаем
          const cell = this.instance.getDataAtCell(row, col), res = {readOnly: false};

          if (!cell) return res;

          res.readOnly = /^(c_|d_)/i.test(cell);
          if (['+', '-'].includes(cell)) {
            res.type = 'checkbox';
            res.checkedTemplate   = '+';
            res.uncheckedTemplate = '-';
          }
          /*else if (/#([a-fA-F]|\d){3,6}/.test(cell)) {
            res.type = 'color-picker';
          }*/
          else res.type = isFinite(+(cell.toString().replace(',', '.'))) ? 'numeric' : 'text';

          return res;
        },

        colHeaders: this.prop.columns.map(h => window._(h)),

        afterChange(changes) {
          if (changes) {
            for (const [row, column, oldValue, newValue] of changes) {
              if (oldValue !== newValue) {
                self.emit();
                !this.tableChanged && (this.tableChanged = true);
              }
            }
          }
        },

        afterCreateRow() { self.changeRowCol(this) },
        afterRemoveRow() { self.changeRowCol(this) },
      },
    };
  },
  methods: {
    emit() {
      this.dealer.settings[this.prop.code] = this.handsontable.getData();
      this.$emit('changed');
    },

    changeRowCol(that) {
      !that.tableChanged && (that.tableChanged = true) && this.emit();
    },
  },
  mounted() {
    this.handsontable = new window.Handsontable(this.$refs.table, this.config);
  },
}

</script>
