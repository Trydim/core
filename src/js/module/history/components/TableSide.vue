<template>
  <div class="table-wrapper">
    <div class="table-title">{{ sideLabel }}</div>
    <table class="diff-table">
      <thead>
      <tr>
        <th>#</th>
        <th v-for="col in columns" :key="col">
          {{ $t(col) }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, idx) in rows" :key="idx">
        <td class="index-cell">{{ idx + 1 }}</td>
        <td
          v-for="(cell, cidx) in row[side]"
          :key="cidx"
          :class="cellClass(cell.status)"
        >
          {{ cell.value }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TableSide',
  props: {
    columns: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    side: {
      type: String,
      required: true // ожидается "left" или "right"
    },
    sideLabel: {
      type: String,
      required: true
    }
  },
  methods: {
    cellClass(status) {
      switch (status) {
        case 'inserted':
          return 'cell-inserted';
        case 'deleted':
        case 'changed-old':
          return 'cell-deleted';
        case 'changed-new':
          return 'cell-inserted';
        default:
          return '';
      }
    }
  }
};
</script>

<style scoped>
.table-wrapper {
  overflow-y: auto;
}

.table-title {
  padding: 6px 12px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.diff-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

.diff-table th,
.diff-table td {
  border: 1px solid #ccc;
  padding: 4px 8px;
  white-space: nowrap;
  text-align: left;
}

thead th {
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.index-cell {
  color: #999;
  text-align: center;
}

.cell-inserted {
  background-color: #e6f9e6;
  color: #206f20;
}

.cell-deleted {
  background-color: #fde7e7;
  color: #a52222;
}
</style>
