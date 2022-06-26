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
  emits: ['confirm', 'cancel'],
  data: () => ({
    M: new f.Modal(),
  }),
  mounted() {
    const m = this.M = new f.Modal({});
    m.btnConfirm.addEventListener('click', () => {
      this.$emit('confirm');
    });

    m.show(this.title, this.$refs.content);
  },
  unmounted() {
    this.M.destroy();
  }
}

</script>
