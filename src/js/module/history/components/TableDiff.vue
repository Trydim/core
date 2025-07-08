<template>
  <div class="diff-wrapper">
    <div class="toggle-row">
      <label>
        <input type="checkbox" v-model="showOnlyChanges" />
        {{ $t('Показать только измененные строки') }}
      </label>
      <label style="margin-left: 20px;">
        <input type="checkbox" v-model="showOnlyChangedColumns" />
        {{ $t('Показать только изменённые столбцы') }}
      </label>
    </div>

    <div class="tables-row">
      <TableSide
        :columns="filteredColumns"
        :rows="filteredFilteredRows"
        side="left"
        :sideLabel="$t('Предыдущая версия таблицы')"
      />
      <TableSide
        :columns="filteredColumns"
        :rows="filteredFilteredRows"
        side="right"
        :sideLabel="$t('Новая версия таблицы')"
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
      normalStatuses: new Set(['normal', 'empty', 'line-number']),
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
    }
  }
};
</script>

<style scoped>
.diff-wrapper {
  padding: 10px;
  overflow-x: auto;
}

.toggle-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.toggle-row label {
  user-select: none;
}

.tables-row {
  display: flex;
  gap: 20px;
  min-width: 800px;
}
</style>
