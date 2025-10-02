<template>
  <div class="diff-wrapper">
    <div class="toggle-row">
      <label>
        <input type="checkbox" class="form-check-input" v-model="showOnlyChanges" />
        {{ $t('Show only changed rows') }}
      </label>
      <label class="ms-4">
        <input type="checkbox" class="form-check-input" v-model="showOnlyChangedColumns" />
        {{ $t('Show only changed columns') }}
      </label>
      <label class="ms-4">
        <input type="checkbox" class="form-check-input" v-model="syncScroll" />
        {{ $t('Synchronize scrolling') }}
      </label>
    </div>

    <div class="tables-row">
      <TableSide ref="tPrev"
        side="left"
        :columns="filteredColumns"
        :rows="filteredFilteredRows"
        :sideLabel="$t('Previous version')"
        :meta="diff?.previousMeta"
        @scroll="onSyncScroll(tPrev, tCurrent)"
      />
      <TableSide ref="tCurrent"
        side="right"
        :columns="filteredColumns"
        :rows="filteredFilteredRows"
        :sideLabel="$t('Current version')"
        :meta="diff?.currentMeta"
        @scroll="onSyncScroll(tCurrent, tPrev)"
      />
    </div>
  </div>
</template>

<script>
import TableSide from './TableSide.vue';

export default {
  components: { TableSide },
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showOnlyChanges: false,
      showOnlyChangedColumns: false,
      syncScroll: true,
      normalStatuses: new Set(['normal', 'empty', 'line-number']),

      tPrev   : undefined,
      tCurrent: undefined,
    };
  },
  computed: {
    filteredRows() {
      if (!this.showOnlyChanges) return this.diff.rows;

      return this.diff.rows.filter(row =>
        row.left.some(cell => !this.normalStatuses.has(cell.status)) ||
        row.right.some(cell => !this.normalStatuses.has(cell.status))
      );
    },
    visibleColumnIndexes() {
      if (!this.showOnlyChangedColumns) {
        // Показываем все индексы
        return this.diff.columns.map((_, i) => i);
      }

      const colCount = this.diff.columns.length;
      const columnsHasChanges = new Array(colCount).fill(false);

      for (const row of this.filteredRows) {
        for (let c = 1; c < colCount; c++) { // начиная с 1, чтобы не трогать первый столбец
          if (
            !this.normalStatuses.has(row.left[c]?.status) ||
            !this.normalStatuses.has(row.right[c]?.status)
          ) {
            columnsHasChanges[c] = true;
          }
        }
      }

      // Всегда добавляем 0-й столбец — номер строки
      const visible = columnsHasChanges
        .map((hasChange, idx) => (hasChange ? idx : -1))
        .filter(idx => idx !== -1);
      if (!visible.includes(0)) visible.unshift(0);

      return visible;
    },
    filteredColumns() {
      return this.visibleColumnIndexes.map(i => this.diff.columns[i]);
    },
    filteredFilteredRows() {
      return this.filteredRows.map(row => ({
        left: this.filterRowByColumns(row.left),
        right: this.filterRowByColumns(row.right)
      }));
    }
  },
  methods: {
    filterRowByColumns(rowCells) {
      return this.visibleColumnIndexes.map(idx => rowCells[idx]);
    },

    onSyncScroll(source, target) {
      if (!this.syncScroll) return;

      target.scrollTop  = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
    },
  },
  mounted() {
    this.tPrev    = this.$refs.tPrev.$el;
    this.tCurrent = this.$refs.tCurrent.$el;
  },
};
</script>

<style lang="scss" scoped>
@import './../../../../css/mixin/functions.scss';

.diff-wrapper {
  padding: rem(10);
  overflow: visible;
}

.toggle-row {
  margin-bottom: rem(10);
  display: flex;
  align-items: center;

  label {
    user-select: none;
  }
}

.tables-row {
  display: flex;
  gap: rem(20);
  height: calc(100vh - 150px);
  align-items: flex-start;
}
</style>
