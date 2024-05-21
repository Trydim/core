<template>
  <div class="" :style="style">
    <div @click="removeRow">Удалить</div>
    <div @click="addRow('before')">Добавить строку сверху</div>
    <div @click="addRow('after')">Добавить строку снизу</div>
  </div>
</template>

<script>

export default {
  name: 'ContextMenu',
  props: {
    rowIndex: Number,
    style: String,
  },
  emits: [''],
  computed: {

  },
  methods: {
    removeRow() {},
    addRow(position) {},
  },
}

</script>

