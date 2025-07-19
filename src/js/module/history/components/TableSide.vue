<template>
  <div class="table-wrapper">
    <div class="table-title">{{ sideLabel }}</div>

    <div class="meta-info">
      <div v-for="(value, label) in metaInfo()" :key="label" class="meta-info__pair">
        <span class="meta-info__label">{{ $t(label) }}:</span>
        <span class="meta-info__value">{{ value }}</span>
      </div>
    </div>

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
    },
    meta: {
      type: Object,
      required: true
    }
  },
  methods: {
    cellClass(status) {
      const statusClasses = {
        'inserted': 'cell-inserted',
        'deleted': 'cell-deleted',
        'changed-old': 'cell-changed-old',
        'changed-new': 'cell-changed-new',
        'line-number': 'cell-line-number',
        'normal': '',
        'empty': ''
      };

      return statusClasses[status] || '';
    },
    metaInfo() {
      const userLogin = this.meta?.userId ? this.meta?.userLogin : 'Internal User'

      return {
        'Дата': this.meta?.createdAt || '-',
        'Логин': userLogin || '-'
      };
    }
  }

};
</script>

<style lang="scss" scoped>
@import "./../index.scss";

.table-wrapper {
  overflow: auto;
  max-height: 100%;

  .table-title {
    padding: rem(6) 0;
    font-weight: bold;
  }
}

.diff-table {
  border-collapse: collapse;

  font-size: rem(13);

  th, td {
    border: 1px solid #ccc;
    padding: rem(4) rem(8);
    white-space: nowrap;
    text-align: left;
  }

  thead th {
    background-color: #f5f5f5;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody tr td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
  }

  .index-cell {
    color: #999;
    text-align: center;
    background-color: #f5f5f5;
  }

  .cell-line-number {
    background-color: #f5f5f5;
  }

  // Стили для разных типов изменений
  .cell-inserted {
    background-color: #e6f9e6;
    color: #206f20;
    font-weight: 500;
  }

  .cell-deleted {
    background-color: #fde7e7;
    color: #a52222;
    font-weight: 500;
  }

  .cell-changed-old {
    background-color: #fff3e0;
    color: #e65100;
    font-weight: 500;
  }

  .cell-changed-new {
    background-color: #e8f5e9;
    color: #3c9a40;
    font-weight: 500;
  }
}

.meta-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: rem(16);
  font-size: rem(12);
  margin-bottom: rem(10);
  padding: rem(4) 0;
  color: #292929;

  &__label {
    font-weight: 600;
  }

  &__pair {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: rem(10);
  }
}

</style>
