<template>
  <div ref="content">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'modal',
  props: {
    title: String,
  },
  emits: ['confirm', 'cancel', 'update:show'],
  data: () => ({
    M: f.initModal(),
  }),
  mounted() {
    const m = this.M;

    m.show(this.title, this.$refs.content);

    m.btnConfirm.addEventListener('click', () => {
      this.$emit('confirm');
      this.$emit('update:show', false);
    });
    m.btnCancel.forEach(n => n.addEventListener('mouseup', () => {
      this.$emit('cancel');
      this.$emit('update:show', false);
    }));
  },
  unmounted() {
    this.M.hide();
    setTimeout(() => this.M.destroy(), 150);
  },
}

</script>
