<template>
  <teleport to="body">
    <div class="context-menu" :style="positionStyle">
      <div class="context-menu__wrap">
        <div @click="removeRow">Удалить</div>
        <div @click="addRow('before')">Добавить строку вышу</div>
        <div @click="addRow('after')">Добавить строку ниже</div>
      </div>
    </div>
  </teleport>
</template>

<script>

export default {
  name: 'ContextMenu',
  props: {
    show: String,
    rowIndex: Number,
    style: Object,
  },
  emits: ['remove', 'addRow', 'update:show'],
  computed: {
    positionStyle() {
      const x = this.style.x - 85,
            y = this.style.bottom + 13;

      return `left: ${x}px; top: ${y}px`;
    }
  },
  methods: {
    removeRow() { this.$emit('remove') },
    addRow(position) { this.$emit('addRow', position) },

    close() {
      this.$emit('update:show', false);
    },
  },
  mounted() {
    setTimeout(() => {
      document.body.addEventListener('click', () => this.close(), {once: true});
      document.addEventListener('scroll', () => this.close(), {once: true});
    }, 100);
  },
}

</script>

